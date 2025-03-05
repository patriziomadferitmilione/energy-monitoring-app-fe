<template>
  <q-page class="dashboard-container q-pa-md">
    <div class="text-h3 text-center q-mb-lg dashboard-title">Dashboard Bollette</div>

    <!-- Bar Chart for Monthly Expenses -->
    <q-card class="dashboard-card expense-chart-card" elevation-3>
      <q-inner-loading :showing="initialLoading" color="primary">
        <q-spinner size="3em" />
      </q-inner-loading>

      <q-card-section v-if="!initialLoading" class="full-width">
        <div class="text-h5 text-center q-mb-md section-title">Spese totali mensili</div>

        <div v-if="chartData && chartData.labels.length" class="chart-container">
          <BarChart :data="chartData" :options="chartOptions" />
        </div>

        <div v-else class="text-center text-primary text-h4">Nessun dato presente</div>
      </q-card-section>
    </q-card>

    <!-- Pie Chart for Gas vs Energy -->
    <q-card class="dashboard-card distribution-chart-card q-mt-md" elevation-3>
      <q-card-section class="full-width">
        <div class="text-h5 text-center q-mb-md section-title">Distribuzione Spese</div>

        <div v-if="pieChartData && pieChartData.labels.length" class="chart-container">
          <PieChart :data="pieChartData" :options="pieChartOptions" />
        </div>

        <div v-else class="text-center text-primary text-h4">Nessun dato presente</div>
      </q-card-section>
    </q-card>

    <!-- Unpaid Bills List -->
    <q-card class="unpaid-bills-card q-mt-md" elevation-3>
      <q-card-section class="card-header">
        <q-icon name="monetization_on" color="primary" size="32px" class="q-mr-md" />
        <div class="text-h4 section-title">Bollette Non Pagate</div>
      </q-card-section>

      <q-card-section v-if="unpaidBills.length" class="bills-content">
        <div class="bills-grid">
          <div
            v-for="bill in unpaidBills"
            :key="bill._id"
            class="bill-card"
            :class="{ 'bill-card-urgent': isDueSoon(bill.due_date) }"
          >
            <div class="bill-header">
              <div class="bill-provider">{{ bill.provider }}</div>
              <div class="bill-number">{{ bill.bill_number }}</div>
            </div>

            <div class="bill-details">
              <div class="bill-amount">
                <span class="label">Importo:</span>
                <span class="value">€{{ bill.expenses.total_amount.toFixed(2) }}</span>
              </div>
              <div class="bill-due">
                <span class="label">Scadenza:</span>
                <span class="value" :class="{ 'text-negative': isDueSoon(bill.due_date) }">
                  {{ formatDate(bill.due_date) }}
                </span>
              </div>
            </div>

            <div class="bill-actions">
              <q-btn-dropdown
                color="primary"
                label="Aggiorna Stato"
                outline
                dense
                class="full-width"
              >
                <q-list>
                  <q-item clickable v-close-popup @click="updateStatus(bill._id, 'paid')">
                    <q-item-section>Segna come Pagata</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="updateStatus(bill._id, 'overdue')">
                    <q-item-section>Segna come Scaduta</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section v-else class="text-h4 text-center text-primary">
        Nessuna bolletta in sospeso
      </q-card-section>
    </q-card>

    <!-- Overdue Bills Card -->
    <q-card class="overdue-bills-card q-mt-md" elevation-3>
      <q-card-section class="card-header">
        <q-icon name="warning" color="negative" size="32px" class="q-mr-md" />
        <div class="text-h4 text-negative section-title">Bollette Scadute</div>
      </q-card-section>

      <q-card-section v-if="overdueBills.length" class="bills-content">
        <div class="bills-grid">
          <div v-for="bill in overdueBills" :key="bill._id" class="bill-card bill-card-overdue">
            <div class="bill-header">
              <div class="bill-provider">{{ bill.provider }}</div>
              <div class="bill-number">{{ bill.bill_number }}</div>
            </div>

            <div class="bill-details">
              <div class="bill-amount">
                <span class="label">Importo:</span>
                <span class="value">€{{ bill.expenses.total_amount.toFixed(2) }}</span>
              </div>
              <div class="bill-due">
                <span class="label text-negative">Scaduta il:</span>
                <span class="value text-negative">{{ formatDate(bill.due_date) }}</span>
              </div>
            </div>

            <div class="bill-actions">
              <q-btn
                color="positive"
                label="Segna come Pagata"
                @click="updateStatus(bill._id, 'paid')"
                class="full-width"
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section v-else class="text-h4 text-center text-primary">
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
            borderColor: '#1A3275',
            borderWidth: 1,
            hoverBackgroundColor: '#1040A8',
            hoverBorderColor: '#1A3275',
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
        labels: [],
        datasets: [
          {
            backgroundColor: ['#033b4f', '#b4c6cb'],
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
            label: 'Importo mensile',
            backgroundColor: (ctx) => {
              const canvas = ctx.chart.ctx
              const gradient = canvas.createLinearGradient(0, 0, 0, 400)
              gradient.addColorStop(0, '#033b4f')
              gradient.addColorStop(1, '#b4c6cb')
              return gradient
            },
            borderColor: '#1A3275',
            borderWidth: 1,
            hoverBackgroundColor: '#1040A8',
            hoverBorderColor: '#1A3275',
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
            backgroundColor: (ctx) => {
              const chart = ctx.chart
              const { ctx: canvasCtx, chartArea } = chart

              if (!chartArea) {
                return ['#033b4f', '#b4c6cb'] // Fallback colors if the chart is not ready
              }

              // Create gradient
              const gradientEnergy = canvasCtx.createLinearGradient(
                0,
                0,
                chartArea.right,
                chartArea.bottom,
              )
              gradientEnergy.addColorStop(0, '#033b4f')
              gradientEnergy.addColorStop(1, '#05506d')

              const gradientGas = canvasCtx.createLinearGradient(
                0,
                0,
                chartArea.right,
                chartArea.bottom,
              )
              gradientGas.addColorStop(0, '#b4c6cb')
              gradientGas.addColorStop(1, '#d5e0e4')

              return [gradientEnergy, gradientGas]
            },
            borderColor: '#d5e0e4',
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

<style scoped lang="scss">
.dashboard-container {
  background-color: $light;
  min-height: 100vh;
}

.dashboard-title {
  color: $primary;
  font-weight: bold;
  letter-spacing: -1px;
  margin-bottom: 2rem;
}

.dashboard-card {
  background-color: $light1;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.unpaid-bills-card {
  @extend .dashboard-card;

  background-color: $grey;
}

.overdue-bills-card {
  @extend .dashboard-card;

  background-color: $grey;
}

.section-title {
  color: $primary;
  font-weight: 600;
  border-bottom: 3px solid $primary;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.chart-container {
  width: 100%;
  height: 350px;
  position: relative;
}

.bills-list {
  background-color: transparent;
  padding: 0;
}

.bill-item {
  background-color: $light2;
  border-radius: 8px;
  margin-bottom: 1rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &:hover {
    background-color: $light1;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }

  &.overdue {
    background-color: rgba($negative, 0.05);
    border-left: 4px solid $negative;
  }
}

.bill-provider {
  color: $primary;
  margin-bottom: 0.5rem;
}

.bill-due-badge {
  font-size: 0.9rem;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
}

// Chart modifications
:deep(.chartjs-render-monitor) {
  transition: all 0.3s ease;
}

.bills-content {
  padding: 0;
}

.bills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.bill-card {
  background-color: $light;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid $light2;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  &-urgent {
    border-left: 4px solid $warning;
    animation: pulse 1.5s infinite;
  }

  &-overdue {
    border-left: 4px solid $negative;
    background-color: rgba($negative, 0.05);
  }
}

.bill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid $light2;
  padding-bottom: 0.5rem;

  .bill-provider {
    font-weight: bold;
    color: $primary;
    font-size: 1.1rem;
  }

  .bill-number {
    color: $dark;
    font-size: 0.9rem;
  }
}

.bill-details {
  margin-bottom: 1rem;

  .label {
    color: $primary;
    font-weight: 600;
    margin-right: 0.5rem;
    opacity: 0.7;
  }

  .value {
    font-weight: bold;
    color: $dark;
  }

  .bill-amount,
  .bill-due {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
}

.bill-actions {
  margin-top: auto;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba($warning, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba($warning, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba($warning, 0);
  }
}

.card-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: $light1;

  .section-title {
    margin: 0;
    flex-grow: 1;
  }
}
</style>
