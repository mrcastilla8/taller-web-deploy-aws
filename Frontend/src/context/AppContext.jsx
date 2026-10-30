import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../services/api'

const AppContext = createContext(null)
export function AppProvider({ children }) {
  const [student, setStudent] = useState(null)
  const [inscriptions, setInscriptions] = useState([])
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [pendingEventId, setPendingEventId] = useState(null)
  const refresh = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [state, cats] = await Promise.all([api('state'), api('categories')])
      setStudent(state.student); setInscriptions(state.inscriptions); setEvents(state.events); setCategories(cats)
      if (state.student) setFavorites(await api('favorites'))
      else setFavorites([])
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }, [])
  useEffect(() => { refresh() }, [refresh])
  const saveStudent = async (data) => { const state = await api('student', { method: 'PUT', body: data }); setStudent(state.student); setInscriptions(state.inscriptions); setEvents(state.events); setFavorites(await api('favorites')); return state }
  const clearStudent = async () => { const state = await api('student', { method: 'DELETE' }); setStudent(null); setInscriptions(state.inscriptions); setEvents(state.events); setFavorites([]) }
  const closeModal = () => { setModalOpen(false); setPendingEventId(null) }
  const openModal = (eventId = null) => { setPendingEventId(eventId); setModalOpen(true) }
  const confirmRegistration = async (data) => {
    await saveStudent(data)
    if (pendingEventId !== null) await api('inscriptions', { method: 'POST', body: { eventId: pendingEventId } })
    await refresh(); closeModal()
  }
  const inscribe = async (eventId) => {
    if (!student) { openModal(eventId); return }
    await api('inscriptions', { method: 'POST', body: { eventId } }); await refresh()
  }
  const cancelInscription = async (eventId) => { await api(`inscriptions/${eventId}`, { method: 'DELETE' }); await refresh() }
  const toggleFavorite = async (eventId) => {
    if (!student) { openModal(); throw new Error('Identifícate para guardar favoritos.') }
    const selected = favorites.some((event) => event.id === eventId)
    setFavorites(await api(`favorites/${eventId}`, { method: selected ? 'DELETE' : 'PUT' }))
  }
  return <AppContext.Provider value={{ student, saveStudent, clearStudent, inscriptions, inscribe, cancelInscription, isInscribed: (id) => inscriptions.includes(id), events, categories, favorites, toggleFavorite, loading, error, refresh, modalOpen, openModal, closeModal, confirmRegistration, pendingEventId }}>{children}</AppContext.Provider>
}
export function useApp() { const ctx = useContext(AppContext); if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>'); return ctx }
