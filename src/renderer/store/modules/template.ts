import { defineStore } from 'pinia'
import store from '../index'

interface StateType {
  testData: string
}

const useStore = defineStore({
  id: 'template',
  state: (): StateType => ({
    testData: localStorage.getItem('testData') || ''
  }),
  getters: {
    getTest: (state): string => state.testData,
    getTest1(): string {
      return this.testData
    }
  },
  actions: {
    TEST_ACTION(data: string) {
      this.testData = data
      localStorage.setItem('testData', data)
    }
  }
})

export default function useStoreTemplate() {
  return useStore(store)
}
