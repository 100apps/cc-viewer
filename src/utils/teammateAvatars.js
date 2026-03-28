import analystSvg from '../img/teammates/analyst.svg';
import auditorSvg from '../img/teammates/auditor.svg';
import builderSvg from '../img/teammates/builder.svg';
import defaultSvg from '../img/teammates/default.svg';
import designerSvg from '../img/teammates/designer.svg';
import executorSvg from '../img/teammates/executor.svg';
import expertSvg from '../img/teammates/expert.svg';
import explorerSvg from '../img/teammates/explorer.svg';
import implementerSvg from '../img/teammates/implementer.svg';
import investigatorSvg from '../img/teammates/investigator.svg';
import researcherSvg from '../img/teammates/researcher.svg';
import reviewerSvg from '../img/teammates/reviewer.svg';
import scannerSvg from '../img/teammates/scanner.svg';
import securitySvg from '../img/teammates/security.svg';
import tracerSvg from '../img/teammates/tracer.svg';
import translatorSvg from '../img/teammates/translator.svg';
import workerSvg from '../img/teammates/worker.svg';

export const ROLE_MAP = {
  worker:       { svg: workerSvg,       color: '#5b6abf' },
  reviewer:     { svg: reviewerSvg,     color: '#2a9d8f' },
  researcher:   { svg: researcherSvg,   color: '#6366f1' },
  explorer:     { svg: explorerSvg,     color: '#d97706' },
  analyst:      { svg: analystSvg,      color: '#3b82f6' },
  tracer:       { svg: tracerSvg,       color: '#8b5cf6' },
  investigator: { svg: investigatorSvg, color: '#0e7490' },
  builder:      { svg: builderSvg,      color: '#ea580c' },
  implementer:  { svg: implementerSvg,  color: '#059669' },
  auditor:      { svg: auditorSvg,      color: '#e11d48' },
  translator:   { svg: translatorSvg,   color: '#0284c7' },
  security:     { svg: securitySvg,     color: '#dc2626' },
  scanner:      { svg: scannerSvg,      color: '#65a30d' },
  expert:       { svg: expertSvg,       color: '#ca8a04' },
  executor:     { svg: executorSvg,     color: '#9333ea' },
  designer:     { svg: designerSvg,     color: '#db2777' },
  default:      { svg: defaultSvg,      color: '#6b7280' },
};

const PREFIX_RULES = [
  { prefix: 'worker-',       role: 'worker' },
  { prefix: 'reviewer-',     role: 'reviewer' },
  { prefix: 'researcher-',   role: 'researcher' },
  { prefix: 'explorer-',     role: 'explorer' },
  { prefix: 'explore-',      role: 'explorer' },
  { prefix: 'translator-',   role: 'translator' },
  { prefix: 'svg-creator-',  role: 'designer' },
];

const SUFFIX_RULES = [
  { suffix: '-reviewer',      role: 'reviewer' },
  { suffix: '-analyst',       role: 'analyst' },
  { suffix: '-tracer',        role: 'tracer' },
  { suffix: '-investigator',  role: 'investigator' },
  { suffix: '-builder',       role: 'builder' },
  { suffix: '-impl',          role: 'implementer' },
  { suffix: '-auditor',       role: 'auditor' },
  { suffix: '-scanner',       role: 'scanner' },
  { suffix: '-expert',        role: 'expert' },
  { suffix: '-executor',      role: 'executor' },
];

const CONTAINS_RULES = [
  { keyword: 'security',     role: 'security' },
  { keyword: 'implementer',  role: 'implementer' },
];

const ABBREV_PREFIX_RULES = [
  { prefix: 'cr-', role: 'reviewer' },
  { prefix: 'r-',  role: 'reviewer' },
  { prefix: 'ui-', role: 'reviewer' },
  { prefix: 'ux-', role: 'reviewer' },
];

function resolveRole(name) {
  const lower = name.toLowerCase();

  for (const { prefix, role } of PREFIX_RULES) {
    if (lower.startsWith(prefix)) return role;
  }

  for (const { suffix, role } of SUFFIX_RULES) {
    if (lower.endsWith(suffix)) return role;
  }

  for (const { keyword, role } of CONTAINS_RULES) {
    if (lower.includes(keyword)) return role;
  }

  for (const { prefix, role } of ABBREV_PREFIX_RULES) {
    if (lower.startsWith(prefix)) return role;
  }

  return 'default';
}

export function getTeammateAvatar(name) {
  const role = resolveRole(name || '');
  const entry = ROLE_MAP[role];
  return { svg: entry.svg, color: entry.color, role };
}
