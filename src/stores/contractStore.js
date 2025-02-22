import { defineStore } from 'pinia'
import axios from 'axios'

export const useContractStore = defineStore('contractStore', {
  state: () => ({
    // baseUrl: 'http://localhost:5000',
    baseUrl: 'https://backend.bollettify.com',
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
        const response = await axios.get(`${this.baseUrl}/api/contracts`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.contracts = response.data
      } catch (error) {
        console.error('Error fetching contracts:', error)
      } finally {
        this.loading = false
      }
    },

    async addContract() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.post(`${this.baseUrl}/api/contracts`, this.newContract, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        this.contracts.push(response.data) // Add new contract to the list
        this.closeDialog()
        this.resetNewContract()
      } catch (error) {
        console.error('Error adding contract:', error)
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
