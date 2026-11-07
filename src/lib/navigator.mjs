import {topicFields} from "./topic-links.mjs";
import {contentWords, queryMatcher} from "./search-terms.mjs";

// Small editorial pilot: keyword suggestions are not AI understanding or evidence.
// A connection and its application remain drafts, even after all premises are checked.
const b = (de, en) => ({de, en});
const revision = "9362c966e8a2f464db5aca45595a77f78518d314";
const repo = `https://github.com/AlexanderR1991/Vera/blob/${revision}/`;
const methodSource = () => ({
  label: b("Projektmethode · Herkunft des Prüfverfahrens, kein Wirksamkeitsbeleg", "Project method · origin of the review procedure, not evidence of effectiveness"),
  url: repo + "docs/methode.md", role: "provenance"
});
const derivationSource = (anchor, version = 1) => ({
  label: b(`Eigene Ableitung v${version} · redaktioneller Arbeitsentwurf`, `Our derivation v${version} · editorial working draft`),
  url: `https://github.com/AlexanderR1991/Vera/blob/main/docs/erkenntnisnavigator.md#${anchor}`,
  role: "derivation"
});

export const connections = [
  {
    id: "capacity", version: 1, type: "formal", reviewStatus: "draft",
    title: b("Reicht die verfügbare Zeit?", "Is there enough time?"),
    question: b("Erfundenes Beispiel: Meine Aufgaben brauchen zwölf Stunden. Ich habe acht. Bin ich einfach undiszipliniert?", "Fictional example: My tasks take twelve hours. I have eight. Am I simply undisciplined?"),
    pattern: b("Der notwendige Aufwand könnte größer sein als die verfügbare Zeit.", "The time required may exceed the time available."),
    principle: b("Nicht überlappende Arbeit muss in die verfügbare Zeit passen.", "Work that cannot overlap must fit within the time available."),
    scope: b("Gilt für einen festgelegten Zeitraum und Arbeiten, deren tatsächlich benötigte Dauer sich ohne Überschneidung addiert. Zeitangaben und Parallelisierbarkeit müssen im konkreten Fall geprüft werden.", "Applies to a specified period and tasks whose actual durations add without overlap. Time estimates and the possibility of parallel work need examination in the particular case."),
    rationale: b("Eigene Ableitung: Braucht jede notwendige Aufgabe eine Dauer d, ist die Gesamtdauer die Summe dieser Dauern. Zwölf Stunden sind mehr als acht Stunden. Eine bloße Änderung der Reihenfolge ändert diese Summe nicht. Das ist eine bedingte Rechnung und keine Aussage über die Disziplin einer Person.", "Our derivation: If each required task has a duration d, total duration is the sum of those durations. Twelve hours exceed eight hours. Changing the order alone does not change that sum. This is a conditional calculation, not a judgment about someone's discipline."),
    counterargument: b("Die Dauern können falsch geschätzt sein. Manche Aufgaben lassen sich überlappen, vereinfachen oder streichen. Dann muss die Kapazitätsprüfung mit den geänderten Angaben wiederholt werden.", "Durations may be estimated incorrectly. Some tasks may overlap, be simplified or be dropped. The capacity check must then be repeated with the changed information."),
    revision: b("Verbindung neu prüfen, sobald Aufwand, verfügbare Zeit, Frist oder Überschneidung anders sind als angenommen.", "Reassess the connection when effort, available time, deadline or overlap differs from the assumptions."),
    conditions: [
      {id: "same_period", label: b("Ich vergleiche notwendige Aufgaben und verfügbare Zeit für denselben Zeitraum.", "I am comparing required tasks and available time over the same period.")},
      {id: "no_overlap", label: b("Die tatsächlich benötigten Arbeitszeiten lassen sich nicht überlappen; ihre Summe ist für diesen Plan nötig.", "The actual work durations cannot overlap; their sum is required for this plan.")},
      {id: "exceeds", label: b("Die so bestimmte Gesamtdauer ist größer als die verfügbare Zeit.", "The total duration determined this way exceeds the time available.")}
    ],
    conclusion: b("Unter deinen bestätigten Voraussetzungen reicht eine andere Reihenfolge allein nicht aus. Aufgabenmenge, Aufwand, verfügbare Zeit oder Frist müssten sich ändern. Welche Änderung vertretbar ist, entscheidet diese Rechnung nicht.", "Under the premises you confirmed, changing the order alone is insufficient. Scope, effort, available time or deadline would need to change. The calculation does not decide which change is acceptable."),
    nextStep: b("Prüfe zuerst die Zeitangaben. Notiere dann eine veränderbare Bedingung und mit wem sie geklärt werden muss.", "Check the time estimates first. Then record a condition that could change and who needs to be involved."),
    sources: [derivationSource("capacity"), methodSource()], ...topicFields("capacity"),
    keywords: {de: ["Zeit", "Zeitdruck", "Aufgabe", "Aufgaben", "schaffe", "Disziplin", "Kapazität", "Frist", "überlastet", "Überlastung", "Stunde", "Stunden", "Aufwand", "zu viel zu tun"], en: ["time", "task", "tasks", "discipline", "capacity", "deadline", "deadlines", "overload", "overloaded", "hour", "hours", "workload", "too much to do"]}
  },
  {
    id: "interpretation", version: 1, type: "formal", reviewStatus: "draft",
    title: b("Beobachtung oder Erklärung?", "Observation or explanation?"),
    question: b("Erfundenes Beispiel: Eine Person antwortet nicht. Weiß ich deshalb, dass sie mich ablehnt?", "Fictional example: Someone does not reply. Does that mean I know they reject me?"),
    pattern: b("Eine Beobachtung wird möglicherweise als eindeutiger Beweis für eine Erklärung behandelt.", "An observation may be treated as conclusive proof of one explanation."),
    principle: b("Aus einer möglichen Folge lässt sich ihre Ursache nicht ohne zusätzliche Voraussetzungen eindeutig zurückschließen.", "A possible consequence does not uniquely identify its cause without additional premises."),
    scope: b("Prüft einen Schluss von einer Beobachtung auf eine bestimmte Erklärung. Es entscheidet weder, was eine Person denkt, noch ob eine Erklärung insgesamt wahrscheinlich ist.", "Examines an inference from an observation to one specific explanation. It decides neither what a person thinks nor whether an explanation is likely overall."),
    rationale: b("Eigene Ableitung: Auch wenn aus A die Beobachtung B folgen würde, folgt aus B allein nicht A. Gegenmodell: A ist falsch und B ist wahr; „wenn A, dann B“ ist damit vereinbar. Im erfundenen Beispiel kann fehlende Antwort etwa auch ohne Ablehnung vorkommen. Diese Möglichkeit beweist wiederum nicht, dass keine Ablehnung vorliegt.", "Our derivation: Even if A would imply observation B, B alone does not imply A. Countermodel: A is false and B is true; this is compatible with “if A, then B”. In the fictional example, a missing reply could occur without rejection. That possibility does not prove that rejection is absent either."),
    counterargument: b("Zusätzliche unabhängige Belege können eine Erklärung stützen oder andere ausschließen. Dann muss die gesamte Begründung geprüft werden; diese Karte widerlegt die Erklärung nicht.", "Additional independent evidence can support an explanation or exclude others. The full argument then needs examination; this card does not refute the explanation."),
    revision: b("Die Zuordnung ändern, wenn zusätzliche tragfähige Gründe vorliegen oder die Frage gar keinen eindeutigen Umkehrschluss behauptet.", "Change the match when additional sound reasons are available or the question does not claim a conclusive reverse inference."),
    conditions: [
      {id: "specific_inference", label: b("Ich leite eine bestimmte Erklärung aus einer Beobachtung ab.", "I am inferring a particular explanation from an observation.")},
      {id: "only_observation", label: b("Mein Anspruch auf Gewissheit stützt sich hier nur auf diese Beobachtung, ohne weitere ausschließende Begründung.", "My claim to certainty here relies only on this observation, with no further argument excluding alternatives.")},
      {id: "alternative_possible", label: b("Mindestens eine andere Erklärung ist mit der Beobachtung und den genannten Voraussetzungen vereinbar.", "At least one other explanation is compatible with the observation and the stated premises.")}
    ],
    conclusion: b("Unter diesen Voraussetzungen ist die Erklärung nicht eindeutig bewiesen. Sie kann trotzdem zutreffen. Halte Beobachtung, Deutung und verbleibende Unsicherheit getrennt fest.", "Under these premises, the explanation is not conclusively proven. It may still be true. Record the observation, interpretation and remaining uncertainty separately."),
    nextStep: b("Benenne eine Information, die zwischen den Erklärungen unterscheiden könnte. Du darfst die Frage auch offenlassen; die Karte verlangt keine Kontaktaufnahme.", "Identify information that could distinguish the explanations. You can also leave the question open; this card does not require contacting anyone."),
    sources: [derivationSource("observation"), methodSource()], ...topicFields("interpretation"),
    keywords: {de: ["Antwort", "antworten", "antwortet", "Ablehnung", "ablehnt", "Deutung", "Beobachtung", "beobachtet", "Interpretation", "Beweis", "beweist", "Gewissheit", "Ursache", "Ursachen", "Motiv"], en: ["reply", "replies", "respond", "responds", "rejection", "reject", "rejects", "interpret", "interpretation", "observation", "observed", "proof", "certainty", "cause", "causes", "motive"]}
  },
  {
    id: "distribution", version: 2, type: "formal", reviewStatus: "draft",
    title: b("Was verbirgt der Durchschnitt?", "What does the average hide?"),
    question: b("Zwei Kisten enthalten im Durchschnitt drei Portionen. Können beide jeweils mindestens vier enthalten?", "Two crates hold three portions each on average. Could both hold at least four?"),
    pattern: b("Von einem Mittelwert soll auf eine Mindestmenge für alle geschlossen werden.", "An average is being used to infer a minimum for everyone."),
    principle: b("Wenn jede Menge eine Schwelle erreicht, muss auch ihr Durchschnitt diese Schwelle erreichen.", "If each amount meets a threshold, their average must meet it too."),
    scope: b("Der Rechner prüft mindestens zwei nichtnegative Mengen in derselben Einheit. Er verwendet ihren exakten arithmetischen Mittelwert und eine gemeinsame Mindestmenge. Die Wahl einer gerechten Schwelle bleibt eine Wertfrage.", "The calculator checks two or more nonnegative amounts in the same unit. It uses their exact arithmetic mean and a common minimum. Choosing a fair threshold remains a value judgment."),
    rationale: b("Bei durchschnittlich drei Portionen sind sechs vorhanden. Zweimal vier erfordert acht. Bei durchschnittlich fünf passen sowohl fünf und fünf als auch zwei und acht zu den Angaben. Nur im ersten dieser beiden Fälle haben beide Kisten mindestens vier.", "A mean of three portions gives six in total. Four in each crate would take eight. With a mean of five, both five and five and two and eight fit the figures. Only the first of these two allocations gives each crate at least four."),
    counterargument: b("Ein gerundeter Mittelwert kann auf der anderen Seite der Schwelle liegen als der genaue Wert. Feste Behältergrößen oder unteilbare Einheiten können eine Beispielverteilung ausschließen.", "A rounded mean may fall on the opposite side of the threshold from the exact value. Container limits or indivisible units can rule out an example allocation."),
    revision: b("Prüfe die Rechnung erneut, wenn Mittelwert, Schwelle oder zulässige Verteilungen sich ändern.", "Check again if the mean, threshold or permitted allocations change."),
    conditions: [
      {id: "arithmetic_mean", label: b("Ich kenne den exakten, ungewichteten Durchschnitt von mindestens zwei nichtnegativen Mengen in derselben Einheit.", "I know the exact, unweighted mean of at least two nonnegative amounts in the same unit.")},
      {id: "individual_claim", label: b("Ich prüfe, ob jede einzelne Menge die gleiche Mindestmenge erreicht.", "I am checking whether every amount meets the same minimum.")},
      {id: "mean_only", label: b("Für den Nachweis beider Möglichkeiten: Sind zwei Verteilungen in meinem Fall zulässig? Erstens erhalten alle den Durchschnitt. Zweitens erhält eine Stelle null und eine andere das Doppelte des Durchschnitts. Alle übrigen behalten den Durchschnitt.", "To establish that either answer is possible, are both allocations allowed in my case? First, everyone receives the mean. Second, one receives zero and another twice the mean. All others keep the mean.")}
    ],
    amounts: [
      {id: "mean", label: b("Exakter Durchschnitt", "Exact mean")},
      {id: "minimum", label: b("Mindestmenge für jeden einzelnen Wert", "Minimum for every individual value")}
    ],
    conclusion: b("Liegt der Durchschnitt unter der Mindestmenge, ist die Behauptung ausgeschlossen. Erreicht der Durchschnitt eine positive Schwelle, prüfe zwei Verteilungen mit gleichem Mittelwert und unterschiedlichen Antworten. Erst wenn beide zulässig sind, ist belegt, dass beide Antworten möglich sind. Bei einer Mindestmenge von null genügt schon die Nichtnegativität.", "If the mean is below the minimum, the claim is ruled out. When the mean meets a positive minimum, look for two allocations with that same mean and opposite answers. If both are permitted, either outcome is possible. A minimum of zero follows directly from nonnegativity."),
    nextStep: b("Welche Verteilungen sind in deinem Fall tatsächlich erlaubt? Halte zusätzliche Grenzen und die noch offene Frage fest.", "Which allocations does your actual case allow? Record any further constraints and the question that remains open."),
    sources: [derivationSource("distribution", 2), methodSource()], ...topicFields("distribution"),
    keywords: {de: ["Durchschnitt", "durchschnittlich", "Mittelwert", "Mittelwerte", "Verteilung", "ungleich", "Ungleichheit", "gerecht", "Gerechtigkeit", "alle genug"], en: ["average", "averages", "mean", "the mean", "arithmetic mean", "mean value", "mean income", "distribution", "inequality", "fairness", "everyone enough"]}
  },
  {
    id: "help", version: 1, type: "normative", reviewStatus: "draft",
    title: b("Welche Hilfe ist gewünscht?", "What help is wanted?"),
    question: b("Erfundenes Beispiel: Ich möchte helfen. Sollte ich der anderen Person alles abnehmen?", "Fictional example: I want to help. Should I take everything over for the other person?"),
    pattern: b("Ein Hilfsangebot berührt Bedürfnisse, Selbstbestimmung und möglicherweise dauerhafte Unterstützung.", "An offer of help involves needs, self-determination and possibly lasting support."),
    principle: b("Hilfe soll Bedürfnisse und Handlungsmöglichkeiten ernst nehmen. Würde und Fürsorge hängen nicht von erreichbarer Selbstständigkeit ab.", "Help should take needs and agency seriously. Dignity and care do not depend on attainable independence."),
    scope: b("Ein normativer Projektleitgedanke für ein freiwillig gestaltbares Hilfsangebot. Er ist kein Nachweis dafür, welche konkrete Hilfe wirkt. Akute Gefahr, Schutzpflichten und ungeklärte Zustimmung benötigen eine gesonderte Klärung. Eine nicht passende Karte bedeutet nicht, dass notwendige Fürsorge unterbleiben soll.", "A guiding project value for an offer of help that can be shaped voluntarily. It does not establish which specific help works. Immediate danger, duties of protection and unclear consent require separate consideration. A card that does not fit does not mean necessary care should be withheld."),
    rationale: b("Normative Begründung aus G-005: Bedürfnisse und Handlungsmöglichkeiten des Gegenübers verdienen Berücksichtigung. Dauerhafte Fürsorge kann ebenso wertvoll sein wie Unterstützung zur Selbstständigkeit. Daraus folgt ein Anlass zum gemeinsamen Klären, keine allgemeine Handlungsanweisung und kein empirischer Wirkungsnachweis.", "Normative rationale from G-005: The other person's needs and agency deserve consideration. Lasting care can be as valuable as support towards independence. This motivates joint clarification, not a universal instruction or empirical proof of effectiveness."),
    counterargument: b("Wer Selbstständigkeit fordert, kann nötige Hilfe entziehen. Wer ungefragt übernimmt, kann Selbstbestimmung einschränken. Auch eine Ablehnung dieses Projektwerts oder ein Wertkonflikt muss benennbar bleiben.", "Demanding independence can withdraw necessary help. Taking over without asking can restrict self-determination. Disagreement with this project value or a conflict of values must remain expressible."),
    revision: b("Verbindung neu prüfen, wenn Wünsche oder Unterstützungsbedarf anders sind als angenommen oder die Anwendung Hilfe entzieht, aufdrängt oder an Leistung bindet.", "Reassess the connection if preferences or support needs differ from the assumptions, or if its application withholds, imposes or makes help conditional on performance."),
    conditions: [
      {id: "shared_value", label: b("Für diese Entscheidung möchte ich Bedürfnisse, Selbstbestimmung und auch dauerhafte Fürsorge als Werte berücksichtigen.", "For this decision, I want to consider needs, self-determination and lasting care as values.")},
      {id: "voluntary_setting", label: b("Es geht um ein freiwillig gestaltbares Angebot; akute Gefahr oder ungeklärte Schutzpflichten sind hier nicht der Entscheidungsgrund.", "This is an offer that can be shaped voluntarily; immediate danger or unresolved duties of protection are not the basis for this decision.")},
      {id: "preferences_known", label: b("Die Wünsche der betroffenen Person zu diesem Angebot wurden verständlich geklärt und werden nicht nur von mir vermutet.", "The affected person's preferences about this offer have been clarified accessibly, rather than merely assumed by me.")}
    ],
    conclusion: b("Wenn du diese Werte und Voraussetzungen bestätigst, ist ein an den geklärten Wünschen orientiertes Angebot ein begründeter Vorschlag. Nötige dauerhafte Unterstützung bleibt wertvoll. Ob die konkrete Hilfe nützt, ist weiterhin zu prüfen.", "If you confirm these values and premises, an offer guided by the clarified preferences is a reasoned proposal. Necessary lasting support remains valuable. Whether the particular help is useful still needs examination."),
    nextStep: b("Halte fest, welche Hilfe gewünscht ist, welche Grenzen gelten und wie eine Änderung des Wunsches berücksichtigt wird. Bei offenen Voraussetzungen kläre diese zuerst.", "Record what help is wanted, which boundaries apply and how changed preferences will be respected. Clarify any open premises first."),
    sourceClaim: {id: "G-005", version: 3},
    sources: [{label: b("G-005 v3 · normativer Leitgedanke, fachliche Prüfung offen", "G-005 v3 · guiding value, expert review pending"), url: repo + "public/knowledge/claims.json", role: "provenance"}, derivationSource("help")],
    ...topicFields("help"),
    keywords: {de: ["helfe", "helfen", "hilft", "Hilfe", "Fürsorge", "unterstütze", "unterstützen", "Unterstützung", "selbstständig", "Selbstständigkeit", "selbstbestimmt", "Selbstbestimmung", "alles abnehmen", "Pflege"], en: ["help", "helps", "helping", "care", "caregiving", "support", "independent", "independence", "autonomy", "take over", "assistance"]}
  }
];

function freezeDeep(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freezeDeep);
    Object.freeze(value);
  }
  return value;
}
freezeDeep(connections);

const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);
const language = lang => lang === "en" ? "en" : "de";
const textValue = value => typeof value === "string" ? value.slice(0, 12000).trim() : "";

/** Direct lexical matches only. Terms are words the reader actually entered. */
export function connectionTermMatches(match, lang) {
  return connections.map(connection => ({
    connection,
    terms: match([...connection.keywords[lang], ...contentWords(connection.title[lang], lang)])
  })).filter(hit => hit.terms.length).sort((a, b) => b.terms.length - a.terms.length);
}

export function findConnections(query, lang = "de") {
  const locale = language(lang);
  return connectionTermMatches(queryMatcher(query, locale), locale).slice(0, 3).map(hit => hit.connection);
}

// Compare entered decimals exactly, including thresholds closer than a floating-point step.
const validAmount = value => typeof value === "string" && value.length <= 32 && /^\d+(?:[.,]\d+)?$/.test(value);

function minimumFigures(answers) {
  const parts = [answers.mean, answers.minimum].map(value => value.replace(",", ".").split("."));
  const places = Math.max(...parts.map(([, fraction = ""]) => fraction.length));
  const [mean, minimum] = parts.map(([whole, fraction = ""]) => BigInt(whole + fraction.padEnd(places, "0")));

  return {mean, minimum, places};
}

export function needsAllocationExamples(answers) {
  if (!["mean", "minimum"].every(id => Object.hasOwn(answers, id) && validAmount(answers[id]))) return false;
  const {mean, minimum} = minimumFigures(answers);
  return minimum > 0n && mean >= minimum;
}

function minimumConclusion(answers, lang) {
  const {mean, minimum, places} = minimumFigures(answers);
  function format(amount) {
    if (places === 0) return String(amount);
    const digits = String(amount).padStart(places + 1, "0");
    const fraction = digits.slice(-places).replace(/0+$/, "");
    const separator = lang === "en" ? "." : ",";
    return digits.slice(0, -places) + (fraction ? separator + fraction : "");
  }

  if (minimum === 0n) return lang === "en"
    ? "The claim follows. Every amount meets the minimum of zero because the model only allows nonnegative amounts."
    : "Die Aussage folgt. Jede Menge erreicht die Schwelle null, weil das Modell nur nichtnegative Mengen zulässt.";
  if (mean < minimum) return lang === "en"
    ? `Ruled out. If every amount were at least ${format(minimum)}, the mean would also be at least ${format(minimum)}. The mean is only ${format(mean)}.`
    : `Ausgeschlossen. Wäre jede Menge mindestens ${format(minimum)}, läge auch ihr Durchschnitt bei mindestens ${format(minimum)}. Er beträgt aber nur ${format(mean)}.`;
  return lang === "en"
    ? `Both answers are possible under your stated conditions. Give everyone ${format(mean)} and everyone meets the minimum of ${format(minimum)}. Change two amounts to 0 and ${format(2n * mean)}, leaving the rest at ${format(mean)}. Now one falls below the minimum, with the same mean.`
    : `Unter deinen Angaben sind beide Antworten möglich. Erhalten alle ${format(mean)}, erreichen alle die Schwelle ${format(minimum)}. Ändere zwei Mengen auf 0 und ${format(2n * mean)}. Alle übrigen behalten ${format(mean)}. Jetzt liegt eine Menge unter der Schwelle, bei gleichem Durchschnitt.`;
}

/** No inference from prose, unknown values, inherited fields or other answers. */
export function assessConnection(connectionId, answers = {}) {
  const connection = connections.find(item => item.id === connectionId);
  if (!connection || !isRecord(answers)) return {status: "invalid", missing: [], failed: []};
  const missing = [];
  const failed = [];
  for (const condition of connection.conditions) {
    if (condition.id === "mean_only" && !needsAllocationExamples(answers)) continue;
    const answer = Object.hasOwn(answers, condition.id) ? answers[condition.id] : "unknown";
    if (!["yes", "no", "unknown"].includes(answer)) return {status: "invalid", missing: [], failed: []};
    if (answer === "no") failed.push(condition.id);
    if (answer === "unknown") missing.push(condition.id);
  }
  for (const field of connection.amounts ?? []) {
    if (!Object.hasOwn(answers, field.id) || !validAmount(answers[field.id])) missing.push(field.id);
  }
  return {status: failed.length ? "not_applicable" : missing.length ? "needs_context" : "conditional", missing, failed};
}

export function conditionalConclusion(connection, answers, lang) {
  return connection.id === "distribution" ? minimumConclusion(answers, lang) : connection.conclusion[lang];
}

const reflectionLabels = {
  goal: b("Mein Ziel / meine Werte", "My goal / values"),
  observation: b("Meine Beobachtung", "My observation"),
  interpretation: b("Meine Deutung", "My interpretation"),
  feeling: b("Mein Gefühl", "My feeling"),
  wish: b("Mein Wunsch oder meine Sorge", "My wish or concern"),
  action: b("Mein nächster Schritt", "My next step"),
  expected: b("Was ich erwarte", "What I expect"),
  observed: b("Was ich später beobachte", "What I observe later"),
  revision: b("Was ich korrigieren möchte", "What I want to revise")
};

export function caseWording(framing, original, alternative, lang) {
  const en = lang === "en";
  if (framing === "original" && textValue(original)) return (en ? "Original question" : "Ausgangsfrage") + " · " + textValue(original);
  if (framing === "alternative" && textValue(alternative)) return (en ? "Alternative wording" : "Andere Formulierung") + " · " + textValue(alternative);
  return en ? "No wording assigned to this card." : "Dieser Karte ist keine Frageformulierung zugeordnet.";
}

export function buildNavigatorNote(input = {}) {
  const data = isRecord(input) ? input : {};
  const lang = language(data.lang);
  const t = (de, en) => lang === "en" ? en : de;
  const connection = connections.find(item => item.id === data.connectionId);
  const answers = data.answers === undefined ? {} : data.answers;
  const assessment = assessConnection(data.connectionId, answers);
  const statuses = {
    invalid: t("Keine gültige Verbindungsprüfung", "No valid connection assessment"),
    needs_context: t("Voraussetzungen offen · Rückfrage nötig", "Premises unresolved · clarification needed"),
    not_applicable: t("Unter diesen Angaben nicht anwendbar", "Not applicable under these answers"),
    conditional: t("Bedingt anwendbarer Vorschlag · kein Wahrheitssiegel", "Conditionally applicable proposal · not a certificate of truth")
  };
  const answerLabels = {yes: t("Ja, von mir angegeben", "Yes, stated by me"), no: t("Nein, von mir angegeben", "No, stated by me"), unknown: t("Unbekannt / offen", "Unknown / unresolved")};
  const lines = [t("Vera · Erkenntnisnavigator", "Vera · Knowledge navigator"), "",
    t("Persönlicher Entwurf. Die Antworten sind eigene Angaben, keine unabhängig geprüften Tatsachen.", "Personal draft. Answers are self-reported, not independently verified facts."), "",
    t("Meine Frage", "My question") + ":", textValue(data.question) || t("Offen", "Open"), ""];
  if (textValue(data.alternativeQuestion)) lines.push(t("Andere Formulierung", "Alternative wording") + ":", textValue(data.alternativeQuestion), "");
  lines.push(t("Stand der Verbindung", "Connection status") + ": " + statuses[assessment.status]);
  if (connection) {
    lines.push(t("Fallbezug", "Case wording") + ": " + caseWording(data.framing, data.question, data.alternativeQuestion, lang), "", `${connection.title[lang]} (${connection.id}, v${connection.version})`,
      t("Aussageart", "Claim type") + ": " + (connection.type === "formal" ? t("Formal", "Formal") : t("Normativ", "Normative")),
      t("Redaktioneller Arbeitsentwurf · keine unabhängige Fachprüfung", "Editorial working draft · no independent expert review"), "",
      t("Voraussetzungen", "Premises") + ":");
    for (const condition of connection.conditions) {
      if (condition.id === "mean_only" && isRecord(answers) && !needsAllocationExamples(answers)) continue;
      const raw = isRecord(answers) && Object.hasOwn(answers, condition.id) ? answers[condition.id] : "unknown";
      lines.push(`- ${condition.label[lang]} — ${answerLabels[raw] ?? t("Ungültige Angabe", "Invalid answer")}`);
    }
    for (const field of connection.amounts ?? []) {
      const raw = isRecord(answers) && Object.hasOwn(answers, field.id) ? answers[field.id] : "";
      lines.push(`- ${field.label[lang]} — ${textValue(raw) || t("Offen", "Open")}`);
    }
    if (assessment.status === "conditional") lines.push("", conditionalConclusion(connection, answers, lang), "", t("Möglicher nächster Schritt", "Possible next step") + ": " + connection.nextStep[lang]);
    else lines.push("", t("Aus dieser Verbindung wird derzeit keine Handlungsempfehlung abgeleitet.", "No action recommendation is currently derived from this connection."));
    lines.push("", t("Geltungsbereich", "Scope") + ": " + connection.scope[lang], "",
      t("Begründung", "Rationale") + ": " + connection.rationale[lang], "",
      t("Wichtigster Einwand", "Main objection") + ": " + connection.counterargument[lang], "",
      t("Wann die Verbindung geändert werden muss", "When to revise the connection") + ": " + connection.revision[lang], "",
      t("Quellen und Herkunft", "Sources and provenance") + ":");
    for (const source of connection.sources) lines.push(`- ${source.label[lang]} (${source.role}): ${source.url}`);
  }
  const reflection = isRecord(data.reflection) ? data.reflection : {};
  lines.push("", t("Meine freiwillige Reflexion", "My optional reflection"));
  for (const [key, label] of Object.entries(reflectionLabels)) lines.push("", label[lang] + ":", textValue(reflection[key]) || t("Offen", "Open"));
  lines.push("", t("Ein beobachtetes Ergebnis ist noch kein Nachweis seiner Ursache. Diese Notiz bewertet Entscheidungen, nicht den Wert eines Menschen.", "An observed outcome does not establish its cause. This note examines decisions, not the worth of a person."));
  return lines.join("\n") + "\n";
}
