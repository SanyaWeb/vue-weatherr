import Vue from 'vue'
import Vuex from 'vuex'
import cities from "./cities"
import weather from "./weather"
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    cities, weather
  }
})
