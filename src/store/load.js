// stores/load.js

import { defineStore } from "pinia"
export const useLoadStore = defineStore({
  id: 'load',
  state: () => ({
    loadedComponents: {} // 改为动态键值对
  }),
  actions: {
    setComponentLoaded(name) {
      this.loadedComponents[name] = true
    },
    isComponentLoaded(name) {
      return this.loadedComponents[name]
    }
  }
})