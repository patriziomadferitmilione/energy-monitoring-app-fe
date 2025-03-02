import { defineStore } from 'pinia'
import axios from 'axios'
import { Notify } from 'quasar'
import { globalBaseUrl } from 'src/boot/global'

export const useContractStore = defineStore('contractStore', {
  state: () => ({
    contracts: [],
    loading: false,
    showDialog: false,
    editContractId: null,
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

    async updateContract() {
      if (!this.editContractId) return

      try {
        const token = localStorage.getItem('token')
        const response = await axios.put(
          `${globalBaseUrl}/api/contracts/${this.editContractId}`,
          this.newContract,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        )

        const index = this.contracts.findIndex((contract) => contract._id === this.editContractId)
        if (index !== -1) {
          this.contracts[index] = response.data
        }

        this.closeDialog()
        Notify.create({ message: 'Contratto aggiornato correttamente', color: 'positive' })
      } catch (error) {
        console.error('Error updating contract:', error)
        Notify.create({
          message: error.response?.data?.message || 'Errore nell’aggiornamento del contratto',
          color: 'negative',
          icon: 'error',
        })
      }
    },

    async deleteContract(contractId) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${globalBaseUrl}/api/contracts/${contractId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        this.contracts = this.contracts.filter((contract) => contract._id !== contractId)

        Notify.create({ message: 'Contratto eliminato correttamente', color: 'positive' })
      } catch (error) {
        console.error('Error deleting contract:', error)
        Notify.create({
          message: error.response?.data?.message || 'Errore nella cancellazione del contratto',
          color: 'negative',
          icon: 'error',
        })
      }
    },

    openDialog(contract = null) {
      if (contract) {
        this.editContractId = contract._id
        this.newContract = { ...contract }
      } else {
        this.resetNewContract()
      }
      this.showDialog = true
    },

    closeDialog() {
      this.showDialog = false
      this.resetNewContract()
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
      this.editContractId = null
    },
  },
})
