<script setup>
import StudentDesktopHeader from './StudentDesktopHeader.vue'
import StudentSidebar from './StudentSidebar.vue'
import StudentTabBar from './StudentTabBar.vue'
import StudentTopBar from './StudentTopBar.vue'

/* Layout for every student page: a fixed sidebar on desktop, a top app bar
   plus bottom tab bar on phones. Pages render only their own content. */
defineProps({
  hasUnread: { type: Boolean, default: false },
})
</script>

<template>
  <div class="shell">
    <StudentSidebar class="shell__sidebar" />
    <StudentTopBar class="shell__topbar" :has-unread="hasUnread" />

    <main class="shell__main">
      <StudentDesktopHeader class="shell__desktop-header" :has-unread="hasUnread" />
      <slot />
    </main>

    <StudentTabBar class="shell__tabbar" />
  </div>
</template>

<style scoped>
.shell {
  min-height: 100dvh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
}

.shell__sidebar {
  display: none;
}

.shell__main {
  flex: 1;
  min-width: 0;
  padding: 16px 16px 20px;
}

.shell__desktop-header {
  display: none;
}

@media (min-width: 1024px) {
  .shell {
    flex-direction: row;
  }

  .shell__sidebar {
    display: flex;
    position: sticky;
    top: 0;
    height: 100dvh;
  }

  .shell__topbar,
  .shell__tabbar {
    display: none;
  }

  .shell__main {
    padding: 28px 32px 36px;
  }

  .shell__desktop-header {
    display: flex;
  }
}
</style>
