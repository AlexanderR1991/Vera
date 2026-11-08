export const comparisonResults = {
  de: {open: "Noch offen.", yes: "Erfüllt die Bedingung.", no: "Erfüllt die Bedingung nicht."},
  en: {open: "Still open.", yes: "Meets the requirement.", no: "Does not meet the requirement."}
};

// An assessment applies to this option under this particular requirement.
export function assessOption(criterion, name, answer, previous) {
  criterion = criterion.trim();
  name = name.trim();
  const sameQuestion = criterion && name && previous?.criterion === criterion && previous.name === name;
  return {criterion, name, answer: sameQuestion && ["yes", "no"].includes(answer) ? answer : "open"};
}

export function comparisonNote(options, lang) {
  const [first, second] = options;
  if (!first.criterion || first.criterion !== second.criterion || !first.name || !second.name) return "";
  const heading = lang === "en"
    ? `My assessment of the requirement “${first.criterion}”`
    : `Meine Einschätzung zur Bedingung „${first.criterion}“`;
  return [
    heading,
    ...options.map(option => `${option.name} — ${comparisonResults[lang][option.answer]}`)
  ].join("\n");
}

export function appendComparison(existing, note, maxLength) {
  if (!note) return {status: "incomplete", value: existing};
  if (`\n${existing}\n`.includes(`\n${note}\n`)) return {status: "duplicate", value: existing};
  const value = existing ? `${existing}\n\n${note}` : note;
  return value.length <= maxLength ? {status: "added", value} : {status: "full", value: existing};
}
