// One editorial reason per pattern–topic link. Both directions of travel and
// the public export use these same memberships.
const b = (de, en) => ({de, en});
const reasons = {
  capacity: {
    mathematik: b("Wie viele Stunden ergeben die einzelnen Aufgaben zusammen, wenn nur eine nach der anderen erledigt werden kann?", "How many hours do the tasks add up to if they can only be done one after another?"),
    wirtschaft: b("Welche Aufträge passen in eine Schicht, wenn eine Person für jeden davon anwesend sein muss?", "Which jobs fit into one shift if the same person must be present for each?"),
    technik: b("Welche Schritte kann eine Maschine gleichzeitig ausführen? Das entscheidet, welche Laufzeiten man addieren darf.", "Which steps can a machine carry out at the same time? That determines which run times can be added.")
  },
  interpretation: {
    philosophie: b("Folgt die Erklärung aus der Beobachtung? Ein einziger denkbarer Gegenfall kann zeigen, dass der Schluss offenbleibt.", "Does the explanation follow from the observation? One possible counterexample can show that the conclusion is still open."),
    mathematik: b("Wenn aus A die Beobachtung B folgt, könnte B auch ohne A eintreten? Ein Gegenmodell prüft genau diesen Rückschluss.", "If A implies observation B, could B also occur without A? A countermodel tests that reverse inference."),
    psychologie: b("Jemand schweigt. Welche unterschiedlichen Beweggründe würden zu derselben Beobachtung passen?", "Someone stays silent. Which different motives could fit that same observation?")
  },
  distribution: {
    mathematik: b("Null und zehn haben denselben Durchschnitt wie fünf und fünf. Welche Einzelwerte sind also noch möglich?", "Zero and ten have the same average as five and five. Which individual values are still possible?"),
    wirtschaft: b("Ein Dorf hat im Schnitt genug zu essen. Welche Haushalte wie viel bekommen, lässt sich erst an der Verteilung ablesen.", "A village has enough food on average. How much each household receives depends on the distribution."),
    ethik: b("Sollen alle gleich viel bekommen oder alle genug? Das ist eine Wertfrage, die auch bei bekanntem Durchschnitt offenbleibt.", "Should everyone receive the same amount, or should everyone have enough? Knowing the average leaves that value question open.")
  },
  help: {
    liebe: b("Bei einem Hilfsangebot in einer Beziehung können sich die Wünsche beider Menschen unterscheiden. Welche Hilfe ist willkommen?", "Two people in a relationship may want different things from an offer of help. What support is welcome?"),
    gesundheit: b("Wer dauerhaft Unterstützung braucht, kann eigene Wünsche zur Fürsorge haben. Wie erfährt die helfende Person davon?", "Someone who needs ongoing support may have preferences about their care. How can the person offering help learn those preferences?"),
    ethik: b("Wenn gut gemeinte Hilfe eine Entscheidung vorwegnimmt, wie lassen sich Fürsorge und Selbstbestimmung gemeinsam achten?", "When well-intended help preempts a decision, how can both care and self-determination be respected?")
  }
};

export function topicFields(connectionId) {
  const topicReasons = reasons[connectionId];
  return {topics: Object.keys(topicReasons), topicReasons};
}

export function topicLens(connectionId, topicId, lang) {
  return reasons[connectionId]?.[topicId]?.[lang] ?? "";
}
