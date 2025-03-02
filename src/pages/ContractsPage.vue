<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center">
      <h4 class="text-primary">Contratti</h4>
      <q-btn
        color="primary"
        label="Nuovo Contratto"
        icon="add"
        @click="contractStore.openDialog()"
      />
    </div>

    <q-separator class="q-my-md" />

    <!-- Contracts List -->
    <div v-if="contracts.length" class="row q-col-gutter-md">
      <div v-for="contract in contracts" :key="contract._id" class="col-12 col-sm-6 col-md-4">
        <q-card class="contract-card">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">{{ contract.contract_name }}</div>
            <div class="text-caption">{{ contract.supply_type.toUpperCase() }}</div>
          </q-card-section>

          <q-card-section>
            <div class="text-body2">
              <q-icon name="person" /> Cliente: <strong>{{ contract.name }}</strong>
            </div>
            <div class="text-body2">
              <q-icon name="badge" /> Codice Cliente: <strong>{{ contract.client_code }}</strong>
            </div>
            <div class="text-body2">
              <q-icon name="location_on" /> Indirizzo:
              <strong>{{ contract.supply_address }}</strong>
            </div>
            <div class="text-body2">
              <q-icon name="event" /> Inizio:
              <strong>{{ formatDate(contract.supply_start_date) }}</strong>
            </div>
            <div class="text-body2">
              <q-icon name="schedule" /> Fine:
              <strong>{{ formatDate(contract.contract_end_date) }}</strong>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn flat icon="edit" label="Modifica" color="info" @click="editContract(contract)" />
            <q-btn
              flat
              icon="delete"
              label="Elimina"
              color="negative"
              @click="confirmDelete(contract._id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-spinner v-else-if="loading" color="primary" size="2em" class="q-mt-md" />
    <q-banner v-else class="bg-warning text-dark q-mt-md">Nessun contratto disponibile.</q-banner>

    <!-- Add Contract Dialog -->
    <q-dialog v-model="contractStore.showDialog">
      <q-card style="max-width: 500px">
        <q-card-section>
          <div class="text-h6">Aggiungi Nuovo Contratto</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="contractStore.newContract.supply_type"
            label="Tipo di Fornitura"
            :options="['energy', 'gas']"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.name"
            label="Nome Cliente"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.fiscal_code"
            label="Codice Fiscale"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.supply_address"
            label="Indirizzo Fornitura"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.billing_address"
            label="Indirizzo Fatturazione"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.client_code"
            label="Codice Cliente"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.contract_name"
            label="Nome Contratto"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.contract_code"
            label="Codice Contratto"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.consumption_since_start"
            label="Consumo Totale"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.power_available"
            label="Potenza Disponibile"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.supply_start_date"
            label="Data Inizio"
            type="date"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.contract_end_date"
            label="Data Fine"
            type="date"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.billing_frequency"
            label="Frequenza Fatturazione"
            dense
            outlined
            class="q-mb-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" color="negative" @click="contractStore.closeDialog()" />
          <q-btn label="Salva" color="primary" @click="saveContract" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
<script>
import { useContractStore } from '../stores/contractStore'
import { mapActions } from 'pinia'

export default {
  name: 'ContractsPage',
  data() {
    return {
      contractStore: useContractStore(),
    }
  },
  computed: {
    contracts() {
      return this.contractStore.contracts
    },
    loading() {
      return this.contractStore.loading
    },
  },
  methods: {
    ...mapActions(useContractStore, ['fetchContracts', 'addContract']),
    saveContract() {
      this.contractStore.addContract()
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A'

      const date = new Date(dateString)
      return date.toLocaleDateString('it-IT')
    },

    editContract(contract) {
      this.contractStore.newContract = { ...contract }
      this.contractStore.openDialog()
    },

    confirmDelete(contractId) {
      if (confirm('Sei sicuro di voler eliminare questo contratto?')) {
        this.contractStore.deleteContract(contractId)
      }
    },
  },
  created() {
    this.fetchContracts()
  },
}
</script>
