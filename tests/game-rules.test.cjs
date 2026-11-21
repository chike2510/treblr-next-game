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
const careerPath = path.resolve(__dirname, '../src/lib/career-rules.ts');
const careerSource = fs.readFileSync(careerPath, 'utf8');
const careerCompiled = ts.transpile(careerSource, { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 });
const careerLoaded = new Module(careerPath, module);
careerLoaded.filename = careerPath;
careerLoaded.paths = Module._nodeModulePaths(path.dirname(careerPath));
careerLoaded._compile(careerCompiled, careerPath);
const career = careerLoaded.exports;
const tourPath = path.resolve(__dirname, '../src/lib/tour.ts');
const tourSource = fs.readFileSync(tourPath, 'utf8');
const tourCompiled = ts.transpile(tourSource, { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 });
const tourLoaded = new Module(tourPath, module);
tourLoaded.filename = tourPath;
tourLoaded.paths = Module._nodeModulePaths(path.dirname(tourPath));
tourLoaded._compile(tourCompiled, tourPath);
const tour = tourLoaded.exports;

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
assert.match(rules.opportunityBlockReason(festival, { ...state, energy: 10, currentLocation: 'Freedom Park Stage', time: '6:42 PM' }), /17 energy/);
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
const venue = tour.TOUR_VENUES.find(item => item.id === 'lagos-yard');
const releasedSongs = [{ ...song, status: 'RELEASED' }, { ...song, id: 'second-song', status: 'RELEASED', quality: 70 }];
const baseTour = tour.estimateTour({ songs: releasedSongs, city: 'Lagos', venue, ticketPrice: 25, fans: 482000, currentCity: 'Lagos', cityDemand: 50 });
const trainedTour = tour.estimateTour({ songs: releasedSongs, city: 'Lagos', venue, ticketPrice: 25, fans: 482000, currentCity: 'Lagos', cityDemand: 50, performance: 100 });
assert.ok(trainedTour.expectedSales >= baseTour.expectedSales && trainedTour.expectedSales <= Math.ceil(baseTour.expectedSales * 1.1));
assert.equal(baseTour.demand, trainedTour.demand, 'performance skill affects execution, not market-demand inputs');
assert.match(tour.validateTourInput({ songs: releasedSongs, city: 'Lagos', venue, ticketPrice: 25, energy: 0, money: 1000 }), /energy/);
assert.match(tour.validateTourInput({ songs: [{ ...song, status: 'DEMO' }], city: 'Lagos', venue, ticketPrice: 25, energy: 100, money: 1000 }), /released songs/);
const booked = { id: 'show-test', estimate: trainedTour, ticketPrice: 25 };
const showA = tour.resolveTour(booked, venue, 9, 50);
const showB = tour.resolveTour(booked, venue, 9, 50);
assert.deepEqual(showA, showB, 'tour outcome is seeded and repeatable for the same booking/day');
assert.equal(showA.demandAfter, 51, 'a completed show adds exactly one city-demand point');
assert.equal(rules.shouldExpireOpportunity(offer, 12), false);
assert.equal(rules.shouldExpireOpportunity(offer, 13), true);

assert.deepEqual(career.CAMPAIGN_CHANNELS.video, { cost: 420, energy: 12, reach: 18000, days: 2 });
const campaign = career.campaignPlan({ ...song, status: 'RELEASED' }, 'press', 7, 1, 482000, 72, 'campaign-test');
assert.equal(campaign.endDay, 7);
assert.equal(campaign.cost, career.CAMPAIGN_CHANNELS.press.cost, 'campaign price is a total, not a per-day multiplier');
assert.equal(campaign.energyCost, career.CAMPAIGN_CHANNELS.press.energy, 'campaign energy is a total, not a per-day multiplier');
assert.equal(campaign.expectedReach, career.campaignExpectedReach({ quality: 80 }, 'press', 482000, 72));
const businessBase = career.campaignExpectedReach({ quality: 80 }, 'press', 482000, 72);
const businessMax = career.campaignExpectedReach({ quality: 80 }, 'press', 482000, 72, 100);
assert.ok(businessMax >= businessBase && businessMax <= Math.ceil(businessBase * 1.05), 'business skill is bounded to a 5% campaign forecast bonus');
assert.ok(campaign.expectedReach > 0);
const campaignResult = career.resolveCampaign(campaign, { ...song, status: 'RELEASED' }, 482000, 72);
assert.ok(campaignResult.reach > 0 && campaignResult.fans > 0);
assert.equal(career.makeIndustryOffers(6, [{ ...song, status: 'RELEASED' }], 482000, 78).some((item) => item.kind === 'PRESS'), true);
const allOffers = career.makeIndustryOffers(6, [
  { ...song, id: 'r1', status: 'RELEASED' }, { ...song, id: 'r2', status: 'RELEASED' }, { ...song, id: 'r3', status: 'RELEASED' },
], 600000, 80);
assert.ok(allOffers.some((item) => item.kind === 'BRAND'), 'brand offers are not hidden by a four-item slice');
assert.ok(allOffers.some((item) => item.kind === 'COLLABORATION'), 'collaboration offers are generated');
assert.ok(allOffers.some((item) => item.kind === 'MANAGEMENT'), 'management offers are generated');
const work = career.dailyCareerWork(6, 78, []).find(item => item.type === 'WRITING');
assert.deepEqual(career.careerWorkOutcome(work, { SONGWRITING: 94 }), { skill: 'SONGWRITING', skillGain: 3, skillAfter: 97 });
assert.deepEqual(career.careerWorkOutcome({ ...work, skillReward: 5 }, { SONGWRITING: 99 }), { skill: 'SONGWRITING', skillGain: 1, skillAfter: 100 });
assert.equal(career.canAcceptIndustryOffer({ ...career.makeIndustryOffers(6, [{ ...song, status: 'RELEASED' }], 482000, 78).find((item) => item.kind === 'PRESS') }, 6, 1000, 10, 482000, 78, [{ ...song, status: 'RELEASED' }]), null);
assert.equal(career.buildAwards(6, [{ ...song, status: 'RELEASED', streams: 1000000 }], 482000, 78)[0].submissionStatus, 'ELIGIBLE');
assert.equal(career.awardDecision({ id: 'award', name: 'Test', category: 'Test', ceremonyDay: 10, eligibleSongId: song.id, submissionStatus: 'SUBMITTED', historyNote: '' }, { ...song, status: 'RELEASED', streams: 1000000 }, 482000, 78), 'NOMINATED');

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
const migratedLegacyAward = rules.migrateSaveData({ ...defaults, awards: [{ id: 'legacy', submissionStatus: 'SUBMITTED', historyNote: 'old' }] }, defaults, catalog);
assert.equal(migratedLegacyAward.awards[0].submissionStatus, 'ELIGIBLE', 'legacy auto-submitted awards require a fresh player decision');
const migratedLegacyCampaign = rules.migrateSaveData({ ...defaults, songCampaigns: [{ channel: 'video', cost: 840, energyCost: 24 }] }, defaults, catalog);
assert.equal(migratedLegacyCampaign.songCampaigns[0].cost, 420, 'legacy per-day campaign cost is normalized to the total');
assert.equal(migratedLegacyCampaign.songCampaigns[0].energyCost, 12, 'legacy per-day campaign energy is normalized to the total');
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
