import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authApi from '@/api/auth'
import { configureAuth } from '@/api/http'

const STORAGE_KEY = 'bw.auth'

/** Where each role lands after login. */
const HOME_BY_ROLE = {
  student: '/dashboard',
  teacher: '/staff',
  admin: '/admin',
}

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    /* Corrupt or unavailable storage must not stop the app booting. */
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const stored = readStored()

  const user = ref(stored?.user ?? null)
  const accessToken = ref(stored?.accessToken ?? null)
  const refreshToken = ref(stored?.refreshToken ?? null)
  /* Which role the user picked on /login/role — drives the login screen's
     heading before we know who they are. */
  const intendedRole = ref(stored?.intendedRole ?? 'student')

  const isAuthenticated = computed(() => Boolean(accessToken.value && user.value))
  const homeRoute = computed(() => HOME_BY_ROLE[user.value?.role] ?? '/dashboard')

  function persist() {
    const payload = {
      user: user.value,
      accessToken: accessToken.value,
      refreshToken: refreshToken.value,
      intendedRole: intendedRole.value,
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      /* Private-browsing quota errors are not worth breaking a login over. */
    }
  }

  function setSession(session) {
    user.value = session.user
    accessToken.value = session.accessToken
    refreshToken.value = session.refreshToken
    persist()
  }

  function clear() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* Nothing useful to do if storage is unavailable. */
    }
  }

  function setIntendedRole(role) {
    intendedRole.value = role
    persist()
  }

  async function login(phone, password) {
    setSession(await authApi.login(phone, password))
    return user.value
  }

  /** Returns the new access token, or null when the session is unrecoverable. */
  async function refresh() {
    if (!refreshToken.value) return null
    try {
      const session = await authApi.refresh(refreshToken.value)
      setSession(session)
      return session.accessToken
    } catch {
      clear()
      return null
    }
  }

  async function fetchMe() {
    user.value = await authApi.me()
    persist()
    return user.value
  }

  async function logout() {
    const token = refreshToken.value
    try {
      if (token) await authApi.logout(token)
    } catch {
      /* The local session goes regardless of whether the server agreed. */
    } finally {
      clear()
    }
  }

  /* Wire the axios interceptors to this store exactly once. */
  configureAuth({
    getAccessToken: () => accessToken.value,
    refresh,
    onSessionExpired: clear,
  })

  return {
    user,
    accessToken,
    refreshToken,
    intendedRole,
    isAuthenticated,
    homeRoute,
    login,
    logout,
    refresh,
    fetchMe,
    setIntendedRole,
    clear,
  }
})
