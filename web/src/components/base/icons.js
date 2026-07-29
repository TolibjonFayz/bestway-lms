/* Every path is copied verbatim from design/01-design-system.html so the kit
   never drifts from the mockups. `fill` icons are solid; the rest are
   1.75-weight strokes unless the call site overrides `strokeWidth`. */

export const ICONS = {
  'arrow-right': {
    d: '<line x1="5" y1="12" x2="19" y2="12"></line><path d="m12 5 7 7-7 7"></path>',
  },
  'chevron-down': { d: '<path d="m6 9 6 6 6-6"></path>' },
  'chevron-right': { d: '<path d="m9 6 6 6-6 6"></path>' },
  'chevron-left': { d: '<path d="m15 18-6-6 6-6"></path>' },
  'id-card': {
    d: '<rect x="2" y="5" width="20" height="14" rx="2.5"></rect><circle cx="8" cy="11" r="2"></circle><path d="M5.5 16c.4-1.2 1.3-1.9 2.5-1.9s2.1.7 2.5 1.9"></path><line x1="14" y1="10" x2="18" y2="10"></line><line x1="14" y1="14" x2="18" y2="14"></line>',
  },
  check: { d: '<path d="M20 6 9 17l-5-5"></path>' },
  x: { d: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>' },
  eye: {
    d: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle>',
  },
  'eye-off': {
    d: '<path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>',
  },
  search: {
    d: '<circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
  },
  'alert-circle': {
    d: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
  },
  'alert-triangle': {
    d: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
  },
  'check-circle': {
    d: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="m9 11 3 3L22 4"></path>',
  },
  'x-circle': {
    d: '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>',
  },
  info: {
    d: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',
  },
  bell: {
    d: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>',
  },
  coins: {
    d: '<circle cx="8" cy="8" r="6"></circle><path d="M18.09 10.37A6 6 0 1 1 10.34 18"></path><path d="M7 6h1v4"></path><path d="m16.71 13.88.7.71-2.82 2.82"></path>',
  },
  flame: {
    d: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z"></path>',
  },
  'book-open': {
    d: '<path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3Z"></path>',
  },
  pencil: {
    d: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>',
  },
  /* ── Student shell nav + dashboard (design/03-student-home.html) ────── */
  home: {
    d: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M9 22V12h6v10"></path>',
  },
  books: {
    d: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>',
  },
  target: {
    d: '<circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="5"></circle><circle cx="12" cy="12" r="1.5"></circle>',
  },
  'bar-chart': {
    d: '<line x1="4" y1="20" x2="4" y2="12"></line><line x1="10" y1="20" x2="10" y2="4"></line><line x1="16" y1="20" x2="16" y2="9"></line><line x1="21" y1="20" x2="3" y2="20"></line>',
  },
  'bar-chart-3': {
    d: '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>',
  },
  trophy: {
    d: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>',
  },
  'calendar-plus': {
    d: '<rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="12" y1="14" x2="12" y2="18"></line><line x1="10" y1="16" x2="14" y2="16"></line>',
  },
  calendar: {
    d: '<rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
  },
  'user-circle': {
    d: '<circle cx="12" cy="8" r="4"></circle><path d="M6 21v-1a6 6 0 0 1 12 0v1"></path>',
  },
  'user-outline': {
    d: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
  },
  'message-square': {
    d: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
  },
  video: {
    d: '<path d="m22 8-6 4 6 4V8Z"></path><rect x="2" y="6" width="14" height="12" rx="2"></rect>',
  },
  /* The roadmap's padlock sits lower and narrower than the dashboard's. */
  'lock-unit': {
    d: '<rect x="4" y="10" width="16" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path>',
  },
  bookmark: {
    d: '<path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>',
  },
  mic: {
    d: '<rect x="9" y="2" width="6" height="12" rx="3"></rect><path d="M5 10a7 7 0 0 0 14 0"></path><line x1="12" y1="17" x2="12" y2="21"></line>',
  },
  /* ── Video player + vocabulary (design/05-video-vocab-test.html) ─────── */
  pause: {
    d: '<rect x="6" y="4" width="5" height="16" rx="1.5"></rect><rect x="13" y="4" width="5" height="16" rx="1.5"></rect>',
    fill: true,
    stroke: false,
  },
  fullscreen: {
    d: '<path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M21 8V5a2 2 0 0 0-2-2h-3"></path><path d="M3 16v3a2 2 0 0 0 2 2h3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>',
  },
  speaker: {
    d: '<path d="M11 5 6 9H2v6h4l5 4V5Z"></path><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M18.5 5.5a9 9 0 0 1 0 13"></path>',
  },
  notebook: {
    d: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>',
  },
  lock: {
    d: '<rect x="3" y="11" width="18" height="10" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
  },
  clock: {
    d: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
  },
  'arrow-up-right': {
    d: '<path d="M7 7h10v10"></path><path d="M7 17 17 7"></path>',
  },
  'star-outline': {
    d: '<path d="M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8L12 14.6 7 18.2l1.9-5.8L4 8.8h6.1z"></path>',
  },
  'file-check': {
    d: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M9 15l2 2 4-4"></path>',
  },
  sparkles: {
    d: '<path d="M5.8 11.3 2 22l10.7-3.79"></path><path d="M4 3h.01"></path><path d="M22 8h.01"></path><path d="M15 2h.01"></path><path d="M22 20h.01"></path><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"></path><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11-.11.7-.72 1.22-1.43 1.22H17"></path>',
  },
  'align-left': {
    d: '<path d="M17 6.1H3"></path><path d="M21 12.1H3"></path><path d="M15.1 18H3"></path>',
  },
  circle: { d: '<circle cx="12" cy="12" r="9"></circle>' },
  'graduation-cap': {
    d: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path>',
  },
  star: {
    d: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
    fill: true,
    strokeWidth: 1,
    linecap: null,
  },
  play: { d: '<path d="m6 4 14 8-14 8V4Z"></path>', fill: true, stroke: false },
  user: {
    d: '<path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6Z"></path>',
    fill: true,
    stroke: false,
  },
  /* ── Marks / rating / profile (design/06-marks-rating-profile.html) ──── */
  globe: {
    d: '<circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"></path>',
  },
  'help-circle': {
    d: '<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>',
  },
  'log-out': {
    d: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><path d="M16 17l5-5-5-5"></path><path d="M21 12H9"></path>',
  },
  edit: {
    d: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"></path>',
  },
  'trending-up': {
    d: '<path d="M23 6 13.5 15.5l-5-5L1 18"></path><path d="M17 6h6v6"></path>',
  },
  'trending-down': {
    d: '<path d="M23 18 13.5 8.5l-5 5L1 6"></path><path d="M17 18h6v-6"></path>',
  },
}
