/* Every path is copied verbatim from design/01-design-system.html so the kit
   never drifts from the mockups. `fill` icons are solid; the rest are
   1.75-weight strokes unless the call site overrides `strokeWidth`. */

export const ICONS = {
  'arrow-right': {
    d: '<line x1="5" y1="12" x2="19" y2="12"></line><path d="m12 5 7 7-7 7"></path>',
  },
  'chevron-down': { d: '<path d="m6 9 6 6 6-6"></path>' },
  'chevron-right': { d: '<path d="m9 6 6 6-6 6"></path>' },
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
}
