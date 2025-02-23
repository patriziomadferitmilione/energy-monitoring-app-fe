import { defineStore } from 'pinia'
import axios from 'axios'
import { Notify } from 'quasar'
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
        Notify.create({
          message: error.response?.data?.message || 'Errore nel recupero bollette',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
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

          Notify.create({
            message: 'Bolletta aggiunta correttamente',
            color: 'positive',
            position: 'bottom',
          })
        } else {
          console.error('Failed to add bill')
        }
      } catch (error) {
        console.error('Error saving bill:', error)
        Notify.create({
          message: error.response?.data?.message || 'Errore nella creazione della bolletta',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
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
        },
      }
    },

    async fetchBillSummary() {
      this.loading = true
      try {
        const response = await axios.get(`${globalBaseUrl}/api/bills/summary`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        this.billSummary = response.data
      } catch (error) {
        console.error('Error fetching bill summary:', error)
        Notify.create({
          message: error.message || 'Errore nel recupero del riepilogo bollette',
          color: 'negative',
          icon: 'error',
          position: 'top-right',
        })
      } finally {
        this.loading = false
      }
    },

    async fetchUnpaidBills() {
      this.loading = true
      try {
        const response = await axios.get(`${globalBaseUrl}/api/bills/unpaid`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        this.unpaidBills = response.data
      } catch (error) {
        console.error('Error fetching unpaid bills:', error)
        Notify.create({
          message: error.message || 'Errore nel recupero delle bollette non pagate',
          color: 'negative',
          icon: 'error',
          position: 'top-right',
        })
      } finally {
        this.loading = false
      }
    },

    async fetchOverdueBills() {
      this.loading = true
      try {
        const response = await axios.get(`${globalBaseUrl}/api/bills/overdue`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        this.overdueBills = response.data
      } catch (error) {
        console.error('Error fetching overdue bills:', error)
        Notify.create({
          message: error.message || 'Errore nel recupero delle bollette scadute',
          color: 'negative',
          icon: 'error',
          position: 'top-right',
        })
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

        const billIndex = this.bills.findIndex((bill) => bill._id === billId)
        if (billIndex !== -1) {
          this.bills[billIndex].status = newStatus
        }

        Notify.create({
          message: 'Stato bolletta aggiornato correttamente',
          color: 'positive',
          position: 'bottom',
        })

        await this.fetchBills()
      } catch (error) {
        console.error('Error updating bill status:', error)
        Notify.create({
          message: error.response?.data?.message || 'Errore aggiornando lo stato della bolletta',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
      }
    },

    async uploadPDF() {
      if (!this.pdfFile) {
        Notify.create({
          message: 'Nessun file selezionato per il caricamento',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
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

          Notify.create({
            message: 'Dati bolletta estratti correttamente',
            color: 'positive',
            position: 'bottom',
          })
        }
      } catch (error) {
        console.error('🚨 Upload Error:', error)
        Notify.create({
          message: error.response?.data?.message || 'Errore nel caricamento del file',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
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
          month = monthNames[month] || '01'
          return `${year}-${month}-${day.padStart(2, '0')}`
        }

        if (dateStr.includes('/')) {
          let [day, month, year] = dateStr.split('/')
          return `${year}-${month}-${day}`
        }

        return ''
      }

      this.newBill = {
        ...data,
        billing_period_start: formatDateForInput(data.billing_period_start),
        billing_period_end: formatDateForInput(data.billing_period_end),
        due_date: formatDateForInput(data.due_date),
        issue_date: formatDateForInput(data.issue_date),
        currency: data.currency || '€',
        status: data.status || 'pending',
      }
    },
  },
})
