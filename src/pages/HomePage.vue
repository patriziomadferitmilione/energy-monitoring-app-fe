<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Dashboard</div>

    <!-- Bar Chart for monthly expenses -->
    <q-card class="q-pa-md q-mx-auto" style="max-width: 800px; min-height: 400px">
      <q-inner-loading :showing="initialLoading" color="primary">
        <q-spinner size="3em" />
      </q-inner-loading>

      <q-card-section v-if="!initialLoading" class="full-width">
        <div class="text-subtitle1">Spese totali mensili</div>

        <div v-if="chartData && chartData.labels.length" class="chart-container">
          <BarChart :data="chartData" :options="chartOptions" />
        </div>

        <div v-else class="text-center text-grey">Nessun dato presente</div>
      </q-card-section>
    </q-card>

    <!-- Pie Chart for Gas vs Energy -->
    <q-card class="q-pa-md q-mx-auto q-mt-md" style="max-width: 600px; min-height: 400px">
      <q-card-section class="full-width">
        <div class="text-subtitle1">Distribuzione Spese</div>

        <div v-if="pieChartData && pieChartData.labels.length" class="chart-container">
          <PieChart :data="pieChartData" :options="pieChartOptions" />
        </div>

        <div v-else class="text-center text-grey">Nessun dato presente</div>
      </q-card-section>
    </q-card>

    <!-- Unpaid Bills List -->
    <q-card class="q-pa-md q-mx-auto q-mt-md" style="max-width: 800px">
      <q-card-section>
        <div class="text-subtitle1">Bollette Non Pagate</div>
      </q-card-section>

      <q-separator />

      <q-card-section v-if="unpaidBills.length">
        <q-list>
          <q-item v-for="bill in unpaidBills" :key="bill._id">
            <q-item-section>
              <q-item-label class="text-bold">
                {{ bill.provider }} - {{ bill.bill_number }}
              </q-item-label>
              <q-item-label caption>
                <span class="text-primary">Importo:</span> €{{ bill.expenses.total_amount }}
              </q-item-label>
              <q-item-label caption class="q-mt-xs">
                <q-badge :color="isDueSoon(bill.due_date) ? 'red' : 'orange'" class="q-mt-xs">
                  Scadenza: {{ formatDate(bill.due_date) }}
                </q-badge>
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item-section side>
            <q-btn-dropdown color="primary" label="Aggiorna Stato" flat dense>
              <q-list>
                <q-item clickable v-close-popup @click="updateStatus(bill._id, 'paid')">
                  <q-item-section>Segna come Pagata</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="updateStatus(bill._id, 'overdue')">
                  <q-item-section>Segna come Scaduta</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-item-section>
        </q-list>
      </q-card-section>

      <q-card-section v-else class="text-center text-grey">
        Nessuna bolletta in sospeso
      </q-card-section>
    </q-card>

    <!-- Overdue Bills Card -->
    <q-card class="q-pa-md q-mx-auto q-mt-md" style="max-width: 800px">
      <q-card-section>
        <div class="text-subtitle1 text-red">🔴 Bollette Scadute</div>
      </q-card-section>

      <q-separator />

      <q-card-section v-if="overdueBills.length">
        <q-list>
          <q-item v-for="bill in overdueBills" :key="bill._id">
            <q-item-section>
              <q-item-label class="text-bold">
                {{ bill.provider }} - {{ bill.bill_number }}
              </q-item-label>
              <q-item-label caption>
                <span class="text-primary">Importo:</span> €{{ bill.expenses.total_amount }}
              </q-item-label>
              <q-item-label caption>
                <span class="text-negative">Scaduta il:</span> {{ formatDate(bill.due_date) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn
                color="positive"
                label="Segna come Pagata"
                @click="updateStatus(bill._id, 'paid')"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section v-else class="text-center text-grey">
        Nessuna bolletta scaduta
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { useBillStore } from 'stores/billStore'
import { Chart, registerables } from 'chart.js'
import { Bar, Pie } from 'vue-chartjs'
import zoomPlugin from 'chartjs-plugin-zoom'

Chart.register(...registerables, zoomPlugin)

export default {
  components: {
    BarChart: Bar,
    PieChart: Pie,
  },

  data() {
    return {
      billStore: useBillStore(),
      billSummary: [],
      unpaidBills: [],
      overdueBills: [],
      initialLoading: true,

      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#333',
              font: {
                size: 14,
                family: 'Arial',
                weight: 'bold',
              },
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#fff',
            borderWidth: 1,
            padding: 10,
            bodyFont: {
              size: 14,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#444',
              font: {
                size: 13,
                family: 'Arial',
                weight: 'bold',
              },
            },
            grid: {
              display: false, // Hide vertical gridlines
            },
          },
          y: {
            ticks: {
              color: '#444',
              font: {
                size: 12,
              },
              callback: (value) => `${value}`, // Format as currency
            },
            grid: {
              color: 'rgba(200, 200, 200, 0.2)', // Light gridlines
            },
          },
        },
      },
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Total Expenses (€)',
            backgroundColor: (ctx) => {
              const canvas = ctx.chart.ctx
              const gradient = canvas.createLinearGradient(0, 0, 0, 400)
              gradient.addColorStop(0, '#3b82f6')
              gradient.addColorStop(1, '#1e3a8a')
              return gradient
            },
            borderColor: '#1e3a8a',
            borderWidth: 1,
            hoverBackgroundColor: '#2563eb',
            hoverBorderColor: '#1e3a8a',
            borderRadius: 8,
            barThickness: 40, // Controls the width of bars
            data: [],
          },
        ],
      },

      pieChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true },
          tooltip: { enabled: true },
        },
      },
      pieChartData: {
        labels: ['Energia', 'Gas'],
        datasets: [
          {
            backgroundColor: ['#ffcd56', '#ff6384'],
            borderColor: '#fff',
            borderWidth: 1,
            data: [],
          },
        ],
      },
    }
  },

  async created() {
    await this.billStore.fetchBillSummary()
    this.billSummary = this.billStore.billSummary

    if (this.billSummary.length > 0) {
      this.chartData = this.getChartData()
      this.pieChartData = this.getPieChartData()
    }

    await this.billStore.fetchUnpaidBills()
    this.unpaidBills = this.billStore.unpaidBills

    await this.billStore.fetchOverdueBills()
    this.overdueBills = this.billStore.overdueBills

    this.initialLoading = false
  },

  methods: {
    async fetchUnpaidBills() {
      try {
        const response = await fetch('/api/unpaid-bills')
        this.unpaidBills = await response.json()
      } catch (error) {
        console.error('🚨 Error fetching unpaid bills:', error)
      } finally {
        this.loadingUnpaid = false
      }
    },

    async updateStatus(billId, newStatus) {
      await this.billStore.updateBillStatus(billId, newStatus)
    },

    getChartData() {
      const monthNames = [
        'Gennaio',
        'Febbraio',
        'Marzo',
        'Aprile',
        'Maggio',
        'Giugno',
        'Luglio',
        'Agosto',
        'Settembre',
        'Ottobre',
        'Novembre',
        'Dicembre',
      ]

      const labels = this.billSummary.map(
        (item) => `${monthNames[item._id.month - 1]} ${item._id.year}`,
      )
      const data = this.billSummary.map((item) => item.total_expense)

      return {
        labels: labels.length > 0 ? labels : ['No Data'],
        datasets: [
          {
            label: '',
            backgroundColor: (ctx) => {
              const canvas = ctx.chart.ctx
              const gradient = canvas.createLinearGradient(0, 0, 0, 400)
              gradient.addColorStop(0, '#3b82f6')
              gradient.addColorStop(1, '#1e3a8a')
              return gradient
            },
            borderColor: '#1e3a8a',
            borderWidth: 1,
            hoverBackgroundColor: '#2563eb',
            hoverBorderColor: '#1e3a8a',
            borderRadius: 8,
            barThickness: 40,
            data: data.length > 0 ? data : [0],
          },
        ],
      }
    },

    getPieChartData() {
      const totalEnergy = this.billSummary.reduce((acc, item) => acc + item.energy_expense, 0)
      const totalGas = this.billSummary.reduce((acc, item) => acc + item.gas_expense, 0)

      return {
        labels: ['Energia', 'Gas'],
        datasets: [
          {
            backgroundColor: ['#ffcd56', '#ff6384'],
            borderColor: '#fff',
            borderWidth: 1,
            data: [totalEnergy, totalGas],
          },
        ],
      }
    },

    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('it-IT', options)
    },

    isDueSoon(dueDate) {
      const today = new Date()
      const due = new Date(dueDate)
      const diff = (due - today) / (1000 * 60 * 60 * 24) // Convert ms to days
      return diff < 5 // Highlight bills due within 5 days
    },
  },
}
</script>

<style scoped>
.q-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 300px;
  min-height: 300px;
  max-height: 400px;
}
</style>
