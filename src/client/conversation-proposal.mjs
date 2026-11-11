// Fictional responses on this page only. No identity checks, network or storage.
const responses = new Set(["agree", "decline", "pause", "worse"]);
const allResponses = new Set(["pending", ...responses]);

function wording(text) {
  if (typeof text !== "string" || !text.trim()) throw new TypeError("Provide specific proposal wording.");
  return text.trim();
}

function assertSnapshot(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) throw new TypeError("Expected a proposal state.");
  wording(state.text);
  if (!Number.isSafeInteger(state.revision) || state.revision < 1) throw new TypeError("Expected a proposal revision.");
  if (!state.responses || typeof state.responses !== "object" || Array.isArray(state.responses) || !Object.keys(state.responses).length) {
    throw new TypeError("Expected responses for the fictional roles.");
  }
  for (const [role, value] of Object.entries(state.responses)) {
    if (!role.trim() || !allResponses.has(value)) throw new TypeError("Invalid fictional role or response.");
  }
}

function assertState(state) {
  assertSnapshot(state);
  if (!Array.isArray(state.history)) throw new TypeError("Expected previous proposal revisions.");
  state.history.forEach(assertSnapshot);
}

const snapshot = state => ({text: state.text, revision: state.revision, responses: {...state.responses}});
const pending = roleIds => Object.fromEntries(roleIds.map(role => [role, "pending"]));

export function createProposalState({text, roleIds} = {}) {
  const proposalText = wording(text);
  if (!Array.isArray(roleIds) || !roleIds.length || roleIds.some(role => typeof role !== "string" || !role.trim())) {
    throw new TypeError("Provide distinct fictional role IDs.");
  }
  const roles = roleIds.map(role => role.trim());
  if (new Set(roles).size !== roles.length) throw new TypeError("Fictional role IDs must be distinct.");
  return {text: proposalText, revision: 1, responses: pending(roles), history: []};
}

export function reviseProposal(state, text) {
  assertState(state);
  const nextText = wording(text);
  if (nextText === state.text) return state;
  if (state.revision === Number.MAX_SAFE_INTEGER) throw new RangeError("The revision limit has been reached.");
  return {
    text: nextText,
    revision: state.revision + 1,
    responses: pending(Object.keys(state.responses)),
    history: [...state.history.map(snapshot), snapshot(state)]
  };
}

export function respondToProposal(state, roleId, response) {
  assertState(state);
  if (typeof roleId !== "string" || !Object.hasOwn(state.responses, roleId)) {
    throw new TypeError("Choose one of the fictional roles.");
  }
  if (!responses.has(response)) throw new RangeError("Unknown proposal response.");
  if (state.responses[roleId] === response) return state;
  if (state.responses[roleId] === "worse") throw new Error("A reported harm remains visible for this revision.");
  return {...state, responses: {...state.responses, [roleId]: response}};
}

export function mountConversationProposals(root = document) {
  const panels = [
    ...(root.matches?.("[data-conversation-proposal]") ? [root] : []),
    ...root.querySelectorAll("[data-conversation-proposal]")
  ];
  for (const panel of panels) {
    if (panel.dataset.proposalMounted) continue;
    const textNode = panel.querySelector("[data-proposal-text]");
    const roleSelect = panel.querySelector("[data-proposal-role]");
    const input = panel.querySelector("[data-proposal-input]");
    const status = panel.querySelector("[data-proposal-status]");
    if (!textNode || !roleSelect || !input || !status) continue;
    let labels;
    let state;
    try {
      labels = JSON.parse(panel.dataset.labels || "{}");
      state = createProposalState({text: textNode.textContent, roleIds: [...roleSelect.options].map(option => option.value)});
    } catch {
      // Keep the prepared proposal readable when enhancement is unavailable.
      continue;
    }
    panel.dataset.proposalMounted = "true";
    const initialText = state.text;
    const kind = panel.querySelector("[data-proposal-kind]");
    const initialKind = kind?.textContent || "";
    const roleNames = Object.fromEntries([...roleSelect.options].map(option => [option.value, option.textContent.trim()]));
    const message = value => { status.textContent = value || ""; };
    const hasHarm = () => Object.values(state.responses).includes("worse");

    function render(updateInput = false) {
      textNode.textContent = state.text;
      if (updateInput) input.value = state.text;
      for (const node of panel.querySelectorAll("[data-proposal-revision]")) node.textContent = String(state.revision);
      for (const node of panel.querySelectorAll("[data-proposal-role-status]")) {
        const value = state.responses[node.dataset.proposalRoleStatus];
        if (value) node.textContent = labels[value] || value;
      }
      const history = panel.querySelector("[data-proposal-history]");
      if (history) {
        history.textContent = state.history.length ? state.history.map(previous => {
          const replies = Object.entries(previous.responses).map(([role, value]) => `${roleNames[role]}: ${labels[value] || value}`).join("; ");
          return `${labels.previous || "Previous demo revision"} ${previous.revision}: ${previous.text}\n${replies}`;
        }).join("\n\n") : labels.noHistory || "";
      }
      if (kind) kind.textContent = state.revision > 1 ? labels.editedKind || "" : initialKind;
      const origin = panel.querySelector("[data-proposal-origin]");
      if (origin) origin.textContent = (state.revision > 1 ? labels.editedOrigin : labels.originalOrigin) || "";
      const review = panel.querySelector("[data-proposal-review]");
      if (review) review.textContent = state.revision > 1 ? labels.needsReview || "" : "";
      for (const button of panel.querySelectorAll("[data-proposal-response]")) {
        button.setAttribute("aria-pressed", String(state.responses[roleSelect.value] === button.dataset.proposalResponse));
      }
    }

    function save(text) {
      let next;
      try { next = reviseProposal(state, text); } catch {
        message(labels.empty);
        input.focus();
        return;
      }
      const changed = next !== state;
      state = next;
      render(true);
      message(changed ? labels.changed : hasHarm() ? labels.stopped : labels.local);
    }

    for (const button of panel.querySelectorAll("[data-proposal-response]")) {
      button.addEventListener("click", event => {
        event.preventDefault();
        try { state = respondToProposal(state, roleSelect.value, button.dataset.proposalResponse); } catch {
          message(labels.stopped);
          return;
        }
        render();
        message(hasHarm() ? labels.stopped : `${roleNames[roleSelect.value]}: ${labels[state.responses[roleSelect.value]]}. ${labels.recorded || ""}`);
      });
    }
    panel.querySelector("[data-proposal-save]")?.addEventListener("click", event => {
      event.preventDefault();
      save(input.value);
    });
    for (const button of panel.querySelectorAll("[data-proposal-alternative]")) {
      button.addEventListener("click", event => {
        event.preventDefault();
        save(button.dataset.alternativeText);
      });
    }
    roleSelect.addEventListener("change", () => {
      render();
      message(hasHarm() ? labels.stopped : labels.local);
    });
    panel.querySelector("[data-proposal-reset]")?.addEventListener("click", event => {
      event.preventDefault();
      state = createProposalState({text: initialText, roleIds: Object.keys(roleNames)});
      const edit = panel.querySelector("[data-proposal-edit]");
      if (edit) edit.open = false;
      render(true);
      message(labels.local);
    });
    for (const controls of panel.querySelectorAll("[data-proposal-controls]")) controls.hidden = false;
    render(true);
    message(labels.local);
  }
}
