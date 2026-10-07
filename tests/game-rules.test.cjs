const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const sourcePath = path.resolve(__dirname, '../src/lib/game-rules.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpile(source, { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 });
const loaded = new Module(sourcePath, module);
loaded.filename = sourcePath;
loaded.paths = Module._nodeModulePaths(path.dirname(sourcePath));
loaded._compile(compiled, sourcePath);
const rules = loaded.exports;

const song = { id: 'test-song', title: 'Blue Hour', genre: 'Afro-fusion', mood: 'Midnight', bpm: 100, quality: 80, streams: 0, status: 'FINISHED', producer: 'Teo Park', campaign: 'community', marketingBudget: 300 };
const offer = { id: 'test-offer', type: 'LIVE', title: 'Test show', detail: '', cost: 420, city: 'Lagos', expiresOnDay: 12, tone: 'gold', effects: { cash: 3200, fans: 50000, hype: 7, reputation: 4, energy: -17 } };

assert.equal(rules.canTransitionSong('IDEA', 'DEMO'), true);
assert.equal(rules.canTransitionSong('DEMO', 'FINISHED'), true);
assert.equal(rules.canTransitionSong('IDEA', 'RELEASED'), false, 'an idea cannot skip the lifecycle');
assert.equal(rules.canTransitionSong('DEMO', 'SCHEDULED'), false, 'a demo cannot skip finishing');
assert.equal(rules.canTransitionSong('SCHEDULED', 'RELEASED'), true);
assert.equal(rules.canTransitionSong('RELEASED', 'ARCHIVED'), false);

const state = { currentCity: 'Lagos', day: 6, money: 4320, reputation: 78, songs: [song] };
assert.equal(rules.opportunityBlockReason(offer, state), null);
assert.match(rules.opportunityBlockReason(offer, { ...state, currentCity: 'Atlanta' }), /Travel to Lagos/);
assert.match(rules.opportunityBlockReason(offer, { ...state, day: 13 }), /expired/);
assert.match(rules.opportunityBlockReason(offer, { ...state, money: 100 }), /need \$420/);
assert.match(rules.opportunityBlockReason({ ...offer, requirements: { songStatus: 'DEMO' } }, state), /Requires a demo/);
const festival = { ...offer, location: 'Freedom Park Stage', availableFrom: '4:00 PM', availableUntil: '10:00 PM' };
assert.match(rules.opportunityBlockReason(festival, { ...state, currentLocation: 'The Apartment', time: '6:42 PM' }), /Head to Freedom Park Stage/);
assert.match(rules.opportunityBlockReason(festival, { ...state, currentLocation: 'Freedom Park Stage', time: '3:30 PM' }), /Available 4:00 PM/);
assert.equal(rules.opportunityBlockReason(festival, { ...state, currentLocation: 'Freedom Park Stage', time: '6:42 PM' }), null);
assert.match(rules.opportunityBlockReason({ ...offer, requirements: { minReputation: 60, songStatus: 'RELEASED' } }, state), /Requires a released/);
assert.deepEqual(rules.localRoute('apartment', 'venue', 'walk'), { fare: 0, minutes: 54, energy: 15, mode: 'Walk' });
assert.deepEqual(rules.localRoute('apartment', 'venue', 'danfo'), { fare: 7, minutes: 40, energy: 0, mode: 'Danfo' });
assert.equal(rules.localRoute('apartment', 'apartment', 'ride-hailing').fare, 0);
assert.equal(rules.addClockMinutes('6:42 PM', 19), '7:01 PM');
assert.equal(rules.timeInWindow('9:15 PM', '4:00 PM', '10:00 PM'), true);
assert.equal(rules.timeInWindow('10:30 PM', '4:00 PM', '10:00 PM'), false);
assert.deepEqual(rules.socialPostRequirements('YouTube', 'interview'), { cash: 80, energy: 5, reach: 4200 });
assert.deepEqual(rules.socialPostRequirements('TikTok', 'snippet'), { cash: 0, energy: 6, reach: 16800 });
const applied = rules.applyOpportunityEffects({ money: 4320, fans: 1000, hype: 72, reputation: 78, energy: 73 }, offer);
assert.deepEqual(applied, { money: 7100, fans: 51000, hype: 79, reputation: 82, energy: 56 });
assert.equal(offer.effects.cash, 3200);
assert.equal(applied.money, 4320 - offer.cost + offer.effects.cash, 'displayed reward inputs and applied cash must be the same object values');

const forecast = rules.campaignForecast(song, 482000, 72, 'Afro-fusion');
const release = rules.resolveRelease(song, 482000, 72, 'Afro-fusion', 7);
assert.ok(forecast > 0);
assert.ok(release.streams >= Math.floor(forecast * 0.9) && release.streams <= Math.ceil(forecast * 1.1));
assert.ok(release.newFans > 0 && release.royalties > 0);
assert.ok(rules.simulateDailyStreams({ ...song, status: 'RELEASED' }, 482000, 72, 7) > 0);
assert.equal(rules.shouldExpireOpportunity(offer, 12), false);
assert.equal(rules.shouldExpireOpportunity(offer, 13), true);

const catalog = [offer];
const defaults = { artist: { name: 'Candelar' }, money: 4320, bank: 28000, fans: 482000, monthlyListeners: 482000, energy: 73, day: 6, songs: [], opportunities: catalog, relationships: [], wardrobe: [], equippedLook: 'city-basics', notifications: [], posts: [], ledger: [], history: [], eventNight: null, passes: [], memories: [] };
const serialized = JSON.stringify({ ...defaults, money: 999, day: 9, songs: [{ ...song, status: 'DEMO' }], opportunities: [{ id: 'test-offer', reward: 'stale legacy copy' }], history: [{ title: 'Saved story' }] });
const restored = JSON.parse(serialized);
const migrated = rules.migrateSaveData(restored, defaults, catalog);
assert.equal(migrated.money, 999);
assert.equal(migrated.day, 9);
assert.equal(migrated.songs[0].status, 'DEMO');
assert.deepEqual(migrated.wardrobe, []);
assert.equal(migrated.equippedLook, 'city-basics');
assert.deepEqual(migrated.opportunities, catalog, 'legacy opportunity display text is replaced with canonical reward data');
assert.equal(migrated.history[0].title, 'Saved story');
assert.equal(migrated.eventNight, null, 'older saves receive a clean empty event-night state');
assert.deepEqual(migrated.passes, [], 'older saves receive an empty local pass wallet');
assert.deepEqual(migrated.memories, [], 'older saves receive an empty memory archive');
assert.equal(rules.migrateSaveData(null, defaults, catalog), defaults);

const savedNight = {
  ...defaults,
  eventNight: { eventId: 'festival', stage: 'arrived', people: ['Maya Ellis', 'Unknown'], mood: 'social', budget: 900, day: 8, sharedAt: '6:42 PM', ride: { mode: 'danfo', fare: 7, minutes: 40, from: 'The Apartment', arrivalTime: '7:22 PM' } },
  passes: [{ id: 'pass-1', eventId: 'festival' }],
  memories: [{ id: 'memory-1', passId: 'pass-1', eventId: 'festival', note: 'A saved moment' }],
};
const restoredNight = rules.migrateSaveData(savedNight, defaults, catalog);
assert.equal(restoredNight.eventNight.stage, 'arrived');
assert.deepEqual(restoredNight.eventNight.people, ['Maya Ellis', 'Unknown']);
assert.equal(restoredNight.eventNight.ride.arrivalTime, '7:22 PM');
assert.equal(restoredNight.passes[0].id, 'pass-1');
assert.equal(restoredNight.memories[0].note, 'A saved moment');
const invalidNight = rules.migrateSaveData({ ...savedNight, eventNight: { ...savedNight.eventNight, stage: 'teleported' } }, defaults, catalog);
assert.equal(invalidNight.eventNight, null, 'unsupported event-night stages fall back to the safe default');

console.log('Game rules: lifecycle, context-gated opportunities, local routes, shared social costs, releases, deadlines, and save/reload migration passed.');
