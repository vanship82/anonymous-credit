import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'co-lodash';
import config from '../config';
import { web3, amContract, acContract, cbtcContract } from '../web3c';
import BN from 'bn.js'
import moment from 'moment';
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    mineDifficulty : '',
    mineIndex: 0,
    lastHash: '',
    balance: 0,
    cbtcBalance: 0,
    loanState: {
      credit_limit: 0
    },
    isValidAddress: false
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
    },
    setBalance (state, payload) {
      state.balance = payload;
    },
    setLoanState (state, payload) {
      state.loanState = payload;
    },
    setCbtcBalance (state, payload) {
      state.cbtcBalance = payload;
    },
    setAddressState (state, payload) {
      state.isValidAddress = payload;
    }

    
  },
  actions: {
    async getMineState (ctx) {
      const blockLength = await amContract.methods.getNextAddressIndex().call();
      ctx.commit('setMineIndex', blockLength);
      if (blockLength == 0) {
        const lastHash = await amContract.methods.initial_hash().call();
        ctx.commit('setLashHash', lastHash)
      } else {
        const res = await amContract.methods.addresses(blockLength-1).call();
        ctx.commit('setLashHash', res.hash)
      }
      const difficulty = await amContract.methods.current_difficulty().call();
      const target_difficulty = await amContract.methods.target_difficulty1().call();
      const difficulty_decimals = await amContract.methods.difficulty_decimals().call();
      let mineDifficulty = new BN(target_difficulty);
      mineDifficulty = mineDifficulty.mul(new BN(10**difficulty_decimals));
      mineDifficulty = mineDifficulty.div(new BN(difficulty));
      mineDifficulty = '0x' + mineDifficulty.toString(16,64);
      ctx.commit('setMineDifficulty', mineDifficulty);
    },
    async getLoanState (ctx) {
      const accounts = await web3.eth.getAccounts();
      const address = accounts[0];
      const isValidAddress = await amContract.methods.isMinedAddress(address).call();
      ctx.commit('setAddressState', isValidAddress);
      console.log(isValidAddress);
      if (isValidAddress) {
        const balance = await acContract.methods.outstandingBalanceOf(address).call();
        const loanState = await acContract.methods.creditMap(address).call();
        const cbtcBalance = await cbtcContract.methods.balanceOf(address).call();
        ctx.commit('setBalance', balance);
        ctx.commit('setCbtcBalance', cbtcBalance);
        ctx.commit('setLoanState', loanState);
      }
    }
  }
})
