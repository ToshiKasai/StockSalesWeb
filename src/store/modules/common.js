import Vue from 'vue'
import { makeArray } from '@/libraries/supports'

const state = {
  breadlist: [],
  fullLoadingShow: false,
  loadingShow: false,
  mainteLoadingShow: false,
  loadingMessage: null,
  activeIndex: ''
}

const mutations = {
  setBreadcrumb(state, items) {
    state.breadlist = makeArray(items)
  },
  changeBreadcrumb(state, item) {
    var count = state.breadlist.length
    var newlist = []
    for (var i = 0; i < count; i++) {
      if (state.breadlist[i].path === item.path) {
        break
      }
      newlist.push(state.breadlist[i])
    }
    newlist.push(item)
    state.activeIndex = item.path
    state.breadlist = newlist
  },
  fullLoadingShow(state, payload) {
    state.fullLoadingShow = payload
  },
  loadingShow(state, payload) {
    state.loadingShow = payload
  },
  mainteLoadingShow(state, payload) {
    state.mainteLoadingShow = payload
  },
  loadingMessage(state, payload) {
    state.loadingMessage = payload
  },
  activeIndex(state, item) {
    state.activeIndex = item
  }
}

const actions = {
  getDashboard({ commit, state }) {
    return Vue.http.get('api/dashboards')
  },
  endLoading({ commit }) {
    commit('fullLoadingShow', false)
    commit('loadingShow', false)
    commit('mainteLoadingShow', false)
    commit('loadingMessage', '')
  },
  nowLoading({ commit }, message) {
    commit('loadingMessage', message)
    commit('loadingShow', true)
  },
  nowLoadingFull({ commit }, message) {
    commit('loadingMessage', message)
    commit('fullLoadingShow', true)
  },
  nowLoadingMainte({ commit }, message) {
    commit('loadingMessage', message)
    commit('mainteLoadingShow', true)
  }
}

const getters = {
  activeIndex(state) {
    return state.activeIndex
  },
  getBreadlist(state, getters, rootState) {
    return state.breadlist
  },
  nowLoadingFull(state, getters, rootState) {
    return state.fullLoadingShow
  },
  nowLoading(state, getters, rootState) {
    return state.loadingShow
  },
  nowLoadingMainte(state, getters, rootState) {
    return state.mainteLoadingShow
  },
  loadingMessage(state, getters, rootState) {
    return state.loadingMessage || '処理中です'
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
