<template>
  <q-layout view="hHh lpR fFf">
    <!-- Top Bar -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleDrawer" />
        <q-toolbar-title>Controllo Energia</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Sidebar (Navigation Drawer) -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list class="full-height flex column">
        <!-- Tariff Card -->
        <q-item class="text-center">
          <q-item-section>Orario corrente</q-item-section>
        </q-item>
        <q-item>
          <q-card class="q-pa-none full-width min-h-12" :class="tariffClass">
            <q-card-section class="text-center q-pa-none">
              <div class="text-h6">{{ currentTariff }}</div>
              <div class="text-caption">{{ currentTariffDescription }}</div>
            </q-card-section>
          </q-card>
        </q-item>

        <q-separator />

        <q-item clickable v-ripple to="/" exact>
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

        <q-space />

        <q-item clickable v-ripple @click="logout" class="text-negative">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>Logout</q-item-section>
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
import { useAuthStore } from 'src/stores/authStore'

export default {
  data() {
    return {
      authStore: useAuthStore(),

      leftDrawerOpen: false,
    }
  },

  computed: {
    tariffClass() {
      return {
        'bg-red-5 text-white': this.currentTariff === 'F1',
        'bg-orange-5 text-white': this.currentTariff === 'F2',
        'bg-green-5 text-white': this.currentTariff === 'F3',
      }
    },
  },

  created() {
    this.updateTariff()
    setInterval(this.updateTariff, 60000) // Update every minute
  },

  methods: {
    toggleDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen
    },

    logout() {
      this.$router.push('/login')
    },

    updateTariff() {
      const now = new Date()
      const hour = now.getHours()
      const day = now.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

      let tariff = 'F3'
      let description = 'Fascia oraria più conveniente'

      if (day >= 1 && day <= 5) {
        // Monday - Friday
        if (hour >= 8 && hour < 19) {
          tariff = 'F1'
          description = 'Fascia oraria più cara'
        } else if ((hour >= 7 && hour < 8) || (hour >= 19 && hour < 23)) {
          tariff = 'F2'
          description = 'Fascia oraria intermedia'
        }
      } else if (day === 6) {
        // Saturday
        if (hour >= 7 && hour < 23) {
          tariff = 'F2'
          description = 'Fascia oraria intermedia'
        }
      }

      // Sundays and holidays are always F3
      this.currentTariff = tariff
      this.currentTariffDescription = description
    },
  },
}
</script>
