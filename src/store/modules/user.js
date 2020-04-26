const state = {
  private_key: process.env.NODE_ENV === 'development' ? 'Da_You_20202020@' : '',
  Code: 'kuaishi20202020@',
  BaseKey: process.env.NODE_ENV === 'development' ? 'Dev_Code' : '',
  ModuleName: 'meeting'// 业务名称
}

const getters = {}

const mutations = {
  SetDeCode (state, Code) {
    state.private_key = Code
  }
}

const actions = {

}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
