import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { EatenRecord, Prefs, Review } from './types'
import { loadLS, saveLS } from './lib'

const DEFAULT_PREFS: Prefs = {
  spice: 1,
  budget: 15,
  avoid: [],
  nickname: '干饭人 0823',
}

interface StoreValue {
  prefs: Prefs
  setPrefs: (prefs: Prefs) => void
  favorites: string[]
  toggleFavorite: (id: string) => void
  myReviews: Review[]
  addReview: (review: Review) => void
  eaten: EatenRecord[]
  markEaten: (dishId: string) => void
  toast: string | null
  notify: (message: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<Prefs>(() => loadLS('fd.prefs', DEFAULT_PREFS))
  const [favorites, setFavorites] = useState<string[]>(() => loadLS('fd.favorites', []))
  const [myReviews, setMyReviews] = useState<Review[]>(() => loadLS('fd.reviews', []))
  const [eaten, setEaten] = useState<EatenRecord[]>(() => loadLS('fd.eaten', []))
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => saveLS('fd.prefs', prefs), [prefs])
  useEffect(() => saveLS('fd.favorites', favorites), [favorites])
  useEffect(() => saveLS('fd.reviews', myReviews), [myReviews])
  useEffect(() => saveLS('fd.eaten', eaten), [eaten])

  const notify = (message: string) => {
    setToast(message)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 2600)
  }

  const value: StoreValue = {
    prefs,
    setPrefs: setPrefsState,
    favorites,
    toggleFavorite: (id) =>
      setFavorites((list) => (list.includes(id) ? list.filter((x) => x !== id) : [id, ...list])),
    myReviews,
    addReview: (review) => setMyReviews((list) => [review, ...list]),
    eaten,
    markEaten: (dishId) => {
      setEaten((list) => {
        const today = new Date().toDateString()
        const filtered = list.filter((e) => new Date(e.at).toDateString() !== today)
        return [{ dishId, at: Date.now() }, ...filtered]
      })
    },
    toast,
    notify,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
