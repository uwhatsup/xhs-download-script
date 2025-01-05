import { createApp } from 'vue'
import App from './App.vue'
import '@/style/index.scss'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
pinia.use(createPersistedState({ storage: localStorage }))
app.mount(
  (() => {
    const app = document.createElement('div')
    document.body.append(app)
    return app
  })()
)
