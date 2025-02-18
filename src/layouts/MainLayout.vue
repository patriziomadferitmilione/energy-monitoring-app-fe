<template>
  <q-layout view="hHh lpR fFf">
    <!-- Top Bar -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleDrawer" />
        <q-toolbar-title>Energy App</q-toolbar-title>
        <q-btn flat label="Logout" color="negative" @click="logout" />
      </q-toolbar>
    </q-header>

    <!-- Sidebar (Navigation Drawer) -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item clickable v-ripple to="/">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>Home</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/bills">
          <q-item-section avatar>
            <q-icon name="receipt_long" />
          </q-item-section>
          <q-item-section>Bills</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/contracts">
          <q-item-section avatar>
            <q-icon name="description" />
          </q-item-section>
          <q-item-section>Contracts</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  data() {
    return {
      leftDrawerOpen: false,
    }
  },
  methods: {
    toggleDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('authenticated')
      window.location.reload()
    },
  },
}
</script>
