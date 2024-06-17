import { create } from 'zustand';

export const useStore = create((set) => ({
  status: 'idle',
  session: undefined,
  setStatus: (status) => set({ status }),
  setState: state => set(() => ({ ...state }))
}));
