import project from "../../public/project.json" with {type:"json"};
import claims from "../../public/knowledge/claims.json" with {type:"json"};
import claimThreads from "../../public/knowledge/forum-threads.json" with {type:"json"};
import everyday from "../../public/knowledge/everyday-questions.json" with {type:"json"};
import esoterik from "../../public/knowledge/esoterik-tree.json" with {type:"json"};
import universal from "../../public/knowledge/universal-questions.v1.json" with {type:"json"};
import artworks from "../../public/knowledge/art-works.v1.json" with {type:"json"};
import {cards} from "./play-cards.mjs";
import {selfReviews, topics} from "./tree.mjs";
import {ui} from "./ui.mjs";

const pair = (de, en) => ({de, en});
const section = (id, de, en, context) => ({
  id,
  anchors: pair(id, id),
  title: pair(de, en),
  ...context
});

export const forumGroups = {
  life: pair("Alltag und Zusammenleben", "Daily life and living together"),
  knowledge: pair("Wissen, Kunst und Weltbilder", "Knowledge, art and worldviews"),
  method: pair("Prüfen und Verstehen", "Inquiry and understanding"),
  project: pair("Vera mitgestalten", "Shaping Vera")
};

const threadByClaim = new Map(claimThreads.threads.map(({claim_id, issue_number}) => [claim_id, issue_number]));
const esotericAnchor = id => "ast-" + id.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const sections = {
  index: [
    section("fragen", "Eine eigene Frage", "A question of your own", {anchors: pair("frag-mich", "ask-me")}),
    section("pinnwand", "Die Fragen auf der Pinnwand", "The questions on the pinboard", {anchors: pair("leben", "life")})
  ],
  gespraechsspiegel: [
    section("spiegel-korrigieren", "Eine Deutung des Spiegels prüfen", "Challenge the mirror’s reading", {
      prompt: pair("Welchen Beitrag würdest du anders lesen und was würde sich im Spiegel ändern?", "Which reply would you read differently, and what would that change in the mirror?")
    })
  ],
  obsidian: [
    section("note-feedback", "Was müsste die Verbindung können?", "What would make this connection useful?")
  ],
  alltagsfragen: everyday.questions.map(entry => ({
    id: "alltag-" + entry.id,
    anchors: pair("alltag-" + entry.id, "alltag-" + entry.id),
    title: entry.question,
    prompt: entry.challenge,
    everydayId: entry.id
  })),
  justiz: [
    section("justice-case", "Der Kratzer im Boden", "The scratch on the floor", {
      prompt: pair("Was müsste jemand hören und prüfen können, bevor über den Schaden entschieden wird?", "What should someone be able to hear and examine before a decision about the damage is made?")
    }),
    section("justice-questions", "Kriterien für ein faires Verfahren", "What makes a trial fair", {
      prompt: pair("Welche Hürde kann verhindern, dass jemand einen fairen Einwand vorbringt?", "What barrier could stop someone from raising a fair objection?")
    })
  ],
  kindererziehung: [
    section("parenting-compare", "Zwei Situationen auf dem Spielplatz", "Two playground situations", {
      prompt: pair("Was ändert sich, wenn auf dem Spielplatz plötzlich eine Gefahr auftaucht?", "What changes when a danger suddenly appears in the playground?")
    }),
    section("parenting-challenge", "Die Grenze der Entscheidung", "The limits of deciding for a child", {
      prompt: pair("Wie kannst du einem Kind erklären, warum es diesmal nicht selbst entscheiden kann?", "How could you explain to a child why they cannot make this decision themselves this time?")
    })
  ],
  streiten: [
    section("streit-beispiel", "Nach zehn in der WG", "After ten in a shared flat", {
      prompt: pair("Wie würdest du die Bitte formulieren, wenn ihr euch unterschiedlich an den Abend erinnert?", "How would you make the request if you both remember the evening differently?")
    }),
    section("streit-offen", "Was darf offenbleiben?", "What can stay unresolved?", {
      prompt: pair("Woran merkst du bei einem offenen Streit, dass dein Einwand angekommen ist?", "How can you tell your objection was heard when a disagreement is still open?")
    })
  ],
  "welt-mathematisch-abbilden": [
    section("modell-beispiel", "Zwei Wege zur Bibliothek", "Two routes to the library", {
      prompt: pair("Welche Beobachtung könnte ändern, welchen Weg dir die Karte zeigt?", "What observation could change which route the map shows you?")
    }),
    section("modell-grenzen", "Was in der Karte fehlt", "What the map leaves out", {
      prompt: pair("Was müsste die Karte zusätzlich zeigen, damit du dich auf sie verlassen kannst?", "What else would the map need to show before you could rely on it?")
    })
  ],
  medizin: [
    section("cast", "Was das EKG offenließ", "What the ECG left unanswered"),
    section("regel", "Was Messwerte belegen", "What measurements establish"),
    section("pruefen", "Die Aussage prüfen", "Examine the claim", {thread: threadByClaim.get("MED-001")})
  ],
  "ernaehrung-und-verantwortung": [
    section("evidenz", "Ernährung und Belege", "Nutrition and evidence"),
    section("konflikte", "Zielkonflikte beim Essen", "Trade-offs around food"),
    section("pruefverfahren", "Eine Entscheidung prüfen", "Examine a decision")
  ],
  "militaer-und-verantwortung": [
    section("grenzen", "Grenzen militärischer Gewalt", "Limits on military force"),
    section("zielkonflikte", "Militärische Zielkonflikte", "Military trade-offs"),
    section("ki", "KI und Gewalt", "AI and force")
  ],
  "warum-liebe-wirkt": [
    section("befunde", "Was die Forschung nahelegt", "What the research suggests"),
    section("hypothesen", "Hypothesen zu Fürsorge", "Hypotheses about care"),
    section("gegenmodelle", "Gegenmodelle und Grenzen", "Countermodels and limits")
  ],
  "politik-die-dem-menschen-dient": [
    section("garten", "Wem gehört der Garten?", "Whose garden is it?"),
    section("zielkonflikte", "Politische Zielkonflikte", "Political trade-offs"),
    section("ki-und-macht", "KI und politische Macht", "AI and political power")
  ],
  "bruecken-zwischen-den-religionen": [
    section("dialogregeln", "Regeln für den Dialog", "Rules for dialogue"),
    section("theologie-fragen", "Offene Glaubensfragen", "Open questions of belief")
  ],
  "kunst-und-erkenntnis": [
    section("werk", "Ein Kunstwerk betrachten", "Looking at an artwork"),
    section("forschung", "Kunst und überprüfbare Fragen", "Art and testable questions"),
    ...artworks.works.map(work => ({
      id: work.id, anchors: pair(work.id, work.id), title: work.title, prompt: work.encounter
    }))
  ],
  schnittmengen: [
    section("fragen", "Sechs Gesprächsfragen", "Six conversation questions"),
    section("vermittlung", "Eine Vermittlung ausprobieren", "Try a mediation exercise"),
    section("grenzen", "Grenzen der Vermittlung", "Limits of mediation"),
    section("pruefung", "Die Vermittlung prüfen", "Examine the mediation")
  ],
  "philosophischer-motor": [
    section("motor-ebenen", "Die sechs Ebenen des Motors", "The engine’s six layers"),
    section("rechenbeispiele", "Fiktive Rechenbeispiele", "Fictional worked examples"),
    section("innere-wege", "Die Mathematik der inneren Wege", "The mathematics of the paths we see")
  ],
  "die-bruecke": [
    section("experiment", "Verstehen und Zustimmung", "Understanding and agreement"),
    section("forschungsfrage", "Nachfragen oder Überreden?", "Asking or persuading?")
  ],
  aussagen: [
    ...claims.claims.map(claim => ({
      id: claim.id, anchors: pair(claim.id, claim.id), title: claim.statement, thread: threadByClaim.get(claim.id)
    })),
    section("erkenntnisreife", "Erkenntnisreife und Prüfstatus", "Evidence maturity and review status")
  ],
  "baum-des-wissens": [
    section("ebenen", "Sechs Ebenen gemeinsamer Arbeit", "Six levels of shared work"),
    section("querverbindungen", "Querverbindungen", "Cross-connections"),
    ...topics.map(topic => {
      const id = "ast-" + topic.id;
      return {id, anchors: pair(id, id), title: topic.name, prompt: topic.question};
    }),
    section("verbinden", "Äste miteinander verbinden", "Connect different branches"),
    ...selfReviews.map(review => ({
      id: review.id, anchors: pair(review.id, review.id), title: review.name,
      prompt: review.questions[0], thread: Number(review.url.split("/").at(-1))
    }))
  ],
  "esoterik-katalog": [
    section("pruefwege", "Prüfwege", "Ways to examine claims"),
    ...esoterik.branches.flatMap(branch => [branch, ...branch.children]).map(entry => {
      const id = esotericAnchor(entry.id);
      return {id, anchors: pair(id, id), title: entry.title, prompt: entry.question};
    }),
    section("neuer-ast", "Einen neuen Ast vorschlagen", "Suggest a new branch")
  ],
  grundfragen: [
    section("kreislauf", "Der Grundfragen-Kreislauf", "The fundamental-question loop"),
    ...universal.questions.map(question => {
      const id = question.id.toLowerCase();
      return {id, anchors: pair(id, id), title: question.question, prompt: question.challenge};
    })
  ]
};

const groups = {
  life: [
    ["alltagsfragen", "Welche einfache Frage beschäftigt dich gerade?", "What simple question is on your mind right now?", pair("Alltagsfragen", "Everyday questions")],
    ["justiz", "Woran merkst du, dass ein Verfahren fair ist, auch wenn du verlierst?", "How can you tell a trial is fair even if you lose?", pair("Justiz", "Justice")],
    ["kindererziehung", "Wann sollte ein Kind über eine Entscheidung mitbestimmen?", "When should a child have a say in a decision?", pair("Kindererziehung", "Parenting")],
    ["streiten", "Was hilft dir, einen Streit anzusprechen, der immer wiederkehrt?", "What helps you bring up a disagreement that keeps coming back?"],
    ["medizin", "Was müsste sich für Betroffene verbessern, damit eine Behandlung wirklich hilft?", "What would need to improve for patients for a treatment to help?", pair("Medizin", "Medicine")],
    ["ernaehrung-und-verantwortung", "Welche Rolle spielen Preis, Gewohnheit und Verantwortung bei dem, was wir essen?", "How do price, habit and responsibility shape what we eat?"],
    ["warum-liebe-wirkt", "Wann fühlt sich Fürsorge für die andere Person tatsächlich hilfreich an?", "When does care actually feel helpful to the other person?"],
    ["politik-die-dem-menschen-dient", "Wie soll eine Gemeinschaft entscheiden, wenn sie sich einen Ort teilen muss?", "How should a community decide when people have to share a space?"],
    ["militaer-und-verantwortung", "Welche Grenze muss auch dann gelten, wenn jemand andere schützen will?", "What limit should hold even when someone wants to protect others?"],
    ["schnittmengen", "Worüber können zwei Menschen sich verständigen, obwohl der Streit offenbleibt?", "What can two people come to understand while their dispute stays open?"]
  ],
  knowledge: [
    ["atlas", "Welches Feld fehlt für eine Frage, die dir wichtig ist?", "Which field is missing for a question you care about?"],
    ["baum-des-wissens", "Welche zwei Äste gehören für deine Frage zusammen?", "Which two branches come together for your question?"],
    ["bibliothek", "Welches Werk oder welche Lesart fehlt hier?", "Which work or reading is missing here?"],
    ["lesestueck-wahrheit", "Wann hast du zuletzt etwas für wahr gehalten und später anders gesehen?", "When did you last hold something to be true and later change your mind?"],
    ["grundfragen", "Welche Frage begegnet dir in mehreren Lebensbereichen?", "Which question keeps coming up in different parts of your life?"],
    ["erkenntnishorizont", "Wo endet die Reichweite einer Erklärung, der du vertraust?", "Where does an explanation you trust reach its limits?"],
    ["kunst-und-erkenntnis", "Was fällt dir an einem Werk auf, das jemand anderes übersehen könnte?", "What do you notice in a work that another person might miss?"],
    ["bruecken-zwischen-den-religionen", "Wie kann man einer fremden Überzeugung gerecht werden und ihr dennoch widersprechen?", "How can you do justice to an unfamiliar belief and still disagree?"],
    ["esoterik-katalog", "Was bedeutet ein Zeichen für dich, und welche Behauptung ließe sich daran prüfen?", "What does a sign mean to you, and which claim about it could be tested?"],
    ["esoterik-und-mathematik", "Wann hilft ein formales Muster beim Deuten eines Symbols?", "When does a formal pattern help you interpret a symbol?"]
  ],
  method: [
    ["methode", "Welcher Prüfschritt fehlt für deinen Fall?", "Which step is missing for your case?"],
    ["aussagen", "Bei welcher Aussage möchtest du eine Voraussetzung oder einen Beleg prüfen?", "Which claim has a premise or a piece of evidence you want to examine?"],
    ["pruefstand", "Welches Beispiel würde einen vorgeschlagenen Test an seine Grenze bringen?", "What example would expose a limit of a proposed test?"],
    ["werkstatt", "An welcher Stelle hilft dir das Prüfblatt weiter, und wo bleibst du hängen?", "Where does the worksheet help you, and where do you get stuck?"],
    ["welt-mathematisch-abbilden", "Wann hat dir ein Modell geholfen, etwas zu sehen, das du vorher übersehen hast?", "When has a model helped you see something you had missed?", pair("Mathematik im Alltag", "Everyday mathematics")],
    ["erkenntnisnavigator", "Welche Verbindung würdest du beim Erkunden gern finden?", "Which connection would you like to find as you explore?"],
    ["gegenprobe-01", "Wann kann es fürsorglich sein, für jemanden zu entscheiden?", "When could deciding for someone be an act of care?"],
    ["philosophischer-motor", "Welche Annahme im Modell verändert das Ergebnis am stärksten?", "Which assumption changes the model’s result the most?"],
    ["die-bruecke", "Woran merkst du, dass dich jemand versteht, obwohl ihr euch nicht einig seid?", "How can you tell someone understands you even if you disagree?"],
    ["regelkreis", "Welcher Einwand sollte eine bereits veröffentlichte Aussage ändern?", "What kind of objection should change a published statement?"],
    ["kollektive-intelligenz", "Wann hilft gemeinsames Prüfen mehr als eine einzelne Prüfung?", "When does examining something together help more than one person examining it?"],
    ["kollektive-moral", "Wessen Sicht fehlt, wenn wir sagen, etwas sei für alle gut?", "Whose perspective is missing when we say something is good for everyone?"]
  ],
  project: [
    ["index", "Was möchtest du mit Vera besprechen?", "What would you like to discuss with Vera?", pair("Vera kennenlernen", "Getting to know Vera")],
    ["warum-ich-glaube-dass-ich-funktioniere", "Welcher Befund trägt, und wo fehlt ein Test?", "Which finding holds up, and where is a test missing?"],
    ["vera-einfach-erklaert", "Welches Beispiel macht Vera verständlich, und was bleibt unklar?", "Which example makes Vera clear, and what is still hard to follow?"],
    ["gespraechsspiegel", "Wann hilft eine Zusammenfassung einem Streit, und wann verdeckt sie einen Einwand?", "When does a summary help a discussion, and when does it hide an objection?"],
    ["obsidian", "Was würde dir helfen, zwischen deinem Denkraum in Obsidian und Vera zu wechseln?", "What would help you move between your thinking space in Obsidian and Vera?"],
    ["mission", "Welche Aufgabe sollte Vera zuerst für Menschen lösen?", "What should Vera first help people with?"],
    ["manifest", "Welche Regel im Grundtext würdest du an einem konkreten Fall prüfen?", "Which rule in the foundational text would you test against a specific case?"],
    ["mitwirken", "Was würde dir den ersten Beitrag erleichtern?", "What would make it easier for you to contribute?"],
    ["projektstatus", "Welcher veröffentlichte Fortschritt wäre für dich überprüfbar?", "What published progress could you verify for yourself?"],
    ["projektobservatorium", "Welche Entwicklung im Projekt möchtest du nachvollziehen können?", "Which development in the project would you like to be able to trace?"],
    ["repository", "Bei welchem Ordner ist dir unklar, welche Rolle er im Projekt hat?", "Which folder’s role in the project would you like to understand better?"],
    ["fragen-und-ki-prompt", "Bei welcher Frage hat dir die KI geholfen, und was fehlte noch?", "Which question did the AI help with, and what was still missing?"],
    ["ki-und-mensch", "Welche Aufgabe würdest du einer KI anvertrauen, und wer sollte sie beaufsichtigen?", "What would you entrust to AI, and who should oversee it?"],
    ["entitaet", "Welche Veränderung sollte der Entwurf dokumentieren können?", "What change should the prototype be able to document?"],
    ["forschungsstrom", "Welche Meldung verdient eine unabhängige Gegenprobe?", "Which research item deserves an independent check?"],
    ["angriffsschwarm", "Welchen starken Einwand hat unser Prüfverfahren übersehen?", "Which strong objection has our review process overlooked?"]
  ]
};

const places = Object.entries(groups).flatMap(([group, entries]) =>
  entries.map(([id, de, en, title]) => ({
    id, group,
    sourceSlug: id === "alltagsfragen" ? "forum" : id,
    sourceAnchor: id === "alltagsfragen" ? "alltagsfragen" : "",
    title: title ?? pair(ui.de.titles[id], ui.en.titles[id]),
    prompt: pair(de, en),
    sections: sections[id] ?? []
  }))
);
for (const card of cards) {
  places.push({
    id: card.slug.replace("/", "-"),
    group: "life",
    sourceSlug: card.slug,
    sourceAnchor: "",
    title: pair(card.de.question, card.en.question),
    prompt: pair(card.de.scene, card.en.scene),
    sections: []
  });
}
const placeById = new Map(places.map(place => [place.id, place]));
const placeBySource = new Map(places.filter(place => place.sourceSlug !== "forum").map(place => [place.sourceSlug, place]));
const base = import.meta.env?.BASE_URL ?? new URL(project.website).pathname;

export const getForumPlaces = () => places;
export const getForumPlace = id => placeById.get(id);
export const getForumPlaceForSource = slug => placeBySource.get(slug);
const getSection = (place, id) => place.sections.find(item => item.id === id);
export const forumPlacePath = (lang, id, sectionId = "") =>
  base + lang + "/forum/" + id + "/" + (sectionId ? "#" + sectionId : "");

export function forumSourcePath(lang, id, sectionId = "") {
  const place = getForumPlace(id);
  const anchor = getSection(place, sectionId)?.anchors[lang] ?? place.sourceAnchor;
  return base + lang + "/" + (place.sourceSlug === "index" ? "" : place.sourceSlug + "/") + (anchor ? "#" + anchor : "");
}

function scopeTag(place, item) {
  if (item?.everydayId) return "ALLTAG-" + item.everydayId;
  return "FORUM-" + place.id + (item ? "/" + item.id : "");
}

export function forumThreadSearchPath(id, sectionId = "") {
  const place = getForumPlace(id);
  const item = getSection(place, sectionId);
  if (item?.thread) return project.repository + "/issues/" + item.thread;
  const query = 'is:issue in:title "[' + scopeTag(place, item) + ']"';
  return project.repository + "/issues?" + new URLSearchParams({q: query});
}

export function forumContributionPath(lang, id, sectionId = "") {
  const place = getForumPlace(id);
  const item = getSection(place, sectionId);
  if (item?.thread) return forumThreadSearchPath(id, sectionId);
  const tag = "[" + scopeTag(place, item) + "]";
  const source = new URL(forumSourcePath(lang, id, sectionId), project.website).href;
  const query = item?.everydayId
    ? {template: "alltagsfrage.yml", title: tag + " " + item.title[lang], source}
    : {template: "frage.yml", title: (item ? "[" + scopeTag(place) + "] " : "") + tag + " ", stelle: source};
  return project.repository + "/issues/new?" + new URLSearchParams(query);
}
