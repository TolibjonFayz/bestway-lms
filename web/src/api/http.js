import axios from 'axios'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

/* Routes that must never trigger a refresh: a 401 from them *is* the answer.
   Refreshing on /auth/refresh would recurse; on /auth/login it would mask
   wrong credentials as a session problem. */
const NO_REFRESH = ['/auth/login', '/auth/refresh']

/* The auth store registers itself here rather than being imported, so the
   store can import this module without a cycle. */
let hooks = {
  getAccessToken: () => null,
  refresh: async () => null,
  onSessionExpired: () => {},
}

export function configureAuth(next) {
  hooks = { ...hooks, ...next }
}

/* One in-flight refresh for the whole app. Three requests failing at once all
   await this same promise instead of firing three refreshes — which would be
   worse than wasteful, since rotation invalidates each other's new token and
   the losers get logged out. */
let refreshPromise = null

function refreshOnce() {
  if (!refreshPromise) {
    refreshPromise = hooks.refresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

http.interceptors.request.use((config) => {
  const token = hooks.getAccessToken()
  if (token && !config.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error

    if (!response || !config) return Promise.reject(error)

    const isAuthRoute = NO_REFRESH.some((path) => config.url?.includes(path))
    if (response.status !== 401 || isAuthRoute || config.retriedAfterRefresh) {
      return Promise.reject(error)
    }

    try {
      const token = await refreshOnce()
      if (!token) throw error

      /* Marked so a second 401 on the retry falls through to the caller
         instead of looping. */
      config.retriedAfterRefresh = true
      config.headers.Authorization = `Bearer ${token}`
      return http(config)
    } catch {
      hooks.onSessionExpired()
      return Promise.reject(error)
    }
  },
)

/** True when the request never reached the server (offline, DNS, timeout). */
export function isNetworkError(error) {
  return Boolean(error?.isAxiosError && !error.response)
}

/** The API's `message` field, or a usable fallback. */
export function errorMessage(error, fallback) {
  return error?.response?.data?.message ?? fallback
}
