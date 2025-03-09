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
    editingBillId: null,
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
      // meter_number: '',
      status: 'pending',
      expenses: {
        total_amount: null,
        energy: null,
        gas: null,
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
    providerDialog: false,
    selectedProvider: null,
    selectedBillType: null,
    billMeans: {
      this_month: { energy: 0, gas: 0 },
      last_month: { energy: 0, gas: 0 },
      year: { energy: 0, gas: 0 },
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
        console.log('response fetch bills', response)

        this.bills = response.data.map((bill) => ({
          ...bill,
          hasPDF: !!bill.file_url,
        }))
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
      // Required fields list
      const requiredFields = {
        contract_name: 'Contratto',
        bill_type: 'Tipo di Bolletta',
        provider: 'Fornitore',
        bill_number: 'Numero Fattura',
        billing_period_start: 'Inizio Periodo',
        billing_period_end: 'Fine Periodo',
      }

      // Check if any required field is missing
      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => {
          const value = key.includes('.')
            ? key.split('.').reduce((obj, k) => (obj ? obj[k] : undefined), this.newBill)
            : this.newBill[key]

          return !value
        })
        .map((entry) => entry[1])

      if (missingFields.length > 0) {
        Notify.create({
          message: `Campi obbligatori mancanti: ${missingFields.join(', ')}`,
          color: 'warning',
          icon: 'error',
          position: 'bottom',
        })
        return
      }

      try {
        const token = localStorage.getItem('token')
        const response = await axios.post(`${globalBaseUrl}/api/bills`, this.newBill, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        })

        if (response.status === 201) {
          this.resetForm()
          this.fetchBills()

          Notify.create({
            message: 'Bolletta aggiunta correttamente',
            color: 'positive',
            position: 'bottom',
          })
          this.showDialog = false
        } else {
          console.error('Failed to add bill')
        }
      } catch (error) {
        console.error('Error saving bill:', error)

        // If backend returns validation errors, display them
        if (error.response?.data?.error?.errors) {
          const errorMessages = Object.values(error.response.data.error.errors)
            .map((err) => err.message)
            .join(', ')

          Notify.create({
            message: `Errore: ${errorMessages}`,
            color: 'negative',
            icon: 'error',
            position: 'bottom',
          })
        } else {
          Notify.create({
            message: error.response?.data?.message || 'Errore nella creazione della bolletta',
            color: 'negative',
            icon: 'error',
            position: 'bottom',
          })
        }
      }
    },

    async deleteBill(billId) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${globalBaseUrl}/api/bills/${billId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        Notify.create({
          message: 'Bolletta eliminata correttamente',
          color: 'positive',
          position: 'bottom',
        })

        await this.fetchBills()
      } catch (error) {
        console.error('Error deleting bill:', error)
        Notify.create({
          message: error.response?.data?.message || 'Errore eliminando la bolletta',
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
        // meter_number: '',
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

    // DASHBOARD
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
          position: 'bottom',
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
          position: 'bottom',
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
          position: 'bottom',
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

        await this.fetchOverdueBills()
        await this.fetchUnpaidBills()
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

    async fetchBillMeans() {
      this.loading = true
      try {
        const response = await axios.get(`${globalBaseUrl}/api/bills/means`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        console.log('means res', response)
        this.billMeans = response.data
        console.log('bill means', this.billMeans)
      } catch (error) {
        console.error('Error fetching bill means:', error)
        Notify.create({
          message: error.message || 'Errore nel recupero delle medie delle bollette',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
      } finally {
        this.loading = false
      }
    },

    // UPLOAD - DOWNLOAD
    openProviderDialog() {
      this.providerDialog = true
    },

    closeProviderDialog() {
      this.providerDialog = false
    },

    async confirmUpload() {
      if (!this.selectedProvider || !this.selectedBillType) {
        Notify.create({
          message: 'Seleziona il fornitore e il tipo di bolletta prima di caricare il file',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
        return
      }

      this.uploadPDF()
      this.closeProviderDialog()
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
      formData.append('provider', this.selectedProvider)
      formData.append('bill_type', this.selectedBillType)

      const token = localStorage.getItem('token')
      // console.log('form data', formData)
      try {
        let response = await axios.post(`${globalBaseUrl}/api/bills/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.structuredData) {
          // console.log('structured data', response.data.structuredData)
          this.populateBillForm(response.data.structuredData, response.data.file_url)
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

    populateBillForm(data, fileUrl) {
      const formatDateForInput = (dateStr) => {
        if (!dateStr) return ''

        const monthNames = {
          gennaio: '01',
          febbraio: '02',
          marzo: '03',
          aprile: '04',
          maggio: '05',
          giugno: '06',
          luglio: '07',
          agosto: '08',
          settembre: '09',
          ottobre: '10',
          novembre: '11',
          dicembre: '12',
        }

        let dateParts = dateStr.split(' ')
        if (dateParts.length === 3) {
          let [day, month, year] = dateParts
          console.log('day', day)
          console.log('month', month)
          console.log('year', year)
          month = monthNames[month.toLowerCase()] || '01'
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
        file_url: fileUrl,
        billing_period_start: formatDateForInput(data.billing_period_start),
        billing_period_end: formatDateForInput(data.billing_period_end),
        due_date: formatDateForInput(data.due_date),
        issue_date: formatDateForInput(data.issue_date),
        status: data.status || 'pending',
      }
    },

    async downloadBillPDF(bill) {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${globalBaseUrl}/api/bills/download/${bill._id}`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        })

        const filename = bill.file_url ? bill.file_url.split('/').pop() : `bolletta_${bill._id}.pdf`

        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.remove()

        Notify.create({
          message: 'Download avviato con successo!',
          color: 'positive',
          position: 'bottom',
        })
      } catch (error) {
        console.error('Error downloading bill PDF:', error)
        Notify.create({
          message: error.message || 'Errore durante il download del PDF',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
      }
    },

    async uploadBillPDF(billId, file) {
      try {
        console.log('📤 Uploading PDF for bill ID:', billId, 'File:', file)

        let formData = new FormData()
        formData.append('pdfFile', file)

        const token = localStorage.getItem('token')
        const response = await axios.post(`${globalBaseUrl}/api/bills/upload/${billId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        })

        console.log('✅ Upload success:', response.data)
        Notify.create({
          message: 'PDF uploaded successfully',
          color: 'positive',
          position: 'bottom',
        })

        return response.data
      } catch (error) {
        console.error('🚨 Error uploading PDF:', error)
        Notify.create({
          message: error.response?.data?.message || 'Error uploading PDF',
          color: 'negative',
          icon: 'error',
          position: 'bottom',
        })
      }
    },
  },
})
