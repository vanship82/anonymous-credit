import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'co-lodash';
import config from '../config';
import { web3, acContract } from '../web3';
import BN from 'big-number'
import moment from 'moment';
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    mineDifficulty : '0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    mineIndex: 1,
    lastHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  },
  mutations: {
    setMineDifficulty (state, payload) {
      state.mineDifficulty = payload;
    },
    setMineIndex (state, payload) {
      state.mineIndex = payload;
    },
    setLashHash (state, payload) {
      state.lastHash = payload;
    }
  },
  actions: {
    async getMineState (ctx) {
      console.log(acContract);
      const blockLength = acContract.methods.addresses.length;
      ctx.commit('setMineIndex', blockLength);
      if (blockLength == 0) {
        const lastHash = await acContract.methods.initial_hash().call();
        ctx.commit('setLashHash', lastHash)
      }
      const difficulty = await acContract.methods.current_difficulty().call();
      const target_difficulty = await acContract.methods.target_difficulty1().call();
      const difficulty_decimals = await acContract.methods.difficulty_decimals().call();
      console.log(target_difficulty,difficulty_decimals,difficulty);
      const mineDifficulty = BN(target_difficulty).mult(10**difficulty_decimals).div(difficulty).toString(16);
      ctx.commit('setMineDifficulty', mineDifficulty);
    },
  }
})
