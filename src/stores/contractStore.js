import { defineStore } from 'pinia'
import axios from 'axios'
import { Notify } from 'quasar'
import { globalBaseUrl } from 'src/boot/global'

export const useContractStore = defineStore('contractStore', {
  state: () => ({
    contracts: [],
    loading: false,
    showDialog: false,
    newContract: {
      supply_type: '',
      name: '',
      fiscal_code: '',
      supply_address: '',
      billing_address: '',
      client_code: '',
      contract_name: '',
      contract_code: '',
      consumption_since_start: '',
      power_available: '',
      supply_start_date: '',
      contract_end_date: '',
      billing_frequency: '',
    },
  }),

  actions: {
    async fetchContracts() {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${globalBaseUrl}/api/contracts`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.contracts = response.data
      } catch (error) {
        console.error('Error fetching contracts:', error)
        Notify.create({
          message: error.response?.data?.message || 'Errore nel recupero forniture',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
      } finally {
        this.loading = false
      }
    },

    async addContract() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.post(`${globalBaseUrl}/api/contracts`, this.newContract, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        this.contracts.push(response.data)
        this.closeDialog()
        this.resetNewContract()

        Notify.create({
          message: 'Fornitura aggiunta correttamente',
          color: 'positive',
          position: 'bottom',
        })
      } catch (error) {
        console.error('Error adding contract:', error)
        Notify.create({
          message: error.response?.data?.message || 'Errore nella creazione fornitura',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
      }
    },

    openDialog() {
      this.showDialog = true
    },

    closeDialog() {
      this.showDialog = false
    },

    resetNewContract() {
      this.newContract = {
        supply_type: '',
        name: '',
        fiscal_code: '',
        supply_address: '',
        billing_address: '',
        client_code: '',
        contract_name: '',
        contract_code: '',
        consumption_since_start: '',
        power_available: '',
        supply_start_date: '',
        contract_end_date: '',
        billing_frequency: '',
      }
    },
  },
})
