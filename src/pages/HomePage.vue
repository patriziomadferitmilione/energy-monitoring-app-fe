<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Dashboard</div>

    <q-card class="q-pa-md">
      <q-inner-loading :showing="initialLoading" color="primary">
        <q-spinner size="3em" />
      </q-inner-loading>

      <q-card-section v-if="!initialLoading">
        <div class="text-subtitle1">Total Expenses by Month (€)</div>

        <div v-if="bills.length === 0" class="text-center text-grey">No data available</div>

        <BarChart v-else :chart-data="chartData" :chart-options="chartOptions" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { useBillStore } from 'stores/billStore'
import { Chart, registerables } from 'chart.js'
import { Bar } from 'vue-chartjs'

Chart.register(...registerables)

export default {
  components: {
    BarChart: Bar,
  },

  data() {
    return {
      billStore: useBillStore(),
      initialLoading: true, // Controls the initial loading state
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
          },
        },
      },
      chartData: { labels: [], datasets: [] }, // Ensures valid structure
    }
  },

  computed: {
    bills() {
      return this.billStore.bills
    },
  },

  async created() {
    setTimeout(() => {
      this.initialLoading = false
    }, 3000) // 3-second delay before showing content

    await this.billStore.fetchBills()

    if (this.bills.length > 0) {
      this.chartData = this.getChartData()
    }
  },

  methods: {
    getChartData() {
      const monthlyExpenses = {}

      this.bills.forEach((bill) => {
        if (bill.billing_period_start) {
          const date = new Date(bill.billing_period_start)
          const month = date.toLocaleString('default', { month: 'short' }) // e.g., "Jan"

          if (!monthlyExpenses[month]) {
            monthlyExpenses[month] = 0
          }

          monthlyExpenses[month] += bill.expenses?.total_amount || 0
        }
      })

      return {
        labels:
          Object.keys(monthlyExpenses).length > 0 ? Object.keys(monthlyExpenses) : ['No Data'],
        datasets: [
          {
            label: 'Total Expenses (€)',
            backgroundColor: '#3b82f6',
            data: Object.values(monthlyExpenses).length > 0 ? Object.values(monthlyExpenses) : [0],
          },
        ],
      }
    },
  },
}
</script>
