<template>
  <q-page class="q-pa-md">
    <h4>Contracts</h4>

    <q-list bordered separator v-if="contracts.length">
      <q-item v-for="contract in contracts" :key="contract._id">
        <q-item-section>
          <q-item-label>{{ contract.contract_name }}</q-item-label>
          <q-item-label caption>Client Code: {{ contract.client_code }}</q-item-label>
          <q-item-label caption>Supply Type: {{ contract.supply_type }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <q-spinner v-else-if="loading" color="primary" size="2em" />
    <q-banner v-else class="bg-warning text-dark"> No contracts available. </q-banner>
  </q-page>
</template>

<script>
export default {
  name: 'ContractsPage',
  data() {
    return {
      contracts: [],
      loading: false,
    }
  },
  methods: {
    async fetchContracts() {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:5000/api/contracts', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          this.contracts = await response.json()
        } else {
          console.error('Failed to fetch contracts')
        }
      } catch (error) {
        console.error('Error fetching contracts:', error)
      } finally {
        this.loading = false
      }
    },
  },
  created() {
    this.fetchContracts()
  },
}
</script>
