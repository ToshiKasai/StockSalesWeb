import Vue from 'vue'
import { readJwtPayload, checkType, myIsNaN, makeArray, makeSingle } from '@/libraries/supports'

const state = {
  userId: 0,
  signinId: null,
  fullName: null,
  roles: []
}

const mutations = {
  userId: (state, item) => {
    if (checkType(item, 'number') && !myIsNaN(item)) {
      state.userId = item
    } else if (checkType(item, 'string') && /^([1-9]\d*|0)$/.test(item)) {
      state.userId = item | 0
    } else {
      state.userId = 0
    }
  },
  roles(state, items) {
    state.roles = makeArray(items, 'string')
  },
  siginId(state, item) {
    state.signinId = makeSingle(item, 'string')
  },
  fullName(state, item) {
    state.fullName = makeSingle(item, 'string')
  }
}

const actions = {
  access_token: (context, param) => {
    if (param.hasOwnProperty('access_token')) {
      Vue.ls.set('bearer', param.access_token, param.expires_in * 1000)
      let payload = readJwtPayload(param.access_token)
      context.commit('userId', payload.nameid)
      context.commit('roles', payload.role)
      context.commit('siginId', payload.unique_name)
      context.commit('fullName', payload.name)
    } else {
      Vue.ls.remove('bearer')
      context.commit('userId', 0)
      context.commit('roles', [])
      context.commit('siginId', null)
      context.commit('fullName', null)
    }
  },
  refresh_token: (contex, param) => {
    if (param.hasOwnProperty('refresh')) {
      Vue.ls.set('refresh', param.refresh_token)
    } else {
      Vue.ls.remove('refresh')
    }
  },
  signin: ({ dispatch, commit, state }, params) => {
    if (params == null) return
    if (!params.hasOwnProperty('inputId')) return
    if (!params.hasOwnProperty('password')) return

    let fparam = new URLSearchParams()
    fparam.append('grant_type', 'password')
    fparam.append('username', params.inputId)
    fparam.append('password', params.password)
    fparam.append('client_id', Vue.ls.get('clientId', null))

    return Vue.http.post('oauth/token', fparam)
      .then((response) => {
        var data = response.data
        dispatch('access_token', data)
        dispatch('refresh_token', data)
      })
      .catch((error) => {
        if (error) { }
        dispatch('access_token', {})
      })
  },
  signOut: (context) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        context.dispatch('access_token', {})
        resolve()
      }, 3000)
    })
  },
  refreshToken: (context) => {
    let fparam = new URLSearchParams()
    fparam.append('grant_type', 'refresh_token')
    fparam.append('refresh_token', Vue.ls.get('refresh', null))
    fparam.append('client_id', Vue.ls.get('clientId', null))

    return Vue.http.post('oauth/token', fparam)
      .then((response) => {
        var data = response.data
        context.dispatch('access_token', data)
        context.dispatch('refresh_token', data)
      })
      .catch((error) => {
        if (error) { }
        context.dispatch('access_token', {})
      })
  }
}

const getters = {
  isAuthenticated: (state) => {
    return state.userId !== 0
  },
  isAdminRole: (state) => {
    return state.roles.indexOf('admin') >= 0
  },
  isUserRole: (state, getters) => {
    return getters.isAdminRole || state.roles.indexOf('user') >= 0
  },
  isMakerRole: (state, getters) => {
    return getters.isAdminRole || state.roles.indexOf('maker') >= 0
  },
  isGroupRole: (state, getters) => {
    return getters.isAdminRole || state.roles.indexOf('group') >= 0
  },
  isProductRole: (state, getters) => {
    return getters.isAdminRole || state.roles.indexOf('product') >= 0
  },
  isLogviewRole: (state, getters) => {
    return getters.isAdminRole || state.roles.indexOf('logview') >= 0
  },
  userId: (state) => {
    return state.userId
  },
  siginId: (state, getters) => {
    if (!getters.isAuthenticated) {
      return null
    }
    return state.signinId || '未定義'
  },
  fullName: (state, getters) => {
    if (!getters.isAuthenticated) {
      return null
    }
    return state.fullName || '名前不明'
  },
  isAdmin: (state, getters) => {
    return getters.isAuthenticated && state.roles.indexOf('admin') >= 0
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
