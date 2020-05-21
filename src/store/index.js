import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'co-lodash';
import config from '../config';
import { web3, acContract } from '../web3';
import BN from 'bn.js'
import moment from 'moment';
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    mineDifficulty : '',
    mineIndex: 0,
    lastHash: '',
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
      const blockLength = acContract.methods.addresses.length + 2;
      console.log(blockLength);
      ctx.commit('setMineIndex', blockLength);
      if (blockLength == 0) {
        const lastHash = await acContract.methods.initial_hash().call();
        ctx.commit('setLashHash', lastHash)
      } else {
        const res = await acContract.methods.addresses(blockLength-1).call();
        ctx.commit('setLashHash', res.hash)
      }
      const difficulty = await acContract.methods.current_difficulty().call();
      const target_difficulty = await acContract.methods.target_difficulty1().call();
      const difficulty_decimals = await acContract.methods.difficulty_decimals().call();
      console.log(target_difficulty,difficulty_decimals,difficulty);
      let mineDifficulty = new BN(target_difficulty);
      mineDifficulty = mineDifficulty.mul(new BN(10**difficulty_decimals));
      mineDifficulty = mineDifficulty.div(new BN(difficulty));
      mineDifficulty = '0x' + mineDifficulty.toString(16,64);
      ctx.commit('setMineDifficulty', mineDifficulty);
    },
  }
})
