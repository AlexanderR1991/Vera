const hour = 60 * 60 * 1000;
const maxSnapshotAge = 8 * hour;
const activityWindow = 72 * hour;
const maxPins = 3;

function utcTimestamp(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return NaN;
  const timestamp = Date.parse(value);
  const normalized = value.length === 20 ? value.replace(/Z$/, ".000Z") : value;
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === normalized ? timestamp : NaN;
}

export function selectBoardTrends(feed, cards, now = Date.now()) {
  if (feed?.version !== 1 || !Array.isArray(feed.trends) || !Number.isFinite(now)) return [];
  const generatedAt = utcTimestamp(feed.generatedAt);
  const snapshotExpiresAt = generatedAt + maxSnapshotAge;
  if (!Number.isFinite(generatedAt) || generatedAt > now || snapshotExpiresAt <= now) return [];

  const ranked = [];
  for (const trend of feed.trends) {
    const {placeId, sectionId, issueNumber, participants, lastActivityAt} = trend ?? {};
    const activityAt = utcTimestamp(lastActivityAt);
    if (typeof placeId !== "string" || !placeId || typeof sectionId !== "string") continue;
    if (!Number.isSafeInteger(issueNumber) || issueNumber < 1) continue;
    if (!Number.isSafeInteger(participants) || participants < 2) continue;
    if (!Number.isFinite(activityAt) || activityAt > generatedAt || activityAt + activityWindow <= now) continue;
    ranked.push({placeId, sectionId, issueNumber, participants, activityAt});
  }
  ranked.sort((a, b) => b.participants - a.participants || b.activityAt - a.activityAt || a.issueNumber - b.issueNumber);

  const selected = [];
  const pinnedPlaces = new Set();
  for (const {placeId, sectionId, issueNumber, activityAt} of ranked) {
    if (pinnedPlaces.has(placeId)) continue;
    const matching = cards.filter(card => card.placeId === placeId);
    const card = matching.find(card => (card.sectionId ?? "") === sectionId)
      ?? matching.find(card => !card.sectionId)
      ?? matching[0];
    if (!card) continue;
    selected.push({cardId: card.id, issueNumber, expiresAt: Math.min(snapshotExpiresAt, activityAt + activityWindow)});
    pinnedPlaces.add(placeId);
    if (selected.length === maxPins) break;
  }
  return selected;
}
