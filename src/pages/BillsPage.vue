<template>
  <q-page class="q-pa-md">
    <h4>Bills</h4>

    <q-list bordered separator v-if="bills.length">
      <q-item v-for="bill in bills" :key="bill._id">
        <q-item-section>
          <q-item-label>{{ bill.provider }}</q-item-label>
          <q-item-label caption>
            Amount: {{ bill.expenses.total_amount }} {{ bill.currency }}
          </q-item-label>
          <q-item-label caption>
            Period: {{ bill.billing_period_start }} - {{ bill.billing_period_end }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <q-spinner v-else-if="loading" color="primary" size="2em" />
    <q-banner v-else class="bg-warning text-dark"> No bills available. </q-banner>
  </q-page>
</template>

<script>
export default {
  name: 'BillsPage',
  data() {
    return {
      bills: [],
      loading: false,
    }
  },
  methods: {
    async fetchBills() {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:5000/api/bills', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          this.bills = await response.json()
        } else {
          console.error('Failed to fetch bills')
        }
      } catch (error) {
        console.error('Error fetching bills:', error)
      } finally {
        this.loading = false
      }
    },
  },
  created() {
    this.fetchBills()
  },
}
</script>
