import Vue from 'vue'

const state = {
}

const mutations = {
}

const actions = {
  getUsers({ commit, state }) {
    return Vue.http.get('api/users', {
      params: { 'Deleted': true, 'Enabled': false }
    })
  },
  getUser({ commit, state }, id) {
    return Vue.http.get('api/users/' + id)
  },
  setUser({ commit, state }, user) {
    return Vue.http.put('api/users/' + user.id, user)
  },
  addUser({ commit, state }, user) {
    return Vue.http.post('api/users', user)
  },
  getUserRoles({ commit, state }, id) {
    return Vue.http.get('api/users/' + id + '/roles')
  },
  setUserRoles({ commit, state }, params) {
    return Vue.http.post('api/users/' + params.id + '/roles', params.roles)
  },
  getUserMakers({ commit, state }, id) {
    return Vue.http.get('api/users/' + id + '/makers')
  },
  setUserMakers({ commit, state }, params) {
    return Vue.http.post('api/users/' + params.id + '/makers', params.makers)
  },
  getRoles({ commit, state }) {
    return Vue.http.get('api/roles', {
      params: { 'Deleted': true, 'Enabled': false }
    })
  },
  getRoleList({ commit, state }) {
    return Vue.http.get('api/roles')
  },
  getMakers({ commit, state }) {
    return Vue.http.get('api/makers', {
      params: { 'Deleted': true, 'Enabled': false }
    })
  },
  getMakerList({ commit, state }) {
    return Vue.http.get('api/makers')
  },
  setMakers({ commit, state }, maker) {
    return Vue.http.put('api/makers/' + maker.id, maker)
  },
  getProducts({ commit, products }) {
    return Vue.http.get('api/products', {
      params: { 'Deleted': true, 'Enabled': false }
    })
  },
  getProductList({ commit, products }, makerId) {
    return Vue.http.get('api/products', {
      params: { 'MakerId': makerId }
    })
  },
  getProduct({ commit, products }, id) {
    return Vue.http.get('api/products/' + id)
  },
  setProduct({ commit, state }, product) {
    return Vue.http.put('api/products/' + product.id, product)
  },
  getGroups({ commit, products }) {
    return Vue.http.get('api/groups', {
      params: { 'Deleted': true, 'Enabled': false }
    })
  },
  getGroup({ commit, products }, id) {
    return Vue.http.get('api/groups/' + id)
  },
  addGroup({ commit, products }, group) {
    return Vue.http.post('api/groups', group)
  },
  setGroup({ commit, products }, group) {
    return Vue.http.put('api/groups/' + group.id, group)
  },
  getGroupProducts({ commit, products }, id) {
    return Vue.http.get('api/groups/' + id + '/products')
  },
  getContainers() {
    return Vue.http.get('api/containers')
  },
  getDashboards({ commit, state }) {
    return Vue.http.get('api/dashboards', {
      params: { 'Deleted': true, 'Enabled': false }
    })
  }
}

const getters = {
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
