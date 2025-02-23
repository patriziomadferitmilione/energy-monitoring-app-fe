import { defineStore } from 'pinia'
import axios from 'axios'
import { globalBaseUrl } from 'src/boot/global'

export const useBillStore = defineStore('billStore', {
  state: () => ({
    bills: [],
    contracts: [],
    loading: false,
    showDialog: false,
    pdfFile: null,
    newBill: {
      user_id: null,
      contract_name: '',
      bill_type: '',
      provider: '',
      bill_number: '',
      billing_period_start: '',
      billing_period_end: '',
      due_date: '',
      issue_date: '',
      meter_number: '',
      // currency: '€',
      status: 'pending',
      expenses: {
        total_amount: null,
        energy: null,
        transport: null,
        system_duties: null,
        taxes: null,
        vat: null,
      },
      consumption: {
        unit: '',
        total_value: null,
        f1_unit_price: null,
        f1_quantity: null,
        f1_value: null,
        f2_unit_price: null,
        f2_quantity: null,
        f2_value: null,
        f3_unit_price: null,
        f3_quantity: null,
        f3_value: null,
      },
      user: {
        name: '',
        address: {
          street: '',
          civic_number: '',
          cap: '',
          city: '',
          province: '',
        },
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
        const response = await axios.get(`${globalBaseUrl}/api/bills`, {
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
        const response = await axios.post(`${globalBaseUrl}/api/bills`, this.newBill, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        })

        if (response.status === 201) {
          this.bills.push(response.data)
          this.resetForm()
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
        const response = await axios.get(`${globalBaseUrl}/api/contracts`, {
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
        const response = await axios.get(`${globalBaseUrl}/api/bills/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        // console.log('fetch bills summary', response)
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
        const response = await axios.get(`${globalBaseUrl}/api/bills/unpaid`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        // console.log('unpaid', response)
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
          `${globalBaseUrl}/api/bills/${billId}`,
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
        const response = await axios.get(`${globalBaseUrl}/api/bills/overdue`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.overdueBills = response.data
      } catch (error) {
        console.error('Error fetching overdue bills:', error)
      }
    },

    async uploadPDF() {
      if (!this.pdfFile) {
        console.warn('🚨 No file selected for upload')
        return
      }

      let formData = new FormData()
      formData.append('pdfFile', this.pdfFile)

      const token = localStorage.getItem('token')
      const loggedUser = JSON.parse(localStorage.getItem('loggedUser'))

      if (!loggedUser) {
        console.error('🚨 No logged-in user found.')
        return
      }

      try {
        let response = await axios.post(`${globalBaseUrl}/api/bills/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          params: { userName: `${loggedUser.firstName}_${loggedUser.lastName}` },
        })

        if (response.data.structuredData) {
          this.populateBillForm(response.data.structuredData)
          this.openDialog()
        }
      } catch (error) {
        console.error('🚨 Upload Error:', error)
        if (error.response) {
          console.error('🔍 Error Details:', error.response.data)
        }
      }
    },

    populateBillForm(data) {
      const formatDateForInput = (dateStr) => {
        if (!dateStr) return ''

        const monthNames = {
          Gennaio: '01',
          Febbraio: '02',
          Marzo: '03',
          Aprile: '04',
          Maggio: '05',
          Giugno: '06',
          Luglio: '07',
          Agosto: '08',
          Settembre: '09',
          Ottobre: '10',
          Novembre: '11',
          Dicembre: '12',
        }

        let dateParts = dateStr.split(' ')
        if (dateParts.length === 3) {
          let [day, month, year] = dateParts
          month = monthNames[month] || '01' // Convert Italian month name to number
          return `${year}-${month}-${day.padStart(2, '0')}`
        }

        // Handle "DD/MM/YYYY" format
        if (dateStr.includes('/')) {
          let [day, month, year] = dateStr.split('/')
          return `${year}-${month}-${day}`
        }

        return ''
      }

      this.newBill = {
        user_id: data.user_id || null,
        contract_id: data.contract_id || null,
        customerCode: data.customerCode || '',
        bill_type: data.bill_type || '',
        provider: data.provider || '',
        bill_number: data.bill_number || '',
        billing_period_start: formatDateForInput(data.billing_period_start),
        billing_period_end: formatDateForInput(data.billing_period_end),
        due_date: formatDateForInput(data.due_date),
        issue_date: formatDateForInput(data.issue_date),
        meter_number: data.meter_number || '',
        currency: data.currency || '€',
        status: data.status || 'pending',
        expenses: {
          total_amount: data.expenses.total_amount || null,
          energy: data.expenses.energy || null,
          transport: data.expenses.transport || null,
          system_duties: data.expenses.system_duties || null,
          taxes: data.expenses.taxes || null,
          vat: data.expenses.vat || null,
        },
        consumption: {
          unit: data.consumption.unit || '',
          total_value: data.consumption.total_value || null,
          f1_unit_price: data.consumption.f1_unit_price || null,
          f1_quantity: data.consumption.f1_quantity || null,
          f1_value: data.consumption.f1_value || null,
          f2_unit_price: data.consumption.f2_unit_price || null,
          f2_quantity: data.consumption.f2_quantity || null,
          f2_value: data.consumption.f2_value || null,
          f3_unit_price: data.consumption.f3_unit_price || null,
          f3_quantity: data.consumption.f3_quantity || null,
          f3_value: data.consumption.f3_value || null,
        },
        user: {
          name: data.user.name || '',
        },
      }
    },
  },
})
