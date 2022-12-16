import { defineStore } from 'pinia'

interface StateType {
  testData: string
}

export const useStoreTemplate = defineStore('template',{
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
