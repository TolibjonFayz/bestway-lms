<script setup>
/* The mockups draw these screens inside a 390×812 phone. On a phone the screen
   is full-bleed; from 560px up it becomes a centred card of the same width,
   which is the closest honest reading — the design file specifies mobile only. */
</script>

<template>
  <div class="auth-layout">
    <div class="auth-layout__screen">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100dvh;
  background: var(--bg);
  display: flex;
  justify-content: center;
}

.auth-layout__screen {
  width: 100%;
  max-width: 390px;
  background: var(--white);
  display: flex;
  flex-direction: column;
}

@media (min-width: 560px) {
  .auth-layout {
    align-items: center;
    padding: 40px 24px;
  }

  .auth-layout__screen {
    min-height: 812px;
    max-height: calc(100dvh - 80px);
    border-radius: 38px;
    box-shadow:
      0 24px 60px rgba(15, 23, 42, 0.14),
      0 0 0 1px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }
}
</style>
