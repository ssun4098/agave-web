import { create } from 'zustand'
import type { AccountDetail } from '../types/account'

interface AuthState {
  user: AccountDetail | null
  setUser: (user: AccountDetail) => void
  clear: () => void
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
}))

export default useAuthStore
