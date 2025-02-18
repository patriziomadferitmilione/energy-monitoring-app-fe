<template>
  <q-page class="q-pa-md">
    <q-btn-toggle v-model="selectedColor" toggle-color="primary" :options="colors" />

    <q-layout view="hHh lpR fFf">
      <q-page-container>
        <q-page>
          <q-card class="q-ma-md">
            <q-card-section class="bg-grey-3 text-dark">
              <q-btn color="primary" label="Primary Button" />
              <q-btn color="secondary" label="Secondary" />
              <q-btn color="negative" label="Danger" />
              <q-icon name="home" size="24px" />
              <q-icon name="settings" size="24px" color="primary" />
              <q-icon name="favorite" size="24px" color="red" />
            </q-card-section>
          </q-card>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
const selectedColor = ref('primary')
const colors = [
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' },
  { label: 'Accent', value: 'accent' },
]
</script>
