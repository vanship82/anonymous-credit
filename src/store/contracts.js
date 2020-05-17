import _ from 'co-lodash';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { getWrappers } from '@hashedge/contract-wrapper';
import abi from '../web3/abi.json';

let lastId = 1;

export default {
  namespaced: true,
  state: {
    getContract(addr) {
      const cobj = _.find(this.contracts, c => c[addr]);
      return cobj && cobj[addr];
    },
    async waitPendingTransactions() {
      while (_.some(this.pendingTransactions, t => t.state === 0)) await _.sleep(200);
      return _.find(this.pendingTransactions, t => t.state < 0);
    },
    pendingTransactions: [],
    msg: '',
    error: false,
    critical: false
  },
  mutations: {
    updatePendingTransaction(storeState, { id, contract, method, state, msg }) {
      const t = _.find(storeState.pendingTransactions, t => t.id === id);
      if (t) {
        Object.assign(t, { state, msg });
      } else {
        storeState.pendingTransactions.push({ id, contract, method, state, msg });
      }

      if (_.some(storeState.pendingTransactions, t => t.state !== 1)) {
        storeState.msg = _.some(storeState.pendingTransactions, t => t.state === 0) ? 'Wait for transactions...' : 'Something wrong...';
        storeState.error = _.some(storeState.pendingTransactions, t => t.state < 0);
        storeState.critical = _.some(storeState.pendingTransactions, t => t.state === 0);
      } else {
        storeState.msg = '';
        storeState.error = false;
        storeState.critical = false;
      }
    },
    clearPendingTransaction(state) {
      state.pendingTransactions = [];
      state.msg = '';
      state.error = false;
      state.critical = false;
    },
    setContracts(state, contracts) {
      state.contracts = contracts;
    },
    setWeb3Wrapper(state, web3Wrapper) {
      state.web3Wrapper = web3Wrapper;
    },
    setAccount(state, addr) {
      state.account = addr;
    },
    setMessage(state, msg) {
      state.msg = msg.msg || msg;
      state.error = false;
      state.critical = msg.critical;
    },
    setError(state, error) {
      state.msg = error.msg || error;
      state.error = true;
      state.critical = error.critical;
    },
    clearMessage(state) {
      state.msg = '';
      state.error = false;
      state.critical = false;
    }
  },
  actions: {
    async init(ctx) {
      ctx.commit('setMessage', { msg: 'Connecting to metamask...', critical: true });

      const { ethereum } = window;

      if (!ethereum) return ctx.commit('setError', { msg: 'No metamask...', critical: true });

      try {
        const accounts = await ethereum.enable();
        const web3Wrapper = new Web3Wrapper(ethereum);
        const networkId = await web3Wrapper.getNetworkIdAsync();
        // ropsten
        if (networkId !== 3) return ctx.commit('setError', { msg: 'Please switch to ropsten network', critical: true });

        ctx.commit('setAccount', accounts[0]);
        ctx.commit('setWeb3Wrapper', web3Wrapper);
        ctx.commit('setContracts', getWrappers(abi, ethereum));

        ctx.commit('clearMessage');
      } catch (e) {
        console.error(e);
        ctx.commit('setError', { msg: e.message || e.toString(), critical: true });
      }
    },

    async pushTransaction({ commit, state }, { contract, method, args, check }) {
      if (state.pendingTransactions.length > 0 && _.every(state.pendingTransactions, t => t.state !== 0)) commit('clearPendingTransaction');
      if (state.pendingTransactions.length > 0) await _.sleep(500);

      const id = lastId++;
      try {
        commit('updatePendingTransaction', { id, contract: contract.constructor.name, method, msg: 'Pending', state: 0 });
        if (check) await contract[method].callAsync(...args);

        try {
          while (!check && _.some(state.pendingTransactions, t => t.id !== id && t.state === 0)) await _.sleep(200);
          await contract[method].awaitTransactionSuccessAsync(...args, { from: state.account });
          commit('updatePendingTransaction', { id, msg: 'Success', state: 1 });
        } catch (e) {
          await contract[method].callAsync(...args);
          commit('updatePendingTransaction', { id, msg: e.message || e.toString(), state: -1 });
        }
      } catch (e) {
        commit('updatePendingTransaction', { id, msg: e.message || e.toString(), state: -1 });
      }
    }
  }
};
