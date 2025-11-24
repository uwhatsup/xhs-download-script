import { defineStore } from 'pinia'
import { XhsNote } from '@/types'

export const useNoteStore = defineStore('xhs-download-script-note', {
  state: () => ({
    note: {} as XhsNote,
  }),

  actions: {
    setNote(data: XhsNote) {
      this.note = { ...data }
    },
  },
  persist: false,
})
