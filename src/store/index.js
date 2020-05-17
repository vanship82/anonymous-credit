import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'co-lodash';
import config from '../config';
import { web3, acContracts } from '../web3';
import moment from 'moment';
import contracts from './contracts';
Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    contracts
  },
  state: {
    mineDifficulty : 4,
  },
  mutations: {
    setDifficulty (state, payload) {
      state.mineDifficulty = payload;
    },
  },
  actions: {
  }
})
