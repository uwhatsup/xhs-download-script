import { defineStore } from 'pinia'
import { XhsNote } from '@/types'

export const useNoteStore = defineStore('xhs-download-script-note', {
  state: () => ({} as XhsNote),
  actions: {
    setNote(note: Partial<XhsNote>) {
      Object.assign(this, note)
    },
  },
  persist: false,
})
