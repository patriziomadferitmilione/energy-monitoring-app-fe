import { defineStore } from 'pinia'
import axios from 'axios'

export const useBillStore = defineStore('billStore', {
  state: () => ({
    // baseUrl: 'http://localhost:5000',
    baseUrl: 'https://backend.bollettify.com',
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
    unpaidBills: [],
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
        const response = await axios.get(`${this.baseUrl}/api/bills`, {
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
        const response = await axios.post(`${this.baseUrl}/api/bills`, this.newBill, {
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

    async fetchBillSummary() {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${this.baseUrl}/api/bills/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log('fetch bills summary', response)
        this.billSummary = response.data
      } catch (error) {
        console.error('Error fetching bill summary:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchUnpaidBills() {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${this.baseUrl}/api/bills/unpaid`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log('unpaid', response)
        this.unpaidBills = response.data
      } catch (error) {
        console.error('Error fetching unpaid bills:', error)
      } finally {
        this.loading = false
      }
    },

    async updateBillStatus(billId, newStatus) {
      try {
        const token = localStorage.getItem('token')
        await axios.put(
          `${this.baseUrl}/api/bills/${billId}`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } },
        )

        // Update the bill status locally
        const billIndex = this.bills.findIndex((bill) => bill._id === billId)
        if (billIndex !== -1) {
          this.bills[billIndex].status = newStatus
        }

        // Refresh unpaid bills
        await this.fetchUnpaidBills()
      } catch (error) {
        console.error('Error updating bill status:', error)
      }
    },

    async fetchOverdueBills() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${this.baseUrl}/api/bills/overdue`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.overdueBills = response.data
      } catch (error) {
        console.error('Error fetching overdue bills:', error)
      }
    },
  },
})
