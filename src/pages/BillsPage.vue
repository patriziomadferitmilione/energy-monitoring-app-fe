<template>
  <q-page class="q-pa-md">
    <h4 class="text-center">Bollette</h4>

    <div class="row q-col-gutter-md items-center justify-between">
      <!-- New Bill Button -->
      <div class="col-12 col-sm-auto">
        <q-btn
          color="primary"
          label="Nuova Bolletta"
          icon="add"
          @click="billStore.openDialog()"
          class="full-width"
        />
      </div>

      <!-- Upload File Input -->
      <div class="col-12 col-sm-auto">
        <q-file
          v-model="billStore.pdfFile"
          label="Carica Bolletta (PDF)"
          accept=".pdf"
          class="full-width"
          filled
          dense
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="upload" />
          </template>
        </q-file>
      </div>

      <!-- Extract Data Button -->
      <div class="col-12 col-sm-auto">
        <q-btn
          label="Estrai Dati"
          color="primary"
          icon="find_in_page"
          @click="billStore.openProviderDialog()"
          class="full-width"
        />
      </div>
    </div>

    <!-- Filters Dropdown -->
    <q-expansion-item expand-separator icon="filter_list" label="Filtri" class="q-mt-md">
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- First Column -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="filters.provider"
                label="Fornitore"
                :options="distinctProviders"
                use-input
                clearable
                dense
                outlined
                class="q-mb-md"
              />

              <q-input
                v-model="filters.dateStart"
                label="Data da"
                type="date"
                dense
                outlined
                class="q-mb-md"
              />

              <q-input
                v-model="filters.dateEnd"
                label="Data a"
                type="date"
                dense
                outlined
                class="q-mb-md"
              />
            </div>

            <!-- Second Column -->
            <div class="col-12 col-md-6">
              <div class="text-subtitle1 text-center q-mb-sm">Importo</div>
              <q-range
                v-model="filters.amount"
                :min="0"
                :max="500"
                label
                label-always
                dense
                class="q-mb-md"
              />

              <div class="text-subtitle1 text-center q-mb-sm">Mostra bollette</div>
              <q-btn-toggle
                v-model="filters.showPaid"
                toggle-color="primary"
                class="full-width q-mb-md"
                :options="[
                  { label: 'Tutte', value: null },
                  { label: 'Pagate', value: true },
                  { label: 'Non Pagate', value: false },
                ]"
              />
            </div>
          </div>

          <!-- Filter Actions -->
          <div class="row justify-end q-mt-md">
            <q-btn flat label="Reset" color="negative" @click="resetFilters" />
            <q-btn label="Applica Filtri" color="primary" class="q-ml-sm" @click="applyFilters" />
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Tabs for Energy & Gas Bills -->
    <q-tabs v-model="activeTab" dense class="bg-primary text-white q-mt-md">
      <q-tab name="energy" label="Luce" />
      <q-tab name="gas" label="Gas" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated>
      <!-- ENERGY -->
      <q-tab-panel name="energy" class="q-pa-none q-mt-md panel">
        <h5>Bollette Luce</h5>
        <div v-if="filteredBills.length" class="row q-col-gutter-md">
          <div
            v-for="bill in filteredBills"
            :key="bill._id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <q-card class="bill-card">
              <q-card-section :class="['bill-header', getStatusClass(bill.status)]">
                <div class="row items-center no-wrap">
                  <div class="col">
                    <div class="text-h6">{{ bill.provider }}</div>
                    <div class="text-subtitle2">
                      {{ formatDateRange(bill.billing_period_start, bill.billing_period_end) }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-icon :name="getBillIcon(bill.status)" size="28px" class="q-mr-sm" />
                  </div>
                </div>
              </q-card-section>

              <q-card-section>
                <div class="row items-center q-mb-sm">
                  <div class="col text-subtitle1">Importo</div>
                  <div class="col-auto text-h6 text-weight-bold">
                    {{ bill.expenses.total_amount }} {{ bill.currency || '€' }}
                  </div>
                </div>

                <q-separator class="q-my-md" />

                <div class="row q-col-gutter-sm q-mb-md">
                  <div class="col-6">
                    <div class="text-caption text-grey">Consumo</div>
                    <div class="text-body2">
                      {{ bill.consumption?.total_value || '0' }}
                      {{ bill.consumption?.unit || 'kWh' }}
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey">Scadenza</div>
                    <div class="text-body2">{{ formatDate(bill.due_date) }}</div>
                  </div>
                </div>

                <div class="text-caption text-grey q-mb-xs">Stato</div>
                <q-select
                  v-model="bill.status"
                  :options="[
                    { label: 'Pagata', value: 'paid' },
                    { label: 'In attesa', value: 'pending' },
                    { label: 'Scaduta', value: 'overdue' },
                  ]"
                  dense
                  outlined
                  emit-value
                  map-options
                  @update:model-value="updateStatus(bill._id, bill.status)"
                  :color="getStatusColor(bill.status)"
                />
              </q-card-section>

              <q-card-actions align="right">
                <q-btn
                  flat
                  color="info"
                  label="Dettagli"
                  icon="visibility"
                  @click="showDetails(bill)"
                />
                <q-btn flat color="negative" icon="delete" @click="confirmDelete(bill._id)" />
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <q-spinner v-else-if="billStore.loading" color="primary" size="2em" class="q-mt-lg" />
        <q-banner v-else class="bg-warning text-dark q-mt-md"> Nessuna bolletta trovata. </q-banner>
      </q-tab-panel>
      <!-- GAS -->
      <q-tab-panel name="gas" class="q-pa-none q-mt-md panel">
        <h5>Bollette Gas</h5>
        <div v-if="filteredBills.length" class="row q-col-gutter-md">
          <div
            v-for="bill in filteredBills"
            :key="bill._id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <q-card class="bill-card">
              <q-card-section :class="['bill-header', getStatusClass(bill.status)]">
                <div class="row items-center no-wrap">
                  <div class="col">
                    <div class="text-h6">{{ bill.provider }}</div>
                    <div class="text-subtitle2">
                      {{ formatDateRange(bill.billing_period_start, bill.billing_period_end) }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-icon :name="getBillIcon(bill.status)" size="28px" class="q-mr-sm" />
                  </div>
                </div>
              </q-card-section>

              <q-card-section>
                <div class="row items-center q-mb-sm">
                  <div class="col text-subtitle1">Importo</div>
                  <div class="col-auto text-h6 text-weight-bold">
                    {{ bill.expenses.total_amount }} {{ bill.currency || '€' }}
                  </div>
                </div>

                <q-separator class="q-my-md" />

                <div class="row q-col-gutter-sm q-mb-md">
                  <div class="col-6">
                    <div class="text-caption text-grey">Consumo</div>
                    <div class="text-body2">
                      {{ bill.consumption?.total_value || '0' }}
                      {{ bill.consumption?.unit || 'm³' }}
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey">Scadenza</div>
                    <div class="text-body2">{{ formatDate(bill.due_date) }}</div>
                  </div>
                </div>

                <div class="text-caption text-grey q-mb-xs">Stato</div>
                <q-select
                  v-model="bill.status"
                  :options="[
                    { label: 'Pagata', value: 'paid' },
                    { label: 'In attesa', value: 'pending' },
                    { label: 'Scaduta', value: 'overdue' },
                  ]"
                  dense
                  outlined
                  emit-value
                  map-options
                  @update:model-value="updateStatus(bill._id, bill.status)"
                  :color="getStatusColor(bill.status)"
                />
              </q-card-section>

              <q-card-actions align="right">
                <q-btn
                  flat
                  color="info"
                  label="Dettagli"
                  icon="visibility"
                  @click="showDetails(bill)"
                />
                <q-btn flat color="negative" icon="delete" @click="confirmDelete(bill._id)" />
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <q-spinner v-else-if="billStore.loading" color="primary" size="2em" class="q-mt-lg" />
        <q-banner v-else class="bg-warning text-dark q-mt-md"> Nessuna bolletta trovata. </q-banner>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Bill Details Dialog -->
    <q-dialog v-model="detailsDialog">
      <q-card style="min-width: 350px; max-width: 600px">
        <q-card-section
          class="row items-center"
          :class="selectedBill ? getStatusClass(selectedBill.status) : ''"
        >
          <div class="text-h6">Dettagli Bolletta</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedBill">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <div class="text-caption">Fornitore</div>
              <div class="text-body1 q-mb-md">{{ selectedBill.provider }}</div>

              <div class="text-caption">Numero Fattura</div>
              <div class="text-body1 q-mb-md">{{ selectedBill.bill_number }}</div>

              <div class="text-caption">Periodo</div>
              <div class="text-body1 q-mb-md">
                {{
                  formatDateRange(
                    selectedBill.billing_period_start,
                    selectedBill.billing_period_end,
                  )
                }}
              </div>

              <div class="text-caption">Data Emissione</div>
              <div class="text-body1 q-mb-md">{{ formatDate(selectedBill.issue_date) }}</div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="text-caption">Importo Totale</div>
              <div class="text-h6 text-weight-bold q-mb-md">
                {{ selectedBill.expenses.total_amount }} {{ selectedBill.currency || '€' }}
              </div>

              <div class="text-caption">Consumo</div>
              <div class="text-body1 q-mb-md">
                {{ selectedBill.consumption?.total_value || '0' }}
                {{ selectedBill.consumption?.unit }}
              </div>

              <div class="text-caption">Scadenza</div>
              <div class="text-body1 q-mb-md">{{ formatDate(selectedBill.due_date) }}</div>

              <div class="text-caption">Stato</div>
              <q-chip :color="getStatusColor(selectedBill.status)" text-color="white">
                {{ getStatusLabel(selectedBill.status) }}
              </q-chip>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 q-mb-sm">Dettaglio Costi</div>
          <div class="row q-col-gutter-sm">
            <div
              class="col-6 col-md-4"
              v-if="selectedBill.bill_type === 'energy' && selectedBill.expenses.energy"
            >
              <div class="text-caption">Energia</div>
              <div class="text-body2">{{ selectedBill.expenses.energy }} €</div>
            </div>
            <div
              class="col-6 col-md-4"
              v-if="selectedBill.bill_type === 'gas' && selectedBill.expenses.gas"
            >
              <div class="text-caption">Gas</div>
              <div class="text-body2">{{ selectedBill.expenses.gas }} €</div>
            </div>
            <div class="col-6 col-md-4" v-if="selectedBill.expenses.transport">
              <div class="text-caption">Trasporto</div>
              <div class="text-body2">{{ selectedBill.expenses.transport }} €</div>
            </div>
            <div class="col-6 col-md-4" v-if="selectedBill.expenses.system_duties">
              <div class="text-caption">Oneri di Sistema</div>
              <div class="text-body2">{{ selectedBill.expenses.system_duties }} €</div>
            </div>
            <div class="col-6 col-md-4" v-if="selectedBill.expenses.taxes">
              <div class="text-caption">Imposte</div>
              <div class="text-body2">{{ selectedBill.expenses.taxes }} €</div>
            </div>
            <div class="col-6 col-md-4" v-if="selectedBill.expenses.vat">
              <div class="text-caption">IVA</div>
              <div class="text-body2">{{ selectedBill.expenses.vat }} €</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialog">
      <q-card>
        <q-card-section class="row items-center bg-negative text-white">
          <q-avatar icon="warning" text-color="white" />
          <span class="q-ml-sm">Conferma Eliminazione</span>
        </q-card-section>

        <q-card-section>
          Sei sicuro di voler eliminare questa bolletta? Questa azione non può essere annullata.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" color="primary" v-close-popup />
          <q-btn flat label="Elimina" color="negative" @click="deleteBill" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add Bill Dialog -->
    <q-dialog v-model="billStore.showDialog">
      <q-card style="min-width: 80vw; max-width: 1000px">
        <q-card-section>
          <div class="text-h6">Aggiungi Nuova Bolletta</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- First Column -->
            <div class="col-12 col-md-4">
              <q-select
                v-model="billStore.newBill.contract_name"
                label="Contratto"
                :options="contractOptions"
                clearable
                class="q-mb-md"
              />

              <q-select
                v-model="billStore.newBill.bill_type"
                label="Tipo di Bolletta"
                :options="['energy', 'gas']"
                class="q-mb-md"
              />

              <q-select
                v-model="billStore.newBill.provider"
                label="Fornitore"
                :options="providerOptions"
                clearable
                class="q-mb-md"
              />

              <q-input
                v-model="billStore.newBill.bill_number"
                label="Numero Fattura"
                class="q-mb-md"
              />

              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="billStore.newBill.billing_period_start"
                    label="Inizio Periodo"
                    type="date"
                    class="q-mb-md"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="billStore.newBill.billing_period_end"
                    label="Fine Periodo"
                    type="date"
                    class="q-mb-md"
                  />
                </div>
              </div>

              <q-select
                v-model="billStore.newBill.status"
                label="Stato"
                :options="['paid', 'pending', 'overdue']"
                class="q-mb-md"
              />

              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="billStore.newBill.due_date"
                    label="Data di Scadenza"
                    type="date"
                    class="q-mb-md"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="billStore.newBill.issue_date"
                    label="Data di Emissione"
                    type="date"
                    class="q-mb-md"
                  />
                </div>
              </div>
            </div>

            <!-- Second Column - Expenses -->
            <div class="col-12 col-md-4">
              <div class="text-subtitle1 q-mb-sm">Costi</div>
              <q-input
                v-model.number="billStore.newBill.expenses.total_amount"
                label="Importo Totale (€)"
                type="number"
                class="q-mb-md"
              />
              <q-input
                v-if="billStore.newBill.bill_type === 'energy'"
                v-model.number="billStore.newBill.expenses.energy"
                label="Energia (€)"
                type="number"
                class="q-mb-md"
              />
              <q-input
                v-if="billStore.newBill.bill_type === 'gas'"
                v-model.number="billStore.newBill.expenses.gas"
                label="Gas (€)"
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
            </div>

            <!-- Third Column - Consumption -->
            <div class="col-12 col-md-4">
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

              <!-- Breakdown of ENERGY Consumption (F1, F2, F3) -->
              <div v-if="billStore.newBill.bill_type === 'energy'">
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-if="billStore.newBill.consumption.f1_unit_price > 0"
                      v-model.number="billStore.newBill.consumption.f1_unit_price"
                      label="Prezzo F1 (€)"
                      type="number"
                      class="q-mb-md"
                    />
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-if="billStore.newBill.consumption.f1_quantity > 0"
                      v-model.number="billStore.newBill.consumption.f1_quantity"
                      label="Quantità F1"
                      type="number"
                      class="q-mb-md"
                    />
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-if="billStore.newBill.consumption.f1_value > 0"
                      v-model.number="billStore.newBill.consumption.f1_value"
                      label="Valore F1 (€)"
                      type="number"
                      class="q-mb-md"
                    />
                  </div>
                </div>

                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-if="billStore.newBill.consumption.f2_unit_price > 0"
                      v-model.number="billStore.newBill.consumption.f2_unit_price"
                      label="Prezzo F2 (€)"
                      type="number"
                      class="q-mb-md"
                    />
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-if="billStore.newBill.consumption.f2_quantity > 0"
                      v-model.number="billStore.newBill.consumption.f2_quantity"
                      label="Quantità F2"
                      type="number"
                      class="q-mb-md"
                    />
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-if="billStore.newBill.consumption.f2_value > 0"
                      v-model.number="billStore.newBill.consumption.f2_value"
                      label="Valore F2 (€)"
                      type="number"
                      class="q-mb-md"
                    />
                  </div>
                </div>

                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-if="billStore.newBill.consumption.f3_unit_price > 0"
                      v-model.number="billStore.newBill.consumption.f3_unit_price"
                      label="Prezzo F3 (€)"
                      type="number"
                      class="q-mb-md"
                    />
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-if="billStore.newBill.consumption.f3_quantity > 0"
                      v-model.number="billStore.newBill.consumption.f3_quantity"
                      label="Quantità F3"
                      type="number"
                      class="q-mb-md"
                    />
                  </div>
                  <div class="col-12 col-sm-4">
                    <q-input
                      v-if="billStore.newBill.consumption.f3_value > 0"
                      v-model.number="billStore.newBill.consumption.f3_value"
                      label="Valore F3 (€)"
                      type="number"
                      class="q-mb-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" color="negative" @click="billStore.closeDialog()" />
          <q-btn label="Salva" color="primary" @click="saveBill" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Upload Dialog -->
    <q-dialog v-model="billStore.providerDialog">
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">Seleziona il Fornitore e il Tipo di Bolletta</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="billStore.selectedProvider"
            label="Fornitore"
            :options="providerOptions"
            clearable
            class="q-mb-md"
          />

          <q-select
            v-model="billStore.selectedBillType"
            label="Tipo di Bolletta"
            :options="['energy', 'gas']"
            clearable
            class="q-mb-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" color="negative" @click="billStore.closeProviderDialog()" />
          <q-btn label="Conferma" color="primary" @click="billStore.confirmUpload()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { useBillStore } from 'src/stores/billStore'
import { useAdminStore } from 'src/stores/adminStore'
import { useContractStore } from '../stores/contractStore'
import { mapActions } from 'pinia'

export default {
  name: 'BillsPage',
  data() {
    return {
      billStore: useBillStore(),
      adminStore: useAdminStore(),
      contractStore: useContractStore(),

      activeTab: 'energy',
      filters: {
        provider: '',
        amount: { min: 0, max: 500 },
        dateStart: '',
        dateEnd: '',
        showPaid: false,
      },
      detailsDialog: false,
      deleteDialog: false,
      selectedBill: null,
      billToDelete: null,
    }
  },

  created() {
    this.fetchBills()
    this.fetchProviders()
    this.fetchContracts()
  },

  watch: {
    activeTab() {
      this.resetFilters()
    },
  },

  computed: {
    filteredBills() {
      const filtered = this.billStore
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

      return filtered
    },
    distinctProviders() {
      const providers = this.billStore.getBillsByType(this.activeTab).map((bill) => bill.provider)
      return [...new Set(providers)]
    },
    providerOptions() {
      return this.adminStore.providers.map((provider) => provider.name)
    },
    contractOptions() {
      return this.contractStore.contracts.map((contract) => contract.contract_name)
    },
  },

  methods: {
    ...mapActions(useBillStore, ['fetchBills', 'addBill']),
    ...mapActions(useAdminStore, ['fetchProviders']),
    ...mapActions(useContractStore, ['fetchContracts']),

    // Bills
    saveBill() {
      this.billStore.addBill()
    },
    async updateStatus(billId, newStatus) {
      await this.billStore.updateBillStatus(billId, newStatus)
    },
    showDetails(bill) {
      this.selectedBill = { ...bill }
      this.detailsDialog = true
    },
    confirmDelete(billId) {
      this.billToDelete = billId
      this.deleteDialog = true
    },
    async deleteBill() {
      if (this.billToDelete) {
        await this.billStore.deleteBill(this.billToDelete)
        this.billToDelete = null
      }
    },

    // Filters
    applyFilters() {
      this.filters = { ...this.filters }
    },
    resetFilters() {
      this.filters = {
        provider: '',
        amount: { min: 0, max: 500 },
        dateStart: '',
        dateEnd: '',
        showPaid: false,
      }
    },

    // Other
    formatDate(dateString) {
      if (!dateString) return 'N/A'

      const date = new Date(dateString)
      return date.toLocaleDateString('it-IT')
    },
    formatDateRange(start, end) {
      if (!start || !end) return 'N/A'

      return `${this.formatDate(start)} - ${this.formatDate(end)}`
    },
    getStatusClass(status) {
      switch (status) {
        case 'paid':
          return 'bg-positive text-white'
        case 'pending':
          return 'bg-warning text-dark'
        case 'overdue':
          return 'bg-negative text-white'
        default:
          return 'bg-grey-4'
      }
    },
    getStatusColor(status) {
      switch (status) {
        case 'paid':
          return 'positive'
        case 'pending':
          return 'warning'
        case 'overdue':
          return 'negative'
        default:
          return 'grey'
      }
    },
    getStatusLabel(status) {
      switch (status) {
        case 'paid':
          return 'Pagata'
        case 'pending':
          return 'In attesa'
        case 'overdue':
          return 'Scaduta'
        default:
          return status
      }
    },
    getBillIcon(status) {
      switch (status) {
        case 'paid':
          return 'check_circle'
        case 'pending':
          return 'schedule'
        case 'overdue':
          return 'warning'
        default:
          return 'receipt'
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.q-tab {
  width: 50%;
}

.col {
  text-align: center;
}

.bill-card {
  transition: all 0.3s ease;
  height: 100%;
  background-color: $grey;
  margin: 0.5rem;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  .bill-header {
    border-radius: 4px 4px 0 0;
  }
}

.panel {
  overflow-y: hidden;
}
</style>
