import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/base.css'
import './assets/themes.css'
import { initTheme } from './composables/useTheme'

/* Before mount so the very first paint is already in the saved theme — doing
   it inside a component would flash the default first. */
initTheme()

createApp(App).use(createPinia()).use(router).mount('#app')
