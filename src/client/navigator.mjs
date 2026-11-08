import {connections, assessConnection, conditionalConclusion, needsAllocationExamples, buildNavigatorNote, caseWording} from "../lib/navigator.mjs";
import {topics} from "../lib/tree.mjs";
import {discover} from "../lib/discovery.mjs";

const root = document.querySelector("[data-navigator]");

if (root) {
  const lang = root.dataset.lang === "en" ? "en" : "de";
  const t = (de, en) => lang === "en" ? en : de;
  const text = value => value?.[lang] ?? "";
  const find = selector => root.querySelector(selector);
  const question = find("[data-nav-question]");
  const alternativeQuestion = find("[data-nav-alternative-question]");
  const status = find("[data-nav-status]");
  const results = find("[data-nav-results]");
  const topicPanels = root.querySelectorAll(".navigator-topic");
  const topicList = find("[data-nav-topic-list]");
  const resultList = find("[data-nav-result-list]");
  const panel = find("[data-nav-connection]");
  const assessment = find("[data-nav-assessment]");
  let connectionId = null;
  let framing = null;
  let answers = {};

  function element(tag, content, className) {
    const node = document.createElement(tag);
    if (content !== undefined) node.textContent = content;
    if (className) node.className = className;
    return node;
  }

  function announce(message) { status.textContent = message; }

  function clearConnection() {
    connectionId = null;
    framing = null;
    answers = {};
    panel.hidden = true;
    assessment.hidden = true;
    find("[data-nav-conditions]").replaceChildren();
    panel.removeAttribute("id");
  }

  function invalidateQuestion() {
    const hadResult = connectionId !== null || !results.hidden || location.hash.startsWith("#thema-");
    clearDiscoveryHash();
    clearConnection();
    results.hidden = true;
    resultList.replaceChildren();
    topicList.replaceChildren();
    if (hadResult) announce(t("Frage geändert. Suche erneut, um die passenden Themen und Muster zu sehen.", "Question changed. Search again to see matching topics and patterns."));
  }

  function definitionList(items) {
    const dl = element("dl");
    for (const [label, value] of items) dl.append(element("dt", label), element("dd", value));
    return dl;
  }

  function selectConnection(connection, wording) {
    clearConnection();
    connectionId = connection.id;
    framing = wording;
    find("[data-nav-case-wording]").textContent = caseWording(framing, question.value, alternativeQuestion.value, lang);
    panel.id = "verbindung-" + connection.id;
    answers = Object.fromEntries(connection.conditions.map(condition => [condition.id, "unknown"]));
    find("[data-nav-meta]").textContent = `${connection.id} · v${connection.version} · ${t("ENTWURF", "DRAFT")} · ${connection.type === "normative" ? t("WERTGRUNDSATZ", "VALUE PRINCIPLE") : t("FORMALER ZUSAMMENHANG", "FORMAL RELATION")}`;
    find("[data-nav-title]").textContent = text(connection.title);
    find("[data-nav-bridge]").replaceChildren(
      definitionList([[t("Mögliches Muster", "Possible pattern"), text(connection.pattern)]]),
      definitionList([[t("Allgemeiner Gedanke", "General idea"), text(connection.principle)]])
    );

    const conditions = find("[data-nav-conditions]");
    for (const [index, condition] of connection.conditions.entries()) {
      const row = element("div", undefined, "navigator-condition");
      const id = `navigator-condition-${index}`;
      const label = element("label", text(condition.label));
      label.htmlFor = id;
      const select = element("select");
      select.id = id;
      select.name = condition.id;
      for (const [value, labelText] of [["unknown", t("Unklar / weiß ich noch nicht", "Unsure / I do not know yet")], ["yes", t("Ja, das trifft zu", "Yes, this applies")], ["no", t("Nein, das trifft nicht zu", "No, this does not apply")]]) {
        const option = element("option", labelText);
        option.value = value;
        select.append(option);
      }
      select.addEventListener("change", () => {
        answers[condition.id] = select.value;
        assessment.hidden = true;
        announce(t("Voraussetzung geändert. Prüfe die Verbindung mit den neuen Angaben erneut.", "Condition changed. Check the connection again using your new answers."));
      });
      row.append(label, select);
      conditions.append(row);
    }

    if (connection.amounts) {
      const examples = conditions.querySelector('[name="mean_only"]').closest(".navigator-condition");
      examples.hidden = true;
      conditions.append(element("p", t("Gib beide Zahlen in derselben Einheit ein. Verwende bei Bedarf ein Dezimalkomma oder einen Dezimalpunkt, ohne Tausendertrennzeichen. Bis zu 32 Zeichen je Zahl. Ohne genaue Zahlen bleibt die Rechnung offen.", "Enter both numbers in the same unit. You can use a decimal point or comma, without thousands separators. Use up to 32 characters per number. Without exact figures the calculation remains open.")));
      for (const field of connection.amounts) {
        const row = element("div", undefined, "navigator-condition");
        const input = element("input");
        input.id = "navigator-amount-" + field.id;
        input.inputMode = "decimal";
        const label = element("label", text(field.label));
        label.htmlFor = input.id;
        input.addEventListener("input", () => {
          answers[field.id] = input.value.trim();
          examples.hidden = !needsAllocationExamples(answers);
          examples.querySelector("select").value = "unknown";
          answers.mean_only = "unknown";
          assessment.hidden = true;
        });
        row.append(label, input);
        conditions.append(row);
      }
      conditions.append(examples);
    }

    const evidence = find("[data-nav-evidence-content]");
    evidence.replaceChildren(definitionList([
      [t("Geltungsbereich", "Scope"), text(connection.scope)],
      [t("Begründung", "Reasoning"), text(connection.rationale)],
      [t("Was dagegen sprechen kann", "What may challenge it"), text(connection.counterargument)],
      [t("Wann ändern?", "When to revise?"), text(connection.revision)]
    ]));
    const sourceList = element("ul", undefined, "navigator-sources");
    for (const source of connection.sources) {
      const item = element("li");
      const link = element("a", text(source.label));
      link.href = source.url;
      item.append(link, element("span", " · " + (source.role === "provenance" ? t("Herkunft", "Provenance") : t("Ableitung", "Derivation"))));
      sourceList.append(item);
    }
    evidence.append(sourceList);
    const topicLinks = find("[data-nav-connected-topics]");
    topicLinks.textContent = t("Verbundene Themen erkunden · ", "Explore connected topics · ");
    for (const id of connection.topics) {
      const link = element("a", topics.find(topic => topic.id === id)?.name[lang] ?? id);
      link.href = "#thema-" + id;
      topicLinks.append(link);
    }
    if (connection.sourceClaim) {
      const claim = element("p");
      const link = element("a", t("Bezugsfassung im Aussagenregister: ", "Related claim in the register: ") + `${connection.sourceClaim.id} v${connection.sourceClaim.version}`);
      link.href = root.dataset.claimsUrl + "#" + connection.sourceClaim.id;
      claim.append(link);
      evidence.append(claim);
    }
    evidence.append(element("p", t("Arbeitsentwurf: Eine unabhängige Fachprüfung steht aus. Deine Bedingungsprüfung ändert diesen Prüfstatus nicht.", "Working draft: independent expert review is pending. Your condition check does not change this review status."), "navigator-note"));
    find("[data-nav-evidence]").open = false;
    panel.hidden = false;
    announce(t("Verbindung ausgewählt. Prüfe jetzt ihre Voraussetzungen. Frühere Antworten wurden zurückgesetzt.", "Connection selected. Now check its conditions. Previous answers were reset."));
    find("[data-nav-title]").focus();
  }

  function clearDiscoveryHash() {
    for (const section of topicPanels) section.hidden = true;
    if (/^#(thema|verbindung)-/.test(location.hash)) {
      history.replaceState(history.state, "", location.pathname + location.search);
    }
  }

  function openFragment(wording) {
    const hash = location.hash;
    for (const section of topicPanels) section.hidden = "#" + section.id !== hash;
    const connection = connections.find(item => "#verbindung-" + item.id === hash);
    if (connection) {
      selectConnection(connection, wording);
      return;
    }
    clearConnection();
    const topic = topics.find(item => "#thema-" + item.id === hash);
    if (topic) {
      document.getElementById("topic-title-" + topic.id).focus();
      announce(t("Thema geöffnet. Frühere Antworten zur Bedingungsprüfung wurden zurückgesetzt.", "Topic opened. Previous condition answers have been reset."));
    } else if (!hash && !results.hidden) {
      find("#navigator-results-title").focus();
    }
  }

  // With JS, the reading-card fragment opens the interactive check instead.
  for (const card of root.querySelectorAll(".navigator-reading-card[id]")) card.removeAttribute("id");
  window.addEventListener("hashchange", () => openFragment());
  // Only a direct choice from a wording's search results ties the card to that wording.
  root.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#verbindung-"]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, "", link.hash);
    openFragment(link.dataset.framing);
  });

  function resultItem(href, title, description, terms, cues, wording) {
    const item = element("li", undefined, "navigator-result");
    const link = element("a", title);
    link.href = href;
    if (wording) link.dataset.framing = wording;
    item.append(link, element("p", description));
    if (terms.length) item.append(element("small", t("Gefundene Wörter · ", "Matched words · ") + terms.join(", ")));
    if (cues?.length) {
      item.append(element("small", t("Zwei Hinweise aus deiner Frage · ", "Two clues from your question · ") + cues.map(cue => t("„", "“") + cue + t("“", "”")).join(" + ")));
    }
    return item;
  }

  function showResults(mode = "original") {
    const all = mode === "all";
    clearDiscoveryHash();
    clearConnection();
    const query = (mode === "alternative" ? alternativeQuestion : question).value.trim();
    const hits = all ? {topics: [], patterns: connections.map(connection => ({connection, terms: []}))} : discover(query, lang);
    results.hidden = false;
    topicList.replaceChildren(...hits.topics.map(({topic, terms}) =>
      resultItem("#thema-" + topic.id, text(topic.name), text(topic.question), terms)));
    resultList.replaceChildren(...hits.patterns.map(({connection, terms, cues}) =>
      resultItem("#verbindung-" + connection.id, text(connection.title), text(connection.pattern), terms, cues, all ? null : mode)));
    find("[data-nav-topic-hits]").hidden = !hits.topics.length;
    find("[data-nav-pattern-hits]").hidden = !hits.patterns.length;
    const noMatch = !hits.topics.length && !hits.patterns.length;
    find("[data-nav-no-match]").hidden = !noMatch;
    const note = all ? t("Wähle eine Musterkarte, um ihre Voraussetzungen zu prüfen.", "Choose a pattern card to check its conditions.")
      : noMatch ? (query ? t("Zu diesen Wörtern gibt es im bisherigen Bestand keinen Treffer.", "These words have no match in the current collection.") : t("Gib eine Frage oder einen Begriff ein.", "Enter a question or a term."))
      : t("Öffne ein Thema, um Verbindungen zu erkunden. Bei einer Musterkarte prüfst du selbst, ob sie auf deinen Fall passt.", "Open a topic to explore its connections. On a pattern card, you can check whether it fits your case.");
    const wording = !all && query && alternativeQuestion.value.trim()
      ? (mode === "alternative" ? t("Treffer zur anderen Formulierung. ", "Results for the alternative wording. ") : t("Treffer zur Ausgangsfrage. ", "Results for the original question. "))
      : "";
    find("[data-nav-results-note]").textContent = wording + note;
    announce(noMatch ? note : t(`Gefundene Themen: ${hits.topics.length}. Musterkarten: ${hits.patterns.length}.`, `Topics found: ${hits.topics.length}. Pattern cards: ${hits.patterns.length}.`));
    find("#navigator-results-title").focus();
  }

  root.classList.add("navigator-ready");
  openFragment();
  root.querySelectorAll("[data-nav-js]").forEach(control => { control.disabled = false; });
  question.addEventListener("input", invalidateQuestion);
  alternativeQuestion.addEventListener("input", invalidateQuestion);
  find("[data-nav-search-alternative]").addEventListener("click", () => showResults("alternative"));
  find("[data-nav-search]").addEventListener("submit", event => { event.preventDefault(); showResults(); });
  find("[data-nav-all]").addEventListener("click", () => showResults("all"));
  root.querySelectorAll("[data-nav-example]").forEach(button => {
    button.addEventListener("click", () => {
      question.value = button.textContent.trim();
      alternativeQuestion.value = "";
      invalidateQuestion();
      showResults();
    });
  });

  find("[data-nav-condition-form]").addEventListener("submit", event => {
    event.preventDefault();
    const connection = connections.find(item => item.id === connectionId);
    if (!connection) return;
    const result = assessConnection(connectionId, answers);
    const title = find("[data-nav-assessment-title]");
    const body = find("[data-nav-assessment-text]");
    const next = find("[data-nav-next-step]");
    const list = find("[data-nav-assessment-list]");
    list.replaceChildren();
    let conditionIds = [];
    assessment.dataset.state = result.status;
    find("[data-nav-assessment-label]").textContent = t("ERGEBNIS DEINER ANGABEN", "RESULT BASED ON YOUR ANSWERS");
    if (result.status === "conditional") {
      title.textContent = t("Unter deinen Angaben anwendbar", "Applicable under your stated conditions");
      body.textContent = conditionalConclusion(connection, answers, lang);
      next.textContent = t("Möglicher nächster Schritt: ", "Possible next step: ") + text(connection.nextStep);
    } else if (result.status === "not_applicable") {
      title.textContent = t("Diese Verbindung passt so nicht", "This connection does not fit as stated");
      body.textContent = t("Mindestens eine notwendige Voraussetzung ist nach deinen Angaben nicht erfüllt. Die Schlussfolgerung dieser Karte lässt sich deshalb nicht auf deinen Fall übertragen. Das widerlegt nicht den allgemeinen Gedanken.", "At least one required condition is not met according to your answers. This card’s conclusion therefore cannot be transferred to your case. This does not refute the general idea.");
      if (result.failed.includes("mean_only")) {
        body.textContent = t("Mindestens eine vorgeschlagene Verteilung scheidet aus. Ob alle die Schwelle erreichen, ist so noch nicht entschieden. Prüfe die zusätzlichen Grenzen oder suche zwei andere zulässige Verteilungen mit verschiedenen Antworten.", "At least one proposed allocation is ruled out. Whether everyone meets the minimum has yet to be settled. Check the additional constraints or find two other permitted allocations with opposite answers.");
      }
      conditionIds = result.failed;
      const alternative = connection.conditions.find(item => item.whenNo && result.failed.includes(item.id));
      next.textContent = alternative ? text(alternative.whenNo)
        : t("Nächster Schritt: Prüfe eine andere Verbindung oder untersuche deine Frage im Prüfblatt weiter.", "Next step: examine another connection or continue exploring your question in the worksheet.");
    } else if (result.status === "needs_context") {
      title.textContent = t("Hier fehlt noch eine Antwort", "Some context is still missing");
      body.textContent = t("Die Verbindung bleibt ein Vorschlag. Kläre zunächst diese Voraussetzungen, bevor du eine Schlussfolgerung daraus übernimmst:", "The connection remains a suggestion. Clarify these conditions before adopting a conclusion from it:");
      if (connection.amounts?.some(field => result.missing.includes(field.id))) {
        body.textContent = t("Noch nicht entschieden. Für diese Rechnung brauchen wir die bestätigten Voraussetzungen und zwei nichtnegative Dezimalzahlen mit höchstens 32 Zeichen. Eine fehlende Angabe lässt offen, welche Verteilungen möglich sind.", "Not yet decided. This calculation requires confirmed premises and two nonnegative decimal numbers of at most 32 characters each. Missing information leaves the possible allocations unexamined.");
      }
      conditionIds = result.missing;
      next.textContent = t("Nächster Schritt: Halte fest, wie du diese Information herausfinden könntest. Du darfst die Frage offenlassen.", "Next step: record how you might find this information. You may leave the question open.");
    } else {
      title.textContent = t("Die Prüfung konnte nicht abgeschlossen werden", "The check could not be completed");
      body.textContent = t("Wähle die Verbindung erneut aus und prüfe ihre Voraussetzungen.", "Select the connection again and check its conditions.");
      next.textContent = "";
    }
    for (const id of conditionIds) {
      const condition = [...connection.conditions, ...(connection.amounts ?? [])].find(item => item.id === id);
      if (condition) list.append(element("li", text(condition.label)));
    }
    list.hidden = !list.childElementCount;
    assessment.hidden = false;
    announce(title.textContent);
    title.focus();
  });

  find("[data-nav-export]").addEventListener("click", () => {
    const reflection = Object.fromEntries([...root.querySelectorAll("[data-nav-reflection-field]")].map(field => [field.dataset.navReflectionField, field.value]));
    const note = buildNavigatorNote({lang, question:question.value, alternativeQuestion:alternativeQuestion.value, framing, connectionId, answers, reflection});
    const url = URL.createObjectURL(new Blob([note], {type:"text/plain;charset=utf-8"}));
    const link = element("a");
    link.href = url;
    link.download = `wirklich-${lang === "de" ? "erkenntnisnotiz" : "inquiry-note"}.txt`;
    root.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce(t("Textdatei zum Herunterladen erstellt. Sie wurde nicht an das Projekt gesendet.", "Text file created for download. It was not sent to the project."));
  });

  find("[data-nav-reset]").addEventListener("click", () => {
    question.value = "";
    alternativeQuestion.value = "";
    clearDiscoveryHash();
    topicList.replaceChildren();
    root.querySelectorAll("[data-nav-reflection-field]").forEach(field => { field.value = ""; });
    clearConnection();
    results.hidden = true;
    resultList.replaceChildren();
    announce(t("Alle Eingaben und Prüfergebnisse auf dieser Seite wurden gelöscht. Bereits exportierte Dateien bleiben auf deinem Gerät.", "All entries and results on this page were cleared. Previously exported files remain on your device."));
    question.focus();
  });
}
