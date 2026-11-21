import type { Song } from './game-rules';

export type CampaignChannel = 'video' | 'radio' | 'press' | 'interview' | 'creator' | 'live';
export type CampaignStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type SongCampaign = { id: string; songId: string; channel: CampaignChannel; status: CampaignStatus; startDay: number; durationDays: number; endDay: number; cost: number; energyCost: number; expectedReach: number; measuredReach: number; measuredFans: number; measuredStreams: number; createdOnDay: number; completedOnDay?: number };
export type AlbumProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'RELEASED' | 'CANCELLED';
export type AlbumProject = { id: string; title: string; songIds: string[]; focusTrackId?: string; status: AlbumProjectStatus; createdOnDay: number; targetReleaseDay?: number; budget: number; spent: number; quality: number };
export type IndustryOfferStatus = 'OPEN' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'COMPLETED';
export type IndustryOfferKind = 'LABEL' | 'PROMOTER' | 'PRESS' | 'BRAND' | 'COLLABORATION' | 'MANAGEMENT' | 'DISTRIBUTION' | 'FESTIVAL';
export type IndustryOffer = { id: string; kind: IndustryOfferKind; title: string; detail: string; status: IndustryOfferStatus; createdOnDay: number; expiresOnDay: number; requiredReputation: number; requiredFans: number; requiredSongId?: string; cashCost: number; cashReward: number; energyCost: number; fanReward: number; reputationReward: number; sourceDataKey: string; acceptedOnDay?: number; completedOnDay?: number };
export type AwardSubmissionStatus = 'ELIGIBLE' | 'SUBMITTED' | 'NOMINATED' | 'WON' | 'REJECTED';
export type AwardRecord = { id: string; name: string; category: string; ceremonyDay: number; eligibleSongId?: string; submissionStatus: AwardSubmissionStatus; submittedOnDay?: number; decidedOnDay?: number; historyNote: string };
export type CareerWorkType = 'SESSION' | 'WRITING' | 'PRODUCTION' | 'PROMO';
export type CareerWork = { id: string; type: CareerWorkType; title: string; status: 'AVAILABLE' | 'COMPLETED'; day: number; durationHours: number; energyCost: number; cashReward: number; reputationReward: number; skillReward: number };
export type TrainingSkill = 'VOCALS' | 'SONGWRITING' | 'PERFORMANCE' | 'BUSINESS' | 'PRODUCTION';
export type TrainingRecord = { id: string; skill: TrainingSkill; day: number; energyCost: number; cashCost: number; skillGain: number };

/** These are total campaign prices/energy budgets for the whole campaign, not daily rates. */
export const CAMPAIGN_CHANNELS: Record<CampaignChannel, { cost: number; energy: number; reach: number; days: number }> = {
  video: { cost: 420, energy: 12, reach: 18000, days: 2 }, radio: { cost: 300, energy: 8, reach: 14000, days: 2 }, press: { cost: 120, energy: 5, reach: 7000, days: 1 }, interview: { cost: 80, energy: 4, reach: 5500, days: 1 }, creator: { cost: 240, energy: 7, reach: 12000, days: 2 }, live: { cost: 180, energy: 15, reach: 10000, days: 1 },
};
const hash = (s: string) => { let v = 2166136261; for (let i = 0; i < s.length; i++) v = Math.imul(v ^ s.charCodeAt(i), 16777619); return (v >>> 0) / 4294967295; };
const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));

export function campaignExpectedReach(song: Pick<Song, 'quality'>, channel: CampaignChannel, fans: number, hype: number, businessSkill = 0) {
  const c = CAMPAIGN_CHANNELS[channel];
  const negotiation = 1 + clamp(businessSkill, 0, 100) * 0.0005; // At most +5% reach.
  return Math.max(500, Math.round((c.reach * (0.75 + song.quality / 200) * (1 + hype / 250) + fans * 0.01) * negotiation));
}
export function campaignPlan(song: Song, channel: CampaignChannel, startDay: number, durationDays: number, fans: number, hype: number, id: string, businessSkill = 0): SongCampaign {
  const c = CAMPAIGN_CHANNELS[channel];
  const duration = clamp(Math.floor(durationDays), 1, 3);
  return { id, songId: song.id, channel, status: 'PLANNED', startDay, durationDays: duration, endDay: startDay + duration - 1, cost: c.cost, energyCost: c.energy, expectedReach: campaignExpectedReach(song, channel, fans, hype, businessSkill), measuredReach: 0, measuredFans: 0, measuredStreams: 0, createdOnDay: startDay };
}
export function resolveCampaign(campaign: SongCampaign, song: Song, _fans: number, hype: number) { const factor = 0.84 + hash(`${campaign.id}:${campaign.endDay}`) * 0.28; const reach = Math.round(campaign.expectedReach * factor); const fansGained = Math.max(0, Math.round(reach * (0.025 + song.quality / 5000))); return { reach, fans: fansGained, streams: Math.round(reach * (0.18 + hype / 500)) }; }

export function makeIndustryOffers(day: number, songs: Song[], fans: number, reputation: number): IndustryOffer[] {
  const released = songs.filter(s => s.status === 'RELEASED'); const result: IndustryOffer[] = [];
  // IDs are deterministic by source, so completed/declined offers never resurrect or duplicate.
  if (released.length >= 2 && reputation >= 55) result.push({ id: `inbox-label-${released[0].id}`, kind: 'LABEL', title: 'Independent label conversation', detail: 'A label reached out after seeing the depth of your released catalogue.', status: 'OPEN', createdOnDay: day, expiresOnDay: day + 6, requiredReputation: 55, requiredFans: 100000, requiredSongId: released[0].id, cashCost: 0, cashReward: 1500, energyCost: 6, fanReward: 7000, reputationReward: 4, sourceDataKey: `${released.length}:${released[0].quality}` });
  if (fans >= 100000 && reputation >= 45) result.push({ id: 'inbox-promoter', kind: 'PROMOTER', title: 'Promoter showcase slot', detail: 'A promoter wants to put your current audience in a room.', status: 'OPEN', createdOnDay: day, expiresOnDay: day + 4, requiredReputation: 45, requiredFans: 100000, cashCost: 120, cashReward: 650, energyCost: 12, fanReward: 3500, reputationReward: 2, sourceDataKey: `${fans}:${reputation}` });
  if (released.length && released[0].quality >= 70) result.push({ id: `inbox-press-${released[0].id}`, kind: 'PRESS', title: `${released[0].title} press request`, detail: 'A music publication requested a conversation about a real release.', status: 'OPEN', createdOnDay: day, expiresOnDay: day + 5, requiredReputation: 40, requiredFans: 0, requiredSongId: released[0].id, cashCost: 0, cashReward: 180, energyCost: 4, fanReward: 1800, reputationReward: 2, sourceDataKey: `${released[0].id}:${released[0].quality}` });
  if (released.length && reputation >= 45) result.push({ id: `inbox-distribution-${released[0].id}`, kind: 'DISTRIBUTION', title: `${released[0].title} distribution inquiry`, detail: 'A distributor wants to widen the reach of a real released track.', status: 'OPEN', createdOnDay: day, expiresOnDay: day + 5, requiredReputation: 45, requiredFans: 0, requiredSongId: released[0].id, cashCost: 180, cashReward: 900, energyCost: 5, fanReward: Math.round(released[0].quality * 30), reputationReward: 2, sourceDataKey: released[0].id });
  if (fans >= 500000 && released.length >= 2) result.push({ id: 'inbox-brand', kind: 'BRAND', title: 'Catalog-led brand brief', detail: 'A brand brief references your actual listener momentum.', status: 'OPEN', createdOnDay: day, expiresOnDay: day + 7, requiredReputation: 60, requiredFans: 500000, cashReward: 2400, cashCost: 300, energyCost: 8, fanReward: 4000, reputationReward: 3, sourceDataKey: `${released.length}:${fans}` });
  if (released.length >= 1 && reputation >= 50) result.push({ id: `inbox-collab-${released[0].id}`, kind: 'COLLABORATION', title: `Collaboration around ${released[0].title}`, detail: 'An artist wants to build from a real track in your catalogue.', status: 'OPEN', createdOnDay: day, expiresOnDay: day + 5, requiredReputation: 50, requiredFans: 50000, requiredSongId: released[0].id, cashReward: 500, cashCost: 150, energyCost: 10, fanReward: 5000, reputationReward: 3, sourceDataKey: released[0].id });
  if (released.length >= 3 && reputation >= 70) result.push({ id: 'inbox-management', kind: 'MANAGEMENT', title: 'Management representation inquiry', detail: 'A manager requested a meeting after your catalogue crossed three releases.', status: 'OPEN', createdOnDay: day, expiresOnDay: day + 8, requiredReputation: 70, requiredFans: 250000, cashReward: 700, cashCost: 0, energyCost: 8, fanReward: 2500, reputationReward: 5, sourceDataKey: `${released.length}:${reputation}` });
  return result;
}
export function canAcceptIndustryOffer(o: IndustryOffer, day: number, money: number, energy: number, fans: number, reputation: number, songs: Song[]) { if (o.status !== 'OPEN') return 'This inbox offer is no longer open.'; if (day > o.expiresOnDay) return 'This inbox offer has expired.'; if (money < o.cashCost) return `You need $${o.cashCost.toLocaleString()} cash for this offer.`; if (energy < o.energyCost) return `You need ${o.energyCost} energy for this offer.`; if (fans < o.requiredFans) return `Requires ${o.requiredFans.toLocaleString()} fans.`; if (reputation < o.requiredReputation) return `Requires ${o.requiredReputation} reputation.`; if (o.requiredSongId && !songs.some(s => s.id === o.requiredSongId && s.status === 'RELEASED')) return 'The referenced release is no longer eligible.'; return null; }

export function eligibleAward(song: Song, fans: number, reputation: number) { return song.status === 'RELEASED' && song.quality >= 65 && (song.streams >= 50000 || fans >= 100000) && reputation >= 40; }
export function buildAwards(day: number, songs: Song[], fans: number, reputation: number): AwardRecord[] { const best = songs.filter(s => eligibleAward(s, fans, reputation)).sort((a, b) => b.quality - a.quality || b.streams - a.streams)[0]; return best ? [{ id: `award-breakthrough-${day}`, name: 'Lagos Independent Music Awards', category: 'Breakthrough Recording', ceremonyDay: day + 5, eligibleSongId: undefined, submissionStatus: 'ELIGIBLE', historyNote: `Eligible release available: ${best.title}. Player decision required before ceremony.` }] : []; }
export function awardDecision(_a: AwardRecord, song: Song | undefined, fans: number, reputation: number): AwardSubmissionStatus { if (!song || !eligibleAward(song, fans, reputation)) return 'REJECTED'; const score = song.quality + Math.min(20, Math.floor(song.streams / 100000)) + Math.floor(reputation / 10); return score >= 100 ? 'WON' : score >= 82 ? 'NOMINATED' : 'REJECTED'; }

export function dailyCareerWork(day: number, reputation: number, songs: Song[]): CareerWork[] { const released = songs.filter(s => s.status === 'RELEASED').length; const jobs: CareerWork[] = [
  { id: `work-session-${day}`, type: 'SESSION', title: 'Backing vocal session', status: 'AVAILABLE', day, durationHours: 3, energyCost: 10, cashReward: 180 + released * 20, reputationReward: 1, skillReward: 2 },
  { id: `work-writing-${day}`, type: 'WRITING', title: 'Co-write for a local act', status: 'AVAILABLE', day, durationHours: 4, energyCost: 12, cashReward: 240 + Math.floor(reputation * 2), reputationReward: 2, skillReward: 3 },
  { id: `work-promo-${day}`, type: 'PROMO', title: 'Community radio guest slot', status: 'AVAILABLE', day, durationHours: 2, energyCost: 6, cashReward: 90, reputationReward: 2, skillReward: 2 },
]; return jobs; }

export function careerWorkOutcome(job: CareerWork, skills: Partial<Record<TrainingSkill, number>>) {
  const skill: TrainingSkill = job.type === 'SESSION' ? 'VOCALS' : job.type === 'WRITING' ? 'SONGWRITING' : job.type === 'PRODUCTION' ? 'PRODUCTION' : 'BUSINESS';
  const before = clamp(skills[skill] ?? 0, 0, 100);
  const skillGain = Math.min(Math.max(0, job.skillReward), 100 - before);
  return { skill, skillGain, skillAfter: before + skillGain };
}

export const TRAINING_COSTS: Record<TrainingSkill, { cash: number; energy: number }> = { VOCALS: { cash: 70, energy: 8 }, SONGWRITING: { cash: 60, energy: 7 }, PERFORMANCE: { cash: 80, energy: 10 }, BUSINESS: { cash: 50, energy: 5 }, PRODUCTION: { cash: 90, energy: 9 } };
