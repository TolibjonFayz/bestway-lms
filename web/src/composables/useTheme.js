import { readonly, ref } from 'vue'

const STORAGE_KEY = 'bw.theme'
export const DEFAULT_THEME = 'bestway'

/** The catalogue the settings gallery renders. `swatch` drives the preview
    card, so it must match what the CSS actually sets for that theme. */
export const THEMES = [
  {
    id: 'bestway',
    name: 'Bestway',
    description: 'Markaz brendidagi asosiy yashil',
    swatch: { accent: '#16a34a', bg: '#f8fafc', surface: '#ffffff', ink: '#0f172a' },
    dark: false,
  },
  {
    id: 'okean',
    name: 'Okean',
    description: 'Salqin moviy, yumshoq soyalar',
    swatch: { accent: '#0891b2', bg: '#f6fafc', surface: '#ffffff', ink: '#0f172a' },
    dark: false,
  },
  {
    id: 'shafaq',
    name: 'Shafaq',
    description: 'Iliq pushti-qizil, yumaloq burchaklar',
    swatch: { accent: '#e11d48', bg: '#fffaf8', surface: '#ffffff', ink: '#0f172a' },
    dark: false,
  },
  {
    id: 'siyoh',
    name: 'Siyoh',
    description: 'Toʻq fon, indigo urgʻu — kechqurun uchun',
    swatch: { accent: '#6366f1', bg: '#0b1120', surface: '#131c31', ink: '#e2e8f0' },
    dark: true,
  },
  {
    id: 'lavanda',
    name: 'Lavanda',
    description: 'Yengil binafsha, keng radiuslar',
    swatch: { accent: '#7c3aed', bg: '#faf9ff', surface: '#ffffff', ink: '#0f172a' },
    dark: false,
  },
  {
    id: 'orzu',
    name: 'Orzu',
    description: 'Toʻq oʻrmon yashili, keskinroq shakllar',
    swatch: { accent: '#047857', bg: '#f7faf8', surface: '#ffffff', ink: '#0f172a' },
    dark: false,
  },
  {
    id: 'gilos',
    name: 'Gilos',
    description: 'Gilos qizili, dadil koʻrinish',
    swatch: { accent: '#dc2626', bg: '#fffafa', surface: '#ffffff', ink: '#0f172a' },
    dark: false,
  },
  {
    id: 'oltin',
    name: 'Oltin',
    description: 'Iliq kahrabo, chuqurroq soyalar',
    swatch: { accent: '#b45309', bg: '#fffcf5', surface: '#ffffff', ink: '#1c1917' },
    dark: false,
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Toʻq fon, yorqin yashil, oʻtkir burchaklar',
    swatch: { accent: '#22c55e', bg: '#07090d', surface: '#10141c', ink: '#e8f0e9' },
    dark: true,
  },
  {
    id: 'sokin',
    name: 'Sokin',
    description: 'Deyarli monoxrom, minimal va tinch',
    swatch: { accent: '#475569', bg: '#fbfbfc', surface: '#ffffff', ink: '#0f172a' },
    dark: false,
  },
]

const THEME_IDS = new Set(THEMES.map((theme) => theme.id))

const current = ref(readStored())

function readStored() {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored && THEME_IDS.has(stored) ? stored : DEFAULT_THEME
}

/* Applied to <html> rather than <body> so the page background — painted from
   the root element — changes with it and no light strip survives at the edges. */
function paint(id) {
  document.documentElement.dataset.theme = id
}

/** Called once before mount so the first paint is already themed. */
export function initTheme() {
  paint(current.value)
}

export function useTheme() {
  function setTheme(id, { animate = true } = {}) {
    if (!THEME_IDS.has(id) || id === current.value) return
    current.value = id
    localStorage.setItem(STORAGE_KEY, id)

    if (!animate) {
      paint(id)
      return
    }

    /* The crossfade class is transient: leaving it on would make every
       ordinary hover fade too. */
    document.body.classList.add('bw-theme-switching')
    paint(id)
    window.setTimeout(() => document.body.classList.remove('bw-theme-switching'), 320)
  }

  /** Anything but the current one, so the die never lands where it started. */
  function randomTheme() {
    const others = THEMES.filter((theme) => theme.id !== current.value)
    setTheme(others[Math.floor(Math.random() * others.length)].id)
  }

  return { theme: readonly(current), themes: THEMES, setTheme, randomTheme }
}
