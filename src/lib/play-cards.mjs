export const cards = [
  {
    slug: "spiel",
    de: {
      scene: "Im Supermarkt sind zwei Kassen offen. Links warten zwei Leute, rechts vier.",
      question: "Wo stellst du dich an?",
      choices: ["Links", "Rechts", "Ich schaue erst mal."],
      clue: "Jetzt siehst du die Einkäufe. Links ist ein Wagen randvoll. Rechts hat jeder nur ein Teil.",
      reflection: "Welche Kasse würdest du jetzt wählen? Was könnte dich noch umstimmen?",
      further: "Auch mit dem Hinweis weißt du noch nicht, welche Kasse schneller ist. Vielleicht gibt es ein Problem beim Bezahlen. Welche weitere Beobachtung würde dir helfen?"
    },
    en: {
      scene: "Two checkouts are open. Two people are waiting on the left, four on the right.",
      question: "Which line do you join?",
      choices: ["Left", "Right", "I’ll look first."],
      clue: "Now you can see the groceries. One cart on the left is full to the brim. Everyone on the right has just one item.",
      reflection: "Which line would you choose now? What else might change your mind?",
      further: "Even with the clue, you do not know which checkout will be faster. Someone might have trouble paying. What else could you look for?"
    }
  },
  {
    slug: "spiel/foto",
    de: {
      scene: "Im Gruppenchat landet ein Foto vom Stadtfest. Der Platz ist leer. Darunter steht „War kaum jemand da.“",
      question: "Glaubst du das?",
      choices: ["Eher ja", "Eher nein", "Ich bin unsicher."],
      clue: "Die Turmuhr auf dem Foto zeigt zehn vor zehn. Laut Programm begann das Fest um zehn.",
      reflection: "Was verrät das Bild über den ganzen Tag? Was würdest du noch wissen wollen?",
      further: "Das frühe Foto zeigt nicht, wie voll es später war. Es beweist also weder ein leeres noch ein gut besuchtes Fest. Welche andere Aufnahme oder Beobachtung würde dir helfen?"
    },
    en: {
      scene: "Someone posts a photo of the town festival in the group chat. The square is empty. The caption reads “Hardly anyone came.”",
      question: "Do you believe it?",
      choices: ["Probably", "Probably not", "I’m unsure."],
      clue: "The clock tower in the photo reads 9:50. The programme says the festival started at ten.",
      reflection: "What does the photo tell you about the whole day? What else would you want to know?",
      further: "An early photo does not show how busy it was later. It proves neither that hardly anyone came nor that the festival was busy. What other photo or observation would help?"
    }
  },
  {
    slug: "spiel/zitrone",
    de: {
      scene: "Zwei Leute kochen zusammen. Beide wollen die letzte Zitrone.",
      question: "Was schlägst du vor?",
      choices: ["Halbieren", "Auslosen", "Erst mal fragen."],
      clue: "Eine Person braucht die Schale für einen Kuchen. Die andere möchte den Saft für einen Salat.",
      reflection: "Du hast die Zitrone in der Hand. Welchen Vorschlag machst du den beiden?",
      further: "Schale und Saft aufzuteilen könnte passen, wenn beide zustimmen. Was wäre, wenn beide den ganzen Saft bräuchten? Auch nach einer guten Frage kann ein Streit offenbleiben."
    },
    en: {
      scene: "Two people are cooking together. Both want the last lemon.",
      question: "What do you suggest?",
      choices: ["Cut it in half", "Flip a coin", "Ask them first."],
      clue: "One person needs the zest for a cake. The other wants the juice for a salad.",
      reflection: "You’re holding the lemon. What would you suggest to them?",
      further: "Sharing the zest and juice could work if both agree. What if both needed all the juice? A good question can still leave a disagreement unresolved."
    }
  },
  {
    slug: "spiel/lampe",
    de: {
      scene: "Du suchst eine Lampe zum Lesen. Im Laden probierst du eine aus. Ihr Licht flackert.",
      question: "Kaufst du diese Lampe?",
      choices: ["Eher ja", "Eher nein", "Ich prüfe weiter."],
      clue: "Auf einem Schild steht: „Unser meistverkauftes Modell.“",
      reflection: "Was ist für deine Entscheidung wichtig? Hat der Hinweis daran etwas geändert?",
      further: "Viele Käufe erklären das Flackern nicht. Du darfst bei deinem ersten Urteil bleiben. Vielleicht möchtest du wissen, ob auch eine andere Lampe dieses Modells flackert. Welcher Hinweis wäre für dich tatsächlich entscheidend?"
    },
    en: {
      scene: "You need a lamp for reading. You try one in a shop. Its light flickers.",
      question: "Would you buy this lamp?",
      choices: ["Probably", "Probably not", "I’ll check further."],
      clue: "A sign says: “Our best-selling model.”",
      reflection: "What matters for your decision? Has the clue changed that?",
      further: "Lots of sales do not explain the flickering. You can keep your first view. You might want to know whether another lamp of the same model flickers too. What clue would actually matter to you?"
    }
  }
];

export const game = {
  de: {
    name: "Auf den zweiten Blick",
    card: "Karte",
    fiction: "Eine erfundene Alltagsszene. Unsicher sein ist erlaubt.",
    first: "1 · Dein erster Gedanke",
    reveal: "Hinweis aufdecken",
    close: "Hinweis zuklappen",
    again: "Und jetzt?",
    second: "2 · Nach dem Hinweis",
    reactions: ["Ich bleibe dabei.", "Ich denke um.", "Ich lasse es offen."],
    next: "Nächste Karte",
    restart: "Zur ersten Karte",
    workshop: "Eine eigene Frage prüfen",
    reason: "3 · Dein Grund oder deine offene Frage (freiwillig)",
    reasonHint: "Ein Stichwort reicht. Schreib es auf, sag es laut oder denk kurz darüber nach.",
    reasonPlaceholder: "Ich denke das, weil … / Mir fehlt noch …",
    privacy: "Die Website speichert oder verschickt diese Notiz nicht.",
    principle: "Bleiben, ändern oder offenlassen: Entscheidend ist dein Grund.",
    further: "Noch einen Schritt weiter",
    transferTitle: "Jetzt ohne Karte",
    transfer: "Denk an eine kleine Frage aus deinem Alltag. Was vermutest du? Was spricht dafür? Was würde dagegen sprechen? Was könntest du selbst prüfen? Du musst hier keine Antwort eingeben.",
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
    fiction: "An invented everyday scene. It is fine to be unsure.",
    first: "1 · Your first thought",
    reveal: "Reveal the clue",
    close: "Hide the clue",
    again: "What about now?",
    second: "2 · After the clue",
    reactions: ["I’ll stick with it.", "I’ve changed my mind.", "I’ll leave it open."],
    next: "Next card",
    restart: "Back to the first card",
    workshop: "Explore a question of your own",
    reason: "3 · Your reason or open question (optional)",
    reasonHint: "A few words are enough. Write them, say them aloud, or take a moment to think.",
    reasonPlaceholder: "I think this because … / I still need to know …",
    privacy: "The website does not save or send this note.",
    principle: "Keep your view, change it, or leave it open: what matters is your reason.",
    further: "Take one more step",
    transferTitle: "Now try without a card",
    transfer: "Think of a small question from your day. What do you think? What supports it? What would count against it? What could you check yourself? You do not need to enter an answer here.",
    together: "Playing together? Read the question aloud. Tell each other what you picked before you reveal the clue.",
    print: "Print the checkout card (PDF)",
    share: "Pass on the question",
    link: "Show the card link",
    copied: "Question and link copied.",
    manual: "You can copy this link and pass it on."
  }
};
