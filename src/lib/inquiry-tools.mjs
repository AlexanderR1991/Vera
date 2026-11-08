// Field names refer to the shared inquiry_note. The tools add no private storage.
export const inquiryTools = [
  {
    id: "observe",
    input: "question",
    output: "support",
    de: {
      title: "Beobachten",
      question: "Was kann jemand anderes an derselben Stelle nachprüfen?",
      example: "Im Schulgarten sind vier von sechs Bohnen gekeimt. Ob die anderen mehr Licht brauchen, ist noch offen.",
      input: "Die Frage festhalten",
      output: "Die Beobachtung als Beleg eintragen"
    },
    en: {
      title: "Observe",
      question: "What could someone else check by looking in the same place?",
      example: "Four of the six beans in the school garden have sprouted. Whether the others need more light is still open.",
      input: "Write down the question",
      output: "Record the observation as evidence"
    }
  },
  {
    id: "compare",
    input: "scope",
    output: "support",
    next: "experiment",
    de: {
      title: "Möglichkeiten vergleichen",
      question: "Welche Möglichkeit erfüllt eine Bedingung, die für mich zählt?",
      example: "Für das Vereinstreffen muss der Zugang stufenlos sein. Zum einzigen Eingang von Raum A führen drei Stufen. Das Foto von Raum B zeigt nur den Saal.",
      input: "Die Möglichkeiten und eine Bedingung benennen",
      output: "Den Vergleich unter den Gründen festhalten"
    },
    en: {
      title: "Compare options",
      question: "Which option meets a requirement that matters to me?",
      example: "The club needs step-free access for its meeting. Three steps lead to the only entrance to Room A. The photo of Room B only shows the inside.",
      input: "Set out the options and one requirement",
      output: "Record the comparison with your reasons"
    }
  },
  {
    id: "perspectives",
    input: "question",
    output: "positions",
    de: {
      title: "Eine andere Sicht verstehen",
      question: "Wie würde die andere Person meine Wiedergabe ihrer Sicht korrigieren?",
      example: "Beim Dienstplan habe ich „möglichst früh“ als Wunsch nach der Frühschicht verstanden. Meine Kollegin meinte, sie möchte den Plan früh genug kennen.",
      input: "Die gemeinsame Frage aufschreiben",
      output: "Die Sicht der Beteiligten in ihren Worten festhalten"
    },
    en: {
      title: "Understand another perspective",
      question: "What would the other person change in my account of their view?",
      example: "I took “as early as possible” to mean my colleague wanted the early shift. She meant she needed to see the schedule well in advance.",
      input: "Write down the shared question",
      output: "Record the people’s views in their own words"
    }
  },
  {
    id: "experiment",
    input: "support",
    output: "action",
    de: {
      title: "Etwas im Kleinen erproben",
      question: "Was lässt sich mit wenig Aufwand prüfen, bevor ich mich festlege?",
      example: "Vor der Buchung schaut sich jemand den Weg von der Straße bis zur Tür von Raum B an. Gibt es eine Stufe, sucht der Verein weiter.",
      input: "Gründe und offene Angaben ansehen",
      output: "Den Versuch und die Bedingung zum Abbrechen notieren"
    },
    en: {
      title: "Try a small experiment",
      question: "What could I check with little effort before I commit?",
      example: "Before booking Room B, someone checks the route from the street to the door. If there is a step, the club keeps looking.",
      input: "Review the reasons and gaps",
      output: "Write down the trial and when to stop"
    }
  }
];
