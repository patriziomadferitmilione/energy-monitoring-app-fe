<template>
  <q-page class="q-pa-md">
    <h4 class="text-center">Bollette</h4>

    <q-btn color="primary" label="Nuova Bolletta" @click="billStore.openDialog()" class="q-mb-md" />

    <q-file
      v-model="billStore.pdfFile"
      label="Carica Bolletta (PDF)"
      accept=".pdf"
      class="q-mb-md"
    />

    <q-btn label="Estrai Dati" color="primary" @click="billStore.uploadPDF" />

    <!-- Filters Dropdown -->
    <q-expansion-item expand-separator label="Filtri" class="q-mt-md">
      <q-card>
        <q-card-section>
          <q-select
            v-model="filters.provider"
            label="Fornitore"
            :options="distinctProviders"
            use-input
            clearable
            class="q-mb-md"
          />

          <q-range
            v-model="filters.amount"
            :min="0"
            :max="500"
            label
            label-always
            :left-label="filters.amount.min"
            :right-label="filters.amount.max"
            class="q-mb-md"
          />

          <q-input v-model="filters.dateStart" label="Data da" type="date" class="q-mb-md" />
          <q-input v-model="filters.dateEnd" label="Data a" type="date" class="q-mb-md" />

          <q-toggle v-model="filters.showPaid" label="Mostra solo pagate" class="q-mb-md" />
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Tabs for Energy & Gas Bills -->
    <q-tabs v-model="activeTab" dense class="bg-primary text-white">
      <q-tab name="energy" label="Luce" />
      <q-tab name="gas" label="Gas" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated>
      <!-- Energy Bills -->
      <q-tab-panel name="energy">
        <h5>Bollette Luce</h5>
        <q-list bordered separator v-if="filteredBills.length">
          <q-item v-for="bill in filteredBills" :key="bill._id">
            <q-item-section>
              <q-item-label>{{ bill.provider }}</q-item-label>
              <q-item-label caption>
                Importo: {{ bill.expenses.total_amount }} {{ bill.currency }}
              </q-item-label>
              <q-item-label caption>
                Periodo: {{ bill.billing_period_start }} - {{ bill.billing_period_end }}
              </q-item-label>
              <q-item-label caption> Stato: {{ bill.status }} </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                v-model="bill.status"
                :options="['paid', 'pending', 'overdue']"
                dense
                emit-value
                map-options
                @update:model-value="updateStatus(bill._id, bill.status)"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <q-spinner v-else-if="billStore.loading" color="primary" size="2em" />
        <q-banner v-else class="bg-warning text-dark"> Nessuna bolletta trovata. </q-banner>
      </q-tab-panel>

      <!-- Gas Bills -->
      <q-tab-panel name="gas">
        <h5>Bollette Gas</h5>
        <q-list bordered separator v-if="filteredBills.length">
          <q-item v-for="bill in filteredBills" :key="bill._id">
            <q-item-section>
              <q-item-label>{{ bill.provider }}</q-item-label>
              <q-item-label caption>
                Importo: {{ bill.expenses.total_amount }} {{ bill.currency }}
              </q-item-label>
              <q-item-label caption>
                Periodo: {{ bill.billing_period_start }} - {{ bill.billing_period_end }}
              </q-item-label>
              <q-item-label caption> Stato: {{ bill.status }} </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                v-model="bill.status"
                :options="['paid', 'pending', 'overdue']"
                dense
                emit-value
                map-options
                @update:model-value="updateStatus(bill._id, bill.status)"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <q-spinner v-else-if="billStore.loading" color="primary" size="2em" />
        <q-banner v-else class="bg-warning text-dark"> Nessuna bolletta trovata. </q-banner>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Add Bill Dialog -->
    <q-dialog v-model="billStore.showDialog">
      <q-card style="width: 450px">
        <q-card-section>
          <div class="text-h6">Aggiungi Nuova Bolletta</div>
        </q-card-section>

        <q-card-section>
          <!-- Customer Code & Contract ID (Read-only, auto-filled) -->
          <q-input
            v-model="billStore.newBill.customerCode"
            label="Codice Cliente"
            readonly
            class="q-mb-md"
          />
          <q-input
            v-model="billStore.newBill.contract_id"
            label="ID Contratto"
            readonly
            class="q-mb-md"
          />

          <!-- Bill Details -->
          <q-select
            v-model="billStore.newBill.bill_type"
            label="Tipo di Bolletta"
            :options="['energy', 'gas']"
            class="q-mb-md"
          />
          <q-input v-model="billStore.newBill.provider" label="Fornitore" class="q-mb-md" />
          <q-input v-model="billStore.newBill.bill_number" label="Numero Fattura" class="q-mb-md" />
          <q-input
            v-model="billStore.newBill.billing_period_start"
            label="Inizio Periodo"
            type="date"
            class="q-mb-md"
          />
          <q-input
            v-model="billStore.newBill.billing_period_end"
            label="Fine Periodo"
            type="date"
            class="q-mb-md"
          />
          <q-input
            v-model="billStore.newBill.meter_number"
            label="Numero Contatore"
            class="q-mb-md"
          />

          <!-- Address Fields -->
          <!-- <div class="text-subtitle1 q-mb-sm">Indirizzo</div>
          <q-input v-model="billStore.newBill.user.address.street" label="Via" class="q-mb-md" />
          <q-input
            v-model="billStore.newBill.user.address.civic_number"
            label="Numero Civico"
            class="q-mb-md"
          />
          <q-input v-model="billStore.newBill.user.address.cap" label="CAP" class="q-mb-md" />
          <q-input v-model="billStore.newBill.user.address.city" label="Città" class="q-mb-md" />
          <q-input
            v-model="billStore.newBill.user.address.province"
            label="Provincia"
            class="q-mb-md"
          /> -->

          <!-- Expenses -->
          <div class="text-subtitle1 q-mb-sm">Costi</div>
          <q-input
            v-model.number="billStore.newBill.expenses.total_amount"
            label="Importo Totale (€)"
            type="number"
            class="q-mb-md"
          />
          <q-input
            v-model.number="billStore.newBill.expenses.energy"
            label="Energia (€)"
            type="number"
            class="q-mb-md"
          />
          <q-input
            v-model.number="billStore.newBill.expenses.transport"
            label="Trasporto (€)"
            type="number"
            class="q-mb-md"
          />
          <q-input
            v-model.number="billStore.newBill.expenses.system_duties"
            label="Oneri di Sistema (€)"
            type="number"
            class="q-mb-md"
          />
          <q-input
            v-model.number="billStore.newBill.expenses.taxes"
            label="Imposte (€)"
            type="number"
            class="q-mb-md"
          />
          <q-input
            v-model.number="billStore.newBill.expenses.vat"
            label="IVA (€)"
            type="number"
            class="q-mb-md"
          />

          <!-- Consumption -->
          <div class="text-subtitle1 q-mb-sm">Consumo</div>
          <q-select
            v-model="billStore.newBill.consumption.unit"
            label="Unità di Consumo"
            :options="['kWh', 'm3']"
            class="q-mb-md"
          />
          <q-input
            v-model.number="billStore.newBill.consumption.total_value"
            label="Consumo Totale"
            type="number"
            class="q-mb-md"
          />

          <!-- Breakdown of Consumption (F1, F2, F3) -->
          <q-input
            v-model.number="billStore.newBill.consumption.f1_unit_price"
            label="Prezzo F1 (€)"
            type="number"
            class="q-mb-md"
          />
          <q-input
            v-model.number="billStore.newBill.consumption.f1_quantity"
            label="Quantità F1"
            type="number"
            class="q-mb-md"
          />
          <q-input
            v-model.number="billStore.newBill.consumption.f1_value"
            label="Valore F1 (€)"
            type="number"
            class="q-mb-md"
          />

          <q-input
            v-model.number="billStore.newBill.consumption.f2_unit_price"
            label="Prezzo F2 (€)"
            type="number"
            class="q-mb-md"
          />
          <q-input
            v-model.number="billStore.newBill.consumption.f2_quantity"
            label="Quantità F2"
            type="number"
            class="q-mb-md"
          />
          <q-input
            v-model.number="billStore.newBill.consumption.f2_value"
            label="Valore F2 (€)"
            type="number"
            class="q-mb-md"
          />

          <q-input
            v-model.number="billStore.newBill.consumption.f3_unit_price"
            label="Prezzo F3 (€)"
            type="number"
            class="q-mb-md"
          />
          <q-input
            v-model.number="billStore.newBill.consumption.f3_quantity"
            label="Quantità F3"
            type="number"
            class="q-mb-md"
          />
          <q-input
            v-model.number="billStore.newBill.consumption.f3_value"
            label="Valore F3 (€)"
            type="number"
            class="q-mb-md"
          />

          <!-- Status -->
          <q-select
            v-model="billStore.newBill.status"
            label="Stato"
            :options="['paid', 'pending', 'overdue']"
            class="q-mb-md"
          />

          <q-input
            v-model="billStore.newBill.due_date"
            label="Data di Scadenza"
            type="date"
            class="q-mb-md"
          />
          <q-input
            v-model="billStore.newBill.issue_date"
            label="Data di Emissione"
            type="date"
            class="q-mb-md"
          />
          <q-input v-model="billStore.newBill.currency" label="Valuta" class="q-mb-md" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" color="negative" @click="billStore.closeDialog()" />
          <q-btn label="Salva" color="primary" @click="saveBill" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { useBillStore } from 'src/stores/billStore'
import { mapActions } from 'pinia'

export default {
  name: 'BillsPage',
  data() {
    return {
      billStore: useBillStore(),

      activeTab: 'energy',
      filters: {
        provider: '',
        amount: { min: 0, max: 500 },
        dateStart: '',
        dateEnd: '',
        showPaid: false,
      },
    }
  },
  computed: {
    filteredBills() {
      return this.billStore
        .getBillsByType(this.activeTab)
        .filter((bill) =>
          this.filters.provider
            ? bill.provider?.toLowerCase().includes(this.filters.provider.toLowerCase())
            : true,
        )
        .filter(
          (bill) =>
            bill.expenses &&
            bill.expenses.total_amount >= this.filters.amount.min &&
            bill.expenses.total_amount <= this.filters.amount.max,
        )
        .filter((bill) =>
          this.filters.dateStart ? bill.billing_period_start >= this.filters.dateStart : true,
        )
        .filter((bill) =>
          this.filters.dateEnd ? bill.billing_period_end <= this.filters.dateEnd : true,
        )
        .filter((bill) => (this.filters.showPaid ? bill.paid === true : true))
    },
    distinctProviders() {
      const providers = this.billStore.getBillsByType(this.activeTab).map((bill) => bill.provider)
      return [...new Set(providers)] // Remove duplicates
    },
  },
  methods: {
    ...mapActions(useBillStore, ['fetchBills', 'addBill']),
    resetFilters() {
      this.filters = {
        provider: '',
        amount: { min: 0, max: 500 },
        dateStart: '',
        dateEnd: '',
        showPaid: false,
      }
    },
    saveBill() {
      this.billStore.addBill()
    },
    async updateStatus(billId, newStatus) {
      await this.billStore.updateBillStatus(billId, newStatus)
    },
  },
  created() {
    this.fetchBills()
  },
  watch: {
    activeTab() {
      this.resetFilters()
    },
  },
}
</script>
