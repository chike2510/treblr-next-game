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
const defaults = { artist: { name: 'Candelar' }, money: 4320, bank: 28000, fans: 482000, monthlyListeners: 482000, energy: 73, day: 6, songs: [], opportunities: catalog, relationships: [], notifications: [], posts: [], ledger: [], history: [] };
const serialized = JSON.stringify({ ...defaults, money: 999, day: 9, songs: [{ ...song, status: 'DEMO' }], opportunities: [{ id: 'test-offer', reward: 'stale legacy copy' }], history: [{ title: 'Saved story' }] });
const restored = JSON.parse(serialized);
const migrated = rules.migrateSaveData(restored, defaults, catalog);
assert.equal(migrated.money, 999);
assert.equal(migrated.day, 9);
assert.equal(migrated.songs[0].status, 'DEMO');
assert.deepEqual(migrated.opportunities, catalog, 'legacy opportunity display text is replaced with canonical reward data');
assert.equal(migrated.history[0].title, 'Saved story');
assert.equal(rules.migrateSaveData(null, defaults, catalog), defaults);

console.log('Game rules: lifecycle, opportunity checks/rewards, release simulation, deadlines, and save/reload migration passed.');
