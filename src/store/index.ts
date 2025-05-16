import { createStore } from 'vuex'
import authModule from './modules/auth'
import galleryModule from './modules/gallery'

export default createStore({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    auth: authModule,
    gallery: galleryModule
  }
})
