import Vue from 'vue'

const state = {
  selectMyMaker: true,
  selectMaker: null,
  selectGroup: null,
  selectYear: null
}

const mutations = {
  selectMaker(state, item) {
    state.selectMaker = item
  },
  selectGroup(state, item) {
    state.selectGroup = item
  },
  selectMyMaker(state, flags) {
    state.selectMyMaker = flags
  },
  selectYear(state, item) {
    state.selectYear = item
  }
}

const actions = {
  getMakers({ commit, state }) {
    return Vue.http.get('api/makers')
  },
  getMyMakers({ commit, state }, id) {
    return Vue.http.get('api/users/' + id + '/makers')
  },
  getGroupsByMakerId({ commit, state }, id) {
    return Vue.http.get('api/groups', {
      params: { 'MakerId': id }
    })
  },
  getProductsByMakerId({ commit, products }, id) {
    return Vue.http.get('api/products', {
      params: { 'MakerId': id }
    })
  },
  getProductsByGroupId({ commit, products }, id) {
    return Vue.http.get('api/products', {
      params: { 'GroupId': id }
    })
  },
  getSalesviewsByGroupId({ commit, products }, params) {
    return Vue.http.get('api/salesviews', {
      params: { 'GroupId': params.id, 'Year': params.year }
    })
  },
  getSalesviewsByMakerId({ commit, products }, params) {
    return Vue.http.get('api/salesviews', {
      params: { 'MakerId': params.id, 'Year': params.year }
    })
  },
  getSalesviewById({ commit, products }, params) {
    return Vue.http.get('api/salesviews/' + params.id, {
      params: { 'Year': params.year }
    })
  },
  getStocksCurrent({ commit, products }, id) {
    return Vue.http.get('api/salesviews/' + id + '/current')
  },
  getSalesTrends({ commit, products }, params) {
    return Vue.http.get('api/salesviews/' + params.id + '/trends', {
      params: { 'Year': params.year }
    })
  }
}

const getters = {
  selectMaker(state, getters, rootState) {
    return state.selectMaker
  },
  selectGroup(state, getters, rootState) {
    return state.selectGroup
  },
  selectMyMaker(state, getters, rootState) {
    return state.selectMyMaker
  },
  selectYear(state, getters, rootState) {
    return state.selectYear
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
