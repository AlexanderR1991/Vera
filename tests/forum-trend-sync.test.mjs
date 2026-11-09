import assert from "node:assert/strict";
import test from "node:test";
import {collectForumTrends} from "../scripts/sync-forum-trends.mjs";

const now = new Date("2026-11-09T21:00:00.000Z");
const origin = "https://api.github.com/repos/AlexanderR1991/Vera";
const repository = {private: false, visibility: "public"};
const ago = hours => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
const issue = (number, title, extra = {}) => ({number, title, state: "open", locked: false,
  labels: [{name: "pinnwand"}], ...extra});
const comment = (number, id, hours, extra = {}) => ({issue_url: `${origin}/issues/${number}`,
  created_at: ago(hours), user: {type: "User", id, login: `user-${id}`}, body: "Keep this off the site", ...extra});
const response = (data, init) => Response.json(data, init);

function collect(fetcher) {
  return collectForumTrends({now, token: "test-only", fetcher});
}

test("ranks explicitly approved, mapped topics by distinct recent accounts and keeps only aggregate metadata", async () => {
  const issues = [
    issue(40, "[FORUM-justiz] Older conversation"),
    issue(41, "[FORUM-justiz] [FORUM-justiz/justice-case] Private details omitted"),
    issue(42, "[FORUM-kindererziehung] Recent conversation"),
    issue(43, "[FORUM-ernaehrung-und-verantwortung] Single eligible account"),
    issue(44, "[FORUM-die-bruecke] Unapproved", {labels: []}),
    issue(45, "[FORUM-die-bruecke] Closed", {state: "closed"}),
    issue(46, "[FORUM-die-bruecke] Locked", {locked: true}),
    issue(47, "[FORUM-die-bruecke] A pull request", {pull_request: {}}),
    issue(48, "[FORUM-justiz] [FORUM-justiz/unknown] Invalid scope"),
    issue(49, "[ALLTAG-liebe] Everyday question"),
    issue(50, "Someone merely mentioned [FORUM-die-bruecke]"),
    issue(51, "[FORUM-justiz] [FORUM-die-bruecke] Ambiguous scopes"),
    issue(64, "[Forum · MED-001] Existing registered issue")
  ];
  const comments = [
    comment(40, 1, 6), comment(40, 2, 7),
    comment(41, 1, 40), comment(41, 2, 25), comment(41, 3, 20),
    comment(42, 1, 12), comment(42, 1, 3), comment(42, 2, 4),
    comment(43, 1, 4), comment(43, 1, 2),
    comment(43, 4, 1, {user: {type: "Bot", id: 4, login: "bot"}}),
    comment(43, 5, 1, {user: {type: "User", id: 5, login: "worker[bot]"}}),
    comment(43, 6, 1, {performed_via_github_app: {id: 1}}),
    comment(43, 7, 1, {user: null}), comment(43, 8, -1), comment(43, 9, 72),
    comment(49, 1, 3), comment(49, 2, 4),
    comment(64, 1, 4), comment(64, 2, 5),
    ...[44, 45, 46, 47, 48, 50, 51].flatMap(number => [comment(number, 1, 1), comment(number, 2, 1)])
  ];
  const snapshot = await collect((url, request) => {
    assert.equal(request.method ?? "GET", "GET");
    assert.equal(request.headers.Authorization, "Bearer test-only");
    if (url.href === origin) return response(repository);
    if (url.pathname.endsWith("/issues")) {
      assert.equal(url.searchParams.get("labels"), "pinnwand");
      return response(issues);
    }
    assert.equal(url.pathname, new URL(origin + "/issues/comments").pathname);
    assert.equal(url.searchParams.get("since"), ago(72));
    return response(comments);
  });
  assert.deepEqual(snapshot, {version: 1, generatedAt: ago(0), trends: [
    {placeId: "justiz", sectionId: "justice-case", issueNumber: 41, participants: 3, lastActivityAt: ago(20)},
    {placeId: "kindererziehung", sectionId: "", issueNumber: 42, participants: 2, lastActivityAt: ago(3)},
    {placeId: "alltagsfragen", sectionId: "alltag-liebe", issueNumber: 49, participants: 2, lastActivityAt: ago(3)},
    {placeId: "medizin", sectionId: "pruefen", issueNumber: 64, participants: 2, lastActivityAt: ago(4)}
  ]});
});

test("follows bounded pages on GitHub and uses the second comment page to reach the threshold", async () => {
  const next = {headers: {link: `<${origin}/issues/comments?page=2>; rel="next"`}};
  const snapshot = await collect(url => {
    if (url.href === origin) return response(repository);
    const first = url.searchParams.get("page") === "1";
    if (url.pathname.endsWith("/issues")) {
      return first ? response([], next) : response([issue(90, "[FORUM-justiz] Example")]);
    }
    return first ? response([comment(90, 1, 8)], next) : response([comment(90, 2, 3)]);
  });
  assert.equal(snapshot.trends[0].participants, 2);
  assert.equal(snapshot.trends[0].lastActivityAt, ago(3));
});

test("withholds data if the repository is private or GitHub data is incomplete", async () => {
  const privateSnapshot = await collect(url => {
    assert.equal(url.href, origin);
    return response({private: true, visibility: "private"});
  });
  assert.deepEqual(privateSnapshot.trends, []);
  await assert.rejects(collect(() => response({}, {status: 403})), /403/);
  let pages = 0;
  await assert.rejects(collect(url => {
    if (url.href === origin) return response(repository);
    pages++;
    return response([], {headers: {link: `<${origin}/issues?page=2>; rel="next"`}});
  }), /page limit/);
  assert.equal(pages, 5);
});
