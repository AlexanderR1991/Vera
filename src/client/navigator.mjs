import {connections, findConnections, assessConnection, buildNavigatorNote} from "../lib/navigator.mjs";
import {topics} from "../lib/tree.mjs";

const root = document.querySelector("[data-navigator]");

if (root) {
  const lang = root.dataset.lang === "en" ? "en" : "de";
  const t = (de, en) => lang === "en" ? en : de;
  const text = value => value?.[lang] ?? "";
  const find = selector => root.querySelector(selector);
  const question = find("[data-nav-question]");
  const status = find("[data-nav-status]");
  const results = find("[data-nav-results]");
  const resultList = find("[data-nav-result-list]");
  const panel = find("[data-nav-connection]");
  const assessment = find("[data-nav-assessment]");
  let connectionId = null;
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
    answers = {};
    panel.hidden = true;
    assessment.hidden = true;
    find("[data-nav-conditions]").replaceChildren();
    for (const button of resultList.querySelectorAll("button")) button.setAttribute("aria-pressed", "false");
  }

  function invalidateQuestion() {
    const hadResult = connectionId !== null || !results.hidden;
    clearConnection();
    results.hidden = true;
    resultList.replaceChildren();
    if (hadResult) announce(t("Frage geändert. Frühere Vorschläge und Voraussetzungen wurden zurückgesetzt. Suche erneut; deine Reflexionsnotizen bleiben erhalten.", "Question changed. Previous suggestions and conditions were reset. Search again; your reflection notes are kept."));
  }

  function definitionList(items) {
    const dl = element("dl");
    for (const [label, value] of items) dl.append(element("dt", label), element("dd", value));
    return dl;
  }

  function selectConnection(connection) {
    clearConnection();
    connectionId = connection.id;
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
    const topicLinks = element("p", t("Verbindungen im Baum: ", "Connections in the tree: "), "navigator-topic-links");
    for (const id of connection.topics) {
      const link = element("a", topics.find(topic => topic.id === id)?.name[lang] ?? id);
      link.href = root.dataset.treeUrl + "#ast-" + id;
      topicLinks.append(link);
    }
    evidence.append(topicLinks);
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
    for (const button of resultList.querySelectorAll("button")) button.setAttribute("aria-pressed", String(button.dataset.connectionId === connection.id));
    announce(t("Verbindung ausgewählt. Prüfe jetzt ihre Voraussetzungen. Frühere Antworten wurden zurückgesetzt.", "Connection selected. Now check its conditions. Previous answers were reset."));
    find("[data-nav-title]").focus();
  }

  function showResults(all = false) {
    clearConnection();
    const query = question.value.trim();
    const matches = all ? connections : findConnections(query, lang);
    results.hidden = false;
    resultList.replaceChildren();
    const noMatch = matches.length === 0;
    find("[data-nav-no-match]").hidden = !noMatch;
    const note = all
      ? t("Vier Arbeitsentwürfe zur eigenen Auswahl. Wähle einen Gedanken aus, dessen Voraussetzungen du untersuchen möchtest.", "Four working drafts to choose from. Select an idea whose conditions you would like to examine.")
      : noMatch
        ? (query ? t("In diesem kleinen Bestand wurde kein passender Stichworttreffer gefunden. Das bedeutet nicht, dass es keine hilfreiche Erkenntnis gibt.", "No matching keyword was found in this small collection. This does not mean that no helpful knowledge exists.") : t("Schreib eine Frage oder wähle ein erfundenes Beispiel. Du kannst auch alle vier Verbindungen durchsehen.", "Write a question or choose a fictional example. You can also browse all four connections."))
        : t("Diese Vorschläge beruhen nur auf Stichwörtern. Ähnliche Wörter zeigen noch nicht, dass ein Gedanke auf deinen Fall anwendbar ist.", "These suggestions are based only on keywords. Similar words do not establish that an idea applies to your situation.");
    find("[data-nav-results-note]").textContent = note;
    for (const connection of matches) {
      const button = element("button", undefined, "navigator-result");
      button.type = "button";
      button.dataset.connectionId = connection.id;
      button.setAttribute("aria-pressed", "false");
      button.append(element("span", t("VERBINDUNG ANSEHEN", "EXPLORE CONNECTION"), "navigator-result-eyebrow"), element("strong", text(connection.title)), element("span", text(connection.pattern)));
      button.addEventListener("click", () => selectConnection(connection));
      resultList.append(button);
    }
    announce(noMatch ? note : t(`${matches.length} ${matches.length === 1 ? "mögliche Verbindung" : "mögliche Verbindungen"}. Wähle einen Vorschlag aus.`, `${matches.length} possible ${matches.length === 1 ? "connection" : "connections"}. Choose a suggestion.`));
    find("#navigator-results-title").focus();
  }

  root.querySelectorAll("[data-nav-js]").forEach(control => { control.disabled = false; });
  question.addEventListener("input", invalidateQuestion);
  find("[data-nav-search]").addEventListener("submit", event => { event.preventDefault(); showResults(); });
  find("[data-nav-all]").addEventListener("click", () => showResults(true));
  root.querySelectorAll("[data-nav-example]").forEach(button => {
    button.addEventListener("click", () => {
      const connection = connections.find(item => item.id === button.dataset.navExample);
      if (!connection) return;
      question.value = text(connection.question);
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
      body.textContent = text(connection.conclusion);
      next.textContent = t("Möglicher nächster Schritt: ", "Possible next step: ") + text(connection.nextStep);
    } else if (result.status === "not_applicable") {
      title.textContent = t("Diese Verbindung passt so nicht", "This connection does not fit as stated");
      body.textContent = t("Mindestens eine notwendige Voraussetzung ist nach deinen Angaben nicht erfüllt. Die Schlussfolgerung dieser Karte lässt sich deshalb nicht auf deinen Fall übertragen. Das widerlegt nicht den allgemeinen Gedanken.", "At least one required condition is not met according to your answers. This card’s conclusion therefore cannot be transferred to your case. This does not refute the general idea.");
      conditionIds = result.failed;
      next.textContent = t("Nächster Schritt: Prüfe eine andere Verbindung oder untersuche deine Frage im Prüfblatt weiter.", "Next step: examine another connection or continue exploring your question in the worksheet.");
    } else if (result.status === "needs_context") {
      title.textContent = t("Hier fehlt noch eine Antwort", "Some context is still missing");
      body.textContent = t("Die Verbindung bleibt ein Vorschlag. Kläre zunächst diese Voraussetzungen, bevor du eine Schlussfolgerung daraus übernimmst:", "The connection remains a suggestion. Clarify these conditions before adopting a conclusion from it:");
      conditionIds = result.missing;
      next.textContent = t("Nächster Schritt: Halte fest, wie du diese Information herausfinden könntest. Du darfst die Frage offenlassen.", "Next step: record how you might find this information. You may leave the question open.");
    } else {
      title.textContent = t("Die Prüfung konnte nicht abgeschlossen werden", "The check could not be completed");
      body.textContent = t("Wähle die Verbindung erneut aus und prüfe ihre Voraussetzungen.", "Select the connection again and check its conditions.");
      next.textContent = "";
    }
    for (const id of conditionIds) {
      const condition = connection.conditions.find(item => item.id === id);
      if (condition) list.append(element("li", text(condition.label)));
    }
    list.hidden = !list.childElementCount;
    assessment.hidden = false;
    announce(title.textContent);
    title.focus();
  });

  find("[data-nav-export]").addEventListener("click", () => {
    const reflection = Object.fromEntries([...root.querySelectorAll("[data-nav-reflection-field]")].map(field => [field.dataset.navReflectionField, field.value]));
    const note = buildNavigatorNote({lang, question:question.value, connectionId, answers, reflection});
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
    root.querySelectorAll("[data-nav-reflection-field]").forEach(field => { field.value = ""; });
    clearConnection();
    results.hidden = true;
    resultList.replaceChildren();
    announce(t("Alle Eingaben und Prüfergebnisse auf dieser Seite wurden gelöscht. Bereits exportierte Dateien bleiben auf deinem Gerät.", "All entries and results on this page were cleared. Previously exported files remain on your device."));
    question.focus();
  });
}
