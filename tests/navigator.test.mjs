import test from "node:test";
import assert from "node:assert/strict";
import {connections, findConnections, assessConnection, buildNavigatorNote} from "../src/lib/navigator.mjs";
import {topics} from "../src/lib/tree.mjs";

const allYes = connection => ({
  ...Object.fromEntries(connection.conditions.map(item => [item.id, "yes"])),
  ...(connection.id === "distribution" ? {mean: "5", minimum: "4"} : {})
});

test("keyword suggestions remain limited candidates, including contradictory prose", () => {
  for (const query of ["", "  ", null, 42, [], "Die Galaxie enthält dunkle Materie."]) assert.deepEqual(findConnections(query), []);
  assert.equal(findConnections("Ich schaffe meine Aufgaben in acht Stunden nicht.")[0].id, "capacity");
  assert.equal(findConnections("Meine Aufgaben passen problemlos in acht Stunden.")[0].id, "capacity");
  assert.equal(assessConnection("capacity", {}).status, "needs_context");
  assert.equal(findConnections("Do I have enough time for my tasks?", "en")[0].id, "capacity");
  assert.equal(findConnections("Welche Unterstützung ist gewünscht?")[0].id, "help");
  assert.ok(findConnections("Aufgaben, Beobachtung, Durchschnitt, Hilfe.").length <= 3);
  assert.deepEqual(findConnections("Gemeinsam handeln wir morgen."), []); // “mean” inside a word is not a match.
});

test("changing one decisive premise changes the result for every connection", () => {
  for (const connection of connections) {
    const firstCase = allYes(connection);
    assert.deepEqual(assessConnection(connection.id, firstCase), {status: "conditional", missing: [], failed: []});
    for (const condition of connection.conditions) {
      const secondCase = {...firstCase, [condition.id]: "no"};
      assert.deepEqual(assessConnection(connection.id, secondCase), {status: "not_applicable", missing: [], failed: [condition.id]});
      assert.equal(firstCase[condition.id], "yes");
    }
  }
});

test("unknown time estimates, alternative explanations and preferences prompt clarification", () => {
  const cases = [["capacity", "exceeds"], ["interpretation", "alternative_possible"], ["distribution", "mean_only"], ["help", "preferences_known"]];
  for (const [id, premise] of cases) {
    const connection = connections.find(item => item.id === id);
    const unknown = {...allYes(connection), [premise]: "unknown"};
    assert.deepEqual(assessConnection(id, unknown), {status: "needs_context", missing: [premise], failed: []});
    delete unknown[premise];
    assert.equal(assessConnection(id, unknown).status, "needs_context");
  }
});

test("the same threshold may be ruled out, follow, or allow two allocations with the same mean", () => {
  const card = connections.find(item => item.id === "distribution");
  const note = (mean, minimum, lang = "de") => buildNavigatorNote({connectionId: card.id, lang, answers: {...allYes(card), mean, minimum}});
  assert.equal(card.version, 2);
  assert.match(note("3", "4"), /Ausgeschlossen\. Wäre jede Menge mindestens 4, läge auch ihr Durchschnitt bei mindestens 4\. Er beträgt aber nur 3\./);
  assert.match(note("5", "4"), /Erhalten alle 5, erreichen alle die Schwelle 4\. Ändere zwei Mengen auf 0 und 10\. Alle übrigen behalten 5/);
  assert.match(note("4", "4"), /Erhalten alle 4, erreichen alle die Schwelle 4\. Ändere zwei Mengen auf 0 und 8/);
  assert.match(note("3", "0", "en"), /The claim follows\. Every amount meets the minimum of zero/);
  assert.match(note("0", "0"), /Die Aussage folgt/);
  assert.match(note("0", "0,5"), /Ausgeschlossen\. Wäre jede Menge mindestens 0,5, läge auch ihr Durchschnitt bei mindestens 0,5\. Er beträgt aber nur 0\./);
  assert.match(note("0.10000000000000001", "0.10000000000000002", "en"), /Ruled out\. If every amount were at least 0\.10000000000000002,.*The mean is only 0\.10000000000000001/);
  const english = note("5.5", "4.5", "en");
  assert.match(english, /Give everyone 5\.5 and everyone meets the minimum of 4\.5\. Change two amounts to 0 and 11/);
  assert.match(english, /Exact mean — 5\.5/);
  assert.match(english, /distribution, v2/);
});

test("missing figures, unsupported quantities and unresolved model assumptions cannot establish two possible outcomes", () => {
  const card = connections.find(item => item.id === "distribution");
  for (const bad of ["", "-1", "3…", "1.2.3", "1e2", "  ", "3".repeat(33), Infinity, null, undefined]) {
    const answers = {...allYes(card), mean: bad};
    assert.deepEqual(assessConnection(card.id, answers), {status: "needs_context", missing: ["mean"], failed: []});
    assert.doesNotMatch(buildNavigatorNote({connectionId: card.id, answers}), /Unter deinen Angaben sind beide Antworten möglich|Ausgeschlossen\. Wäre jede Menge/);
  }
  for (const flag of ["unknown", "no"]) {
    const answers = {...allYes(card), mean_only: flag};
    assert.notEqual(assessConnection(card.id, answers).status, "conditional");
    assert.equal(assessConnection(card.id, {...answers, mean: "3"}).status, "conditional");
    assert.equal(assessConnection(card.id, {...answers, minimum: "0"}).status, "conditional");
    assert.doesNotMatch(buildNavigatorNote({connectionId: card.id, answers, lang: "en"}), /Both answers are possible under your stated conditions/);
  }
});

test("one failed premise prevents transfer even when another premise is unknown", () => {
  assert.deepEqual(assessConnection("capacity", {same_period: "yes", no_overlap: "no"}), {status: "not_applicable", missing: ["exceeds"], failed: ["no_overlap"]});
});

test("invalid answers and inherited or foreign keys cannot establish applicability", () => {
  const connection = connections[0];
  for (const answers of [null, [], "yes", 1, {...allYes(connection), exceeds: true}, {...allYes(connection), exceeds: "probably"}]) assert.equal(assessConnection(connection.id, answers).status, "invalid");
  assert.equal(assessConnection("absent", {}).status, "invalid");
  assert.equal(assessConnection(connection.id, {approved: "yes", review_status: "reviewed"}).status, "needs_context");
  assert.equal(assessConnection(connection.id, Object.create(allYes(connection))).status, "needs_context");
  assert.deepEqual(assessConnection(connection.id, {...allYes(connection), extra: "unknown"}), {status: "conditional", missing: [], failed: []});
});

test("cards preserve claim types, draft status and existing topic references", () => {
  assert.equal(connections.length, 4);
  const topicIds = new Set(topics.map(topic => topic.id));
  assert.equal(new Set(connections.map(connection => connection.id)).size, connections.length);
  for (const connection of connections) {
    assert.equal(connection.reviewStatus, "draft");
    assert.ok(["formal", "normative"].includes(connection.type));
    assert.ok(connection.topics.every(topic => topicIds.has(topic)));
    assert.ok(connection.sources.every(source => new URL(source.url).protocol === "https:"));
    assert.equal(new Set(connection.conditions.map(condition => condition.id)).size, connection.conditions.length);
    for (const field of ["title", "question", "pattern", "principle", "scope", "rationale", "counterargument", "revision", "conclusion", "nextStep"]) for (const lang of ["de", "en"]) assert.ok(connection[field][lang].trim().length > 0);
    assert.equal(assessConnection(connection.id, allYes(connection)).status, "conditional");
    assert.equal(connection.reviewStatus, "draft");
  }
  const help = connections.find(connection => connection.id === "help");
  assert.equal(help.type, "normative");
  assert.deepEqual(help.sourceClaim, {id: "G-005", version: 2});
  assert.match(help.scope.en, /does not mean necessary care should be withheld/);
  assert.match(help.principle.de, /nicht von erreichbarer Selbstständigkeit/);
  assert.match(help.rationale.en, /not a universal instruction or empirical proof/);
  assert.throws(() => {help.reviewStatus = "reviewed";}, TypeError);
});

test("export records self-reported premises, source versions and private reflection", () => {
  const connection = connections[0];
  const note = buildNavigatorNote({lang: "de", question: "Zwölf Stunden in acht?", connectionId: connection.id, answers: allYes(connection), reflection: {goal: "Zeit für die Familie", observation: "12 Stunden", interpretation: "Vielleicht zu viel", feeling: "Sorge", wish: "Entlastung", action: "Umfang klären", expected: "Weniger Aufgaben", observed: "Noch offen", revision: "Morgen prüfen"}});
  assert.match(note, /capacity, v1/);
  assert.match(note, /Formal/);
  assert.match(note, /Bedingt anwendbarer Vorschlag · kein Wahrheitssiegel/);
  assert.match(note, /eigene Angaben, keine unabhängig geprüften Tatsachen/);
  assert.match(note, /Ja, von mir angegeben/);
  assert.ok(note.includes(connection.conclusion.de));
  assert.ok(note.includes(connection.sources[0].url));
  for (const value of ["Zeit für die Familie", "12 Stunden", "Vielleicht zu viel", "Sorge", "Entlastung", "Umfang klären", "Weniger Aufgaben", "Noch offen", "Morgen prüfen"]) assert.ok(note.includes(value));
});

test("an alternative framing is exported alongside the original question even without a card", () => {
  for (const [lang, label] of [["de", "Andere Formulierung"], ["en", "Alternative wording"]]) {
    const input = {lang, question: "Original wording", alternativeQuestion: "Whose assumptions are missing?"};
    const note = buildNavigatorNote(input);
    assert.ok(note.includes(input.question));
    assert.ok(note.includes(label + ":\n" + input.alternativeQuestion));
    assert.ok(!buildNavigatorNote({...input, alternativeQuestion: " "}).includes(label));
    const withCard = {...input, connectionId: "capacity"};
    const caseLabel = lang === "en" ? "Case wording: " : "Fallbezug: ";
    assert.ok(buildNavigatorNote({...withCard, framing: "alternative"}).includes(caseLabel + label + " · " + input.alternativeQuestion));
    assert.ok(buildNavigatorNote({...withCard, framing: "original"}).includes(caseLabel + (lang === "en" ? "Original question" : "Ausgangsfrage") + " · " + input.question));
    assert.match(buildNavigatorNote(withCard), /keine Frageformulierung zugeordnet|No wording assigned/);
  }
});

test("failed or incomplete transfers never export a derived action recommendation", () => {
  const connection = connections[0];
  for (const answers of [{}, {...allYes(connection), no_overlap: "no"}, {...allYes(connection), no_overlap: true}]) {
    const note = buildNavigatorNote({lang: "en", question: "My tasks", connectionId: connection.id, answers});
    assert.ok(!note.includes(connection.conclusion.en));
    assert.ok(!note.includes(connection.nextStep.en));
    assert.match(note, /No action recommendation is currently derived/);
  }
});

test("export handles unknown selection and hostile-looking text as plain personal text", () => {
  const question = "<script>alert(1)</script>\nUnicode: Würde — 自由";
  const note = buildNavigatorNote({lang: "en", question, connectionId: "missing", reflection: {goal: question, ignored: "MUST_NOT_APPEAR"}});
  assert.ok(note.includes(question));
  assert.match(note, /No valid connection assessment/);
  assert.ok(!note.includes("MUST_NOT_APPEAR"));
  assert.match(buildNavigatorNote(null), /Keine gültige Verbindungsprüfung/);
});
