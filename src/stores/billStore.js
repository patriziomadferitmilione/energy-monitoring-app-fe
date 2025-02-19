import { defineStore } from 'pinia'
import axios from 'axios'

export const useBillStore = defineStore('billStore', {
  state: () => ({
    bills: [],
    contracts: [],
    loading: false,
    showDialog: false,
    newBill: {
      bill_type: '',
      provider: '',
      bill_number: '',
      billing_period_start: '',
      billing_period_end: '',
      due_date: '',
      issue_date: '',
      meter_number: '',
      currency: '€',
      status: 'pending',
      expenses: {
        total_amount: null,
        energy: null,
        transport: null,
        system_duties: null,
        other_duties: null,
        taxes: null,
        vat: null,
      },
      consumption: {
        unit: '',
        total_value: null,
      },
    },
  }),

  getters: {
    getBillsByType: (state) => (type) => {
      return state.bills.filter((bill) => bill.bill_type === type)
    },
  },

  actions: {
    openDialog() {
      this.showDialog = true
    },
    closeDialog() {
      this.showDialog = false
    },

    async fetchBills() {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5000/api/bills', {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.bills = response.data
      } catch (error) {
        console.error('Error fetching bills:', error)
      } finally {
        this.loading = false
      }
    },

    async addBill() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.post('http://localhost:5000/api/bills', this.newBill, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        })

        if (response.status === 201) {
          this.bills.push(response.data)
          this.resetForm() // Reset after successful save
        } else {
          console.error('Failed to add bill')
        }
      } catch (error) {
        console.error('Error saving bill:', error)
      }
    },

    resetForm() {
      this.newBill = {
        bill_type: '',
        provider: '',
        bill_number: '',
        billing_period_start: '',
        billing_period_end: '',
        due_date: '',
        issue_date: '',
        meter_number: '',
        currency: '€',
        status: 'pending',
        expenses: {
          total_amount: null,
          energy: null,
          transport: null,
          system_duties: null,
          other_duties: null,
          taxes: null,
          vat: null,
        },
        consumption: {
          unit: '',
          total_value: null,
        },
      }
    },

    async fetchContracts() {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5000/api/contracts', {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.contracts = response.data
      } catch (error) {
        console.error('Error fetching contracts:', error)
      } finally {
        this.loading = false
      }
    },
  },
})
