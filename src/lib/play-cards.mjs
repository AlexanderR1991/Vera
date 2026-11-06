export const cards = [
  {
    slug: "spiel",
    de: {
      scene: "Im Supermarkt sind zwei Kassen offen. Links warten zwei Leute, rechts vier.",
      question: "Wo stellst du dich an?",
      choices: ["Links", "Rechts", "Ich schaue erst mal."],
      clue: "Jetzt siehst du die Einkäufe. Links ist ein Wagen randvoll. Rechts hat jeder nur ein Teil.",
      reflection: "Welche Kasse würdest du jetzt wählen? Was könnte dich noch umstimmen?"
    },
    en: {
      scene: "Two checkouts are open. Two people are waiting on the left, four on the right.",
      question: "Which line do you join?",
      choices: ["Left", "Right", "I’ll look first."],
      clue: "Now you can see the groceries. One cart on the left is full to the brim. Everyone on the right has just one item.",
      reflection: "Which line would you choose now? What else might change your mind?"
    }
  },
  {
    slug: "spiel/foto",
    de: {
      scene: "Im Gruppenchat landet ein Foto vom Stadtfest. Der Platz ist leer. Darunter steht „War kaum jemand da.“",
      question: "Glaubst du das?",
      choices: ["Eher ja", "Eher nein", "Ich bin unsicher."],
      clue: "Die Turmuhr auf dem Foto zeigt zehn vor zehn. Laut Programm begann das Fest um zehn.",
      reflection: "Was verrät das Bild über den ganzen Tag? Wann würdest du noch einmal auf den Platz schauen?"
    },
    en: {
      scene: "Someone posts a photo of the town festival in the group chat. The square is empty. The caption reads “Hardly anyone came.”",
      question: "Do you believe it?",
      choices: ["Probably", "Probably not", "I’m unsure."],
      clue: "The clock tower in the photo reads 9:50. The programme says the festival started at ten.",
      reflection: "What does the photo tell you about the whole day? When would you look at the square again?"
    }
  },
  {
    slug: "spiel/zitrone",
    de: {
      scene: "Zwei Leute kochen zusammen. Beide wollen die letzte Zitrone.",
      question: "Was schlägst du vor?",
      choices: ["Halbieren", "Auslosen", "Erst mal fragen."],
      clue: "Eine Person braucht die Schale für einen Kuchen. Die andere möchte den Saft für einen Salat.",
      reflection: "Du hast die Zitrone in der Hand. Was machst du als Erstes, damit beide weiterkochen können?"
    },
    en: {
      scene: "Two people are cooking together. Both want the last lemon.",
      question: "What do you suggest?",
      choices: ["Cut it in half", "Flip a coin", "Ask them first."],
      clue: "One person needs the zest for a cake. The other wants the juice for a salad.",
      reflection: "You’re holding the lemon. What would you do first so both people can keep cooking?"
    }
  }
];

export const game = {
  de: {
    name: "Auf den zweiten Blick",
    card: "Karte",
    first: "Dein erster Gedanke",
    reveal: "Hinweis aufdecken",
    close: "Hinweis zuklappen",
    again: "Und jetzt?",
    second: "Nach dem Hinweis",
    reactions: ["Ich bleibe dabei.", "Ich denke um.", "Ich lasse es offen."],
    next: "Nächste Karte",
    restart: "Zur ersten Karte",
    workshop: "Eine eigene Frage prüfen",
    together: "Zu zweit? Lest die Frage laut vor. Verratet euch eure Wahl, bevor ihr den Hinweis aufdeckt.",
    print: "Kassenkarte zum Ausdrucken (PDF)",
    share: "Frage weitergeben",
    link: "Link zur Karte anzeigen",
    copied: "Frage und Link kopiert.",
    manual: "Diesen Link kannst du kopieren und weitergeben."
  },
  en: {
    name: "A second look",
    card: "Card",
    first: "Your first thought",
    reveal: "Reveal the clue",
    close: "Hide the clue",
    again: "What about now?",
    second: "After the clue",
    reactions: ["I’ll stick with it.", "I’ve changed my mind.", "I’ll leave it open."],
    next: "Next card",
    restart: "Back to the first card",
    workshop: "Explore a question of your own",
    together: "Playing together? Read the question aloud. Tell each other what you picked before you reveal the clue.",
    print: "Print the checkout card (PDF)",
    share: "Pass on the question",
    link: "Show the card link",
    copied: "Question and link copied.",
    manual: "You can copy this link and pass it on."
  }
};
