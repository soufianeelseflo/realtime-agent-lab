const PATTERNS = [
  { kind: 'openai-api-key', regex: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g },
  { kind: 'anthropic-api-key', regex: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g },
  { kind: 'github-token', regex: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g },
  { kind: 'bearer-token', regex: /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}\b/gi },
  { kind: 'email', regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { kind: 'card-like', regex: /\b(?:\d[ -]*?){13,19}\b/g }
];

export function scanText(text) {
  const findings = [];
  if (typeof text !== 'string') return findings;
  for (const { kind, regex } of PATTERNS) {
    regex.lastIndex = 0;
    for (const match of text.matchAll(regex)) {
      findings.push({ kind, index: match.index, length: match[0].length, preview: `${match[0].slice(0, 4)}…` });
    }
  }
  return findings;
}

export function redactText(text) {
  if (typeof text !== 'string') return text;
  let output = text;
  for (const { kind, regex } of PATTERNS) {
    regex.lastIndex = 0;
    output = output.replace(regex, `[REDACTED:${kind}]`);
  }
  return output;
}

export function scanObject(value, path = '$') {
  const findings = [];
  if (typeof value === 'string') return scanText(value).map(finding => ({ ...finding, path }));
  if (Array.isArray(value)) value.forEach((item, index) => findings.push(...scanObject(item, `${path}[${index}]`)));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => findings.push(...scanObject(item, `${path}.${key}`)));
  return findings;
}

export function redactObject(value) {
  if (typeof value === 'string') return redactText(value);
  if (Array.isArray(value)) return value.map(redactObject);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactObject(item)]));
  return value;
}
