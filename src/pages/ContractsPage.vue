<template>
  <q-page class="q-pa-md">
    <h4 class="text-center">Contratti</h4>

    <q-btn
      color="primary"
      label="Nuovo Contratto"
      @click="contractStore.openDialog()"
      class="q-mb-md"
    />

    <q-list bordered separator v-if="contracts.length">
      <q-item v-for="contract in contracts" :key="contract._id">
        <q-item-section>
          <q-item-label>{{ contract.contract_name }}</q-item-label>
          <q-item-label caption>Cliente: {{ contract.name }}</q-item-label>
          <q-item-label caption>Codice Cliente: {{ contract.client_code }}</q-item-label>
          <q-item-label caption>Tipo: {{ contract.supply_type }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <q-spinner v-else-if="loading" color="primary" size="2em" />
    <q-banner v-else class="bg-warning text-dark"> Nessun contratto disponibile. </q-banner>

    <!-- Add Contract Dialog -->
    <q-dialog v-model="contractStore.showDialog">
      <q-card style="width: 450px">
        <q-card-section>
          <div class="text-h6">Aggiungi Nuovo Contratto</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="contractStore.newContract.supply_type"
            label="Tipo di Fornitura"
            :options="['energy', 'gas']"
            class="q-mb-md"
          />
          <q-input v-model="contractStore.newContract.name" label="Nome Cliente" class="q-mb-md" />
          <q-input
            v-model="contractStore.newContract.fiscal_code"
            label="Codice Fiscale"
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.supply_address"
            label="Indirizzo Fornitura"
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.billing_address"
            label="Indirizzo Fatturazione"
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.client_code"
            label="Codice Cliente"
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.contract_name"
            label="Nome Contratto"
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.contract_code"
            label="Codice Contratto"
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.consumption_since_start"
            label="Consumo Totale"
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.power_available"
            label="Potenza Disponibile"
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.supply_start_date"
            label="Data Inizio"
            type="date"
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.contract_end_date"
            label="Data Fine"
            type="date"
            class="q-mb-md"
          />
          <q-input
            v-model="contractStore.newContract.billing_frequency"
            label="Frequenza Fatturazione"
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
  },
  created() {
    this.fetchContracts()
  },
}
</script>
