import { defineStore } from 'pinia'
import api from '../services/api'

export const useRafflesStore = defineStore('raffles', {
    state: () => ({
        raffles: [],
        loading: false,
        error: null
    }),
    getters: {
        activeRaffles: (state) => state.raffles.filter(r => r.status === 'active'),
        completedRaffles: (state) => state.raffles.filter(r => r.status === 'completed')
    },
    actions: {
        async fetchRaffles() {
            this.loading = true
            this.error = null
            try {
                const response = await api.get('/raffles')
                this.raffles = response.data.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar rifas'
                throw error
            } finally {
                this.loading = false
            }
        },
        async createRaffle(raffleData) {
            this.loading = true
            this.error = null
            try {
                const response = await api.post('/raffles', raffleData)
                this.raffles.unshift(response.data.data)
                return response.data.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al crear rifa'
                throw error
            } finally {
                this.loading = false
            }
        },
        async updateRaffle(id, raffleData) {
            this.loading = true
            this.error = null
            try {
                const response = await api.put(`/raffles/${id}`, raffleData)
                const index = this.raffles.findIndex(r => r.id === id)
                if (index !== -1) {
                    this.raffles[index] = response.data.data
                }
                return response.data.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al actualizar rifa'
                throw error
            } finally {
                this.loading = false
            }
        },
        async deleteRaffle(id) {
            this.loading = true
            this.error = null
            try {
                await api.delete(`/raffles/${id}`)
                this.raffles = this.raffles.filter(r => r.id !== id)
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al eliminar rifa'
                throw error
            } finally {
                this.loading = false
            }
        },
        async performDraw(id) {
            this.loading = true
            this.error = null
            try {
                const response = await api.post(`/admin/raffles/${id}/draw`)
                const index = this.raffles.findIndex(r => r.id === id)
                if (index !== -1) {
                    this.raffles[index] = response.data.data.raffle
                }
                return response.data.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al realizar sorteo'
                throw error
            } finally {
                this.loading = false
            }
        }
    }
})
