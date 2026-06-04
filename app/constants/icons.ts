/**
 * Icon name maps keyed by content id. Centralized here so components stay
 * focused on layout and the icon set used across the site is easy to audit.
 * Values are Iconify names (tabler / simple-icons / circle-flags).
 */

export const highlightIcons: Record<string, string> = {
  governance: 'i-tabler-building-bank',
  infrastructure: 'i-tabler-server-2',
  events: 'i-tabler-calendar-event',
}

export const roleIcons: Record<string, string> = {
  'creup-digitalization': 'i-tabler-server-2',
  'enem-treasurer': 'i-tabler-calculator',
  'ugr-council': 'i-tabler-building-bank',
  'dge-treasurer': 'i-tabler-coins',
}

export const academicIcons: Record<string, string> = {
  mugeps: 'i-tabler-briefcase',
  'cybersecurity-master': 'i-tabler-shield-lock',
  'math-degree': 'i-tabler-math-function',
  'data-analyst': 'i-simple-icons-googlecloud',
  'math-conferences': 'i-tabler-presentation',
}

export const languageFlags: Record<string, string> = {
  english: 'circle-flags:gb',
  german: 'circle-flags:de',
  spanish: 'circle-flags:es',
}

export const competencyIcons: Record<string, string> = {
  'project-management': 'i-tabler-list-check',
  'team-leadership': 'i-tabler-users',
  governance: 'i-tabler-building-bank',
  communication: 'i-tabler-speakerphone',
  systems: 'i-tabler-server-2',
  'cybersecurity-management': 'i-tabler-shield-lock',
  compliance: 'i-tabler-shield-check',
  automation: 'i-tabler-robot',
  'data-analysis': 'i-tabler-chart-dots',
  'problem-solving': 'i-tabler-puzzle',
  'strategic-thinking': 'i-tabler-brain',
}

export const representationIcons: Record<string, string> = {
  'start-2020': 'i-tabler-rocket',
  'end-first-term': 'i-tabler-refresh',
  'external-relations': 'i-tabler-world',
  'academic-vicecoord': 'i-tabler-school',
  'creup-digitalization': 'i-tabler-server-2',
  'dge-advisor': 'i-tabler-shield-check',
  'upv-delegate': 'i-tabler-users',
}

export const projectIcons: Record<string, string> = {
  server: 'i-tabler-server-2',
  firmas: 'i-tabler-signature',
  'win-ens': 'i-tabler-shield-lock',
  ceebi: 'i-tabler-calendar-event',
}

export const techIcons: Record<string, string> = {
  nuxt: 'i-simple-icons-nuxt',
  vue: 'i-simple-icons-vuedotjs',
  linux: 'i-simple-icons-linux',
  docker: 'i-simple-icons-docker',
  powershell: 'i-simple-icons-powershell',
  python: 'i-simple-icons-python',
  php: 'i-simple-icons-php',
  sql: 'i-tabler-database',
  nginx: 'i-simple-icons-nginx',
  dns: 'i-tabler-world-www',
  typescript: 'i-simple-icons-typescript',
  node: 'i-simple-icons-nodedotjs',
}
