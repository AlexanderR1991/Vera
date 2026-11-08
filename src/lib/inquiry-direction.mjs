export const directionChecks = ["evidence", "agency", "care", "repair"];
export const directionStates = ["open", "yes", "no"];

// A concern remains visible even when every other check passes.
export function assessDirection(direction) {
  if (!direction || directionChecks.every(key => direction[key] === "open")) return "unassessed";
  if (directionChecks.some(key => direction[key] === "no")) return "revise";
  if (directionChecks.every(key => direction[key] === "yes")) return "review";
  return "clarify";
}

export const directionCopy = {
  de: {
    title: "Liebe als Richtung · den nächsten Schritt prüfen",
    questions: {
      evidence: "Sind die Gründe nachvollziehbar und offene Annahmen sichtbar?",
      agency: "Liegt eine nötige Zustimmung freiwillig vor und bleibt ein Nein wirksam?",
      care: "Habe ich möglichen Schaden und den Unterstützungsbedarf berücksichtigt?",
      repair: "Weiß ich, woran ich einen Fehler erkenne und wie ich reagieren kann?"
    },
    states: {open: "Offen", yes: "Ja", no: "Nein"},
    results: {
      unassessed: "Die Einschätzungen sind offen.",
      revise: "Halte inne. Ändere den vorgeschlagenen Schritt oder lass ihn sein, wenn der Einwand bestehen bleibt.",
      clarify: "Klär die offenen Punkte. Wo das gerade nicht geht, kannst du einen kleineren, leichter korrigierbaren Schritt prüfen.",
      review: "Viermal Ja nach deiner Einschätzung. Prüfe die Gründe mit den Betroffenen. Maßgeblich ist ihre tatsächliche Zustimmung, wo sie erforderlich ist."
    }
  },
  en: {
    title: "Love as direction · examine your next step",
    questions: {
      evidence: "Can others check the reasons and see which assumptions are still open?",
      agency: "Has any required consent been freely given, and would a no be respected?",
      care: "Have I considered possible harm and what support people may need?",
      repair: "Do I know how I would spot a mistake and what I could do about it?"
    },
    states: {open: "Open", yes: "Yes", no: "No"},
    results: {
      unassessed: "The checks are open.",
      revise: "Pause. Revise the proposed step or set it aside if the concern still stands.",
      clarify: "Clarify the open points. If you cannot do that now, consider a smaller step that is easier to correct.",
      review: "You marked all four checks yes. Review the reasons with the people affected. Their actual consent matters wherever it is required."
    }
  }
};
