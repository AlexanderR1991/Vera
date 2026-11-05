import {copy} from '../lib/symbol-math-copy.mjs';
import {binaryWord, flipLine, hammingDistance, binomialUpperTail, createWorksheet, worksheetKeys} from '../lib/symbol-math.mjs';

export function initSymbolMathLab() {
  const root = document.querySelector('[data-symbol-lab]');
  if (!root || root.dataset.initialized) return;
  const lang = root.dataset.lang;
  const t = copy[lang];
  if (!t) return;
  const find = selector => root.querySelector(selector);
  const all = selector => [...root.querySelectorAll(selector)];
  const number = value => value.toLocaleString(lang, {maximumSignificantDigits: 6});
  const probability = logP => {
    if (logP < Math.log(1e-300)) return '< 1e-300';
    const p = Math.exp(logP);
    return p > 0 && p < .0001 ? p.toExponential(4) : number(p);
  };

  const form = find('[data-worksheet]');
  const worksheetResult = find('[data-worksheet-result]');
  const worksheetStatus = find('[data-worksheet-status]');
  let sheet = null;
  let renderedSheet = '';
  function invalidateWorksheet() {
    sheet = null;
    renderedSheet = '';
    worksheetResult.hidden = true;
    worksheetStatus.textContent = t.changed;
  }
  form.addEventListener('input', invalidateWorksheet);
  form.addEventListener('change', invalidateWorksheet);
  find('[data-load-template]').addEventListener('click', () => {
    const example = t.templates[Number(find('[data-template]').value)];
    if (!example) return;
    for (const key of ['claimType', ...worksheetKeys]) form.elements.namedItem(key).value = example[key];
    invalidateWorksheet();
    form.elements.namedItem('symbol').focus();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    invalidateWorksheet();
    try {
      const values = Object.fromEntries(new FormData(form));
      sheet = createWorksheet(values, lang, new Date().toISOString());
      const type = t.typeOptions.find(([value]) => value === sheet.claimType)[1];
      renderedSheet = [t.worksheetTitle, t.draft, `${t.created}: ${sheet.createdAt}`, `${t.type}: ${type}`,
        ...t.fields.map(([key, label]) => `${label}\n${sheet.fields[key]}`), t.worksheetHint].join('\n\n');
      find('[data-worksheet-preview]').textContent = renderedSheet;
      worksheetResult.hidden = false;
      worksheetStatus.textContent = t.ready;
    } catch {
      sheet = null;
      worksheetStatus.textContent = t.invalid;
      form.reportValidity();
    }
  });
  all('[data-download]').forEach(button => button.addEventListener('click', () => {
    if (!sheet) return;
    const json = button.dataset.download === 'json';
    const blob = new Blob([json ? JSON.stringify(sheet, null, 2) : renderedSheet], {type: json ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `symbol-math-${lang}-${sheet.createdAt.slice(0,10)}.${json ? 'json' : 'txt'}`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }));

  let current = 42;
  let reference = 0;
  function renderBinary() {
    find('[data-binary-word]').textContent = binaryWord(current);
    find('[data-decimal]').textContent = current;
    find('[data-reference]').textContent = reference;
    find('[data-distance]').textContent = hammingDistance(current, reference);
    find('[data-neighbours]').textContent = [0,1,2,3,4,5].map(i => flipLine(current, i)).sort((a,b) => a-b).join(', ');
    all('[data-line]').forEach(button => {
      const i = Number(button.dataset.line);
      const bit = (current >> i) & 1;
      button.setAttribute('aria-pressed', String(!!bit));
      button.setAttribute('aria-label', `${t.line} ${i+1}: ${bit ? t.solid : t.broken}; ${t.toggle}`);
      button.querySelector('.lab-line').classList.toggle('is-solid', !!bit);
      button.querySelector('[data-line-bit]').textContent = bit;
    });
    all('[data-state]').forEach(button => {
      const value = Number(button.dataset.state);
      const selected = value === current, pinned = value === reference, neighbour = hammingDistance(current, value) === 1;
      button.classList.toggle('is-current', selected);
      button.classList.toggle('is-reference', pinned);
      button.classList.toggle('is-neighbour', neighbour);
      button.setAttribute('aria-pressed', String(selected));
      const labels = [`ID ${value}: ${binaryWord(value)}`, selected ? t.current : '', pinned ? t.reference : '', neighbour ? t.neighbour : ''].filter(Boolean);
      button.setAttribute('aria-label', labels.join('; '));
      button.querySelector('[data-marker]').textContent = [selected ? t.currentShort : '', pinned ? t.referenceShort : '', neighbour ? '•' : ''].filter(Boolean).join(' ');
    });
  }
  all('[data-line]').forEach(button => button.addEventListener('click', () => {current = flipLine(current, Number(button.dataset.line)); renderBinary();}));
  all('[data-state]').forEach(button => button.addEventListener('click', () => {current = Number(button.dataset.state); renderBinary();}));
  find('[data-pin]').addEventListener('click', () => {reference = current; renderBinary();});
  find('[data-invert]').addEventListener('click', () => {current ^= 63; renderBinary();});
  find('[data-reset-binary]').addEventListener('click', () => {current = 42; reference = 0; renderBinary();});

  const statForm = find('[data-statistics]');
  const statResult = find('[data-stat-result]');
  const statStatus = find('[data-stats-status]');
  statForm.addEventListener('input', () => {
    statResult.hidden = true;
    statStatus.textContent = t.statChanged;
    find('[data-data-status]').textContent = t.custom;
    const n = Number(statForm.elements.namedItem('n').value);
    if (Number.isInteger(n) && n >= 1 && n <= 10000) statForm.elements.namedItem('k').max = String(n);
  });
  statForm.addEventListener('submit', event => {
    event.preventDefault();
    statResult.hidden = true;
    try {
      if (!statForm.checkValidity()) throw new RangeError('input');
      const values = ['n','k','p0','m'].map(key => statForm.elements.namedItem(key).valueAsNumber);
      const result = binomialUpperTail(...values);
      find('[data-expected]').textContent = number(result.expected);
      find('[data-observed]').textContent = `${number(result.observed * 100)} %`;
      find('[data-delta]').textContent = `${result.difference > 0 ? '+' : ''}${number(result.difference * 100)} ${t.points}`;
      find('[data-tail]').textContent = probability(result.logTail);
      find('[data-adjusted]').textContent = probability(result.logAdjusted);
      statResult.hidden = false;
      statStatus.textContent = '';
    } catch {
      statStatus.textContent = t.statInvalid;
      statForm.reportValidity();
    }
  });
  renderBinary();
  root.dataset.initialized = 'true';
  all('[data-interactive]').forEach(fieldset => {fieldset.disabled = false;});
}
