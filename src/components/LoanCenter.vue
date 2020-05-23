<template>
<div>
  <div class="title">Loan Center</div>
  <div class="hash"><span class="screen-green">Your Credit Line:</span>{{loanState['credit_limit']}} BTC</div>
  <div class="hash"><span class="screen-green">Outstanding Balance:</span>{{balance}} BTC</div>
  <button v-on:click="borrow">Borrow</button>
  <button v-on:click="pay">Pay Out</button>
</div>
</template>

<script>
import { web3, acContract } from '../web3';
import { mapState } from 'vuex';

export default {
  name: 'LoanCenter',
  components: {},
  methods: {
    async reload() {
      this.$store.dispatch('getLoanState');
    },
    async borrow() {
      const accounts = await web3.eth.getAccounts();
      const res = await acContract.methods.borrow().send({from: accounts[0]});
    },
    async pay() {
    }
  },
  mounted() {
    this.reload();
  },
  data() {
    return {
      proposals: []
    };
  },
  computed: {
    ...mapState([
        'balance',
        'loanState'
    ]),
  }, 
}
</script>

<style scoped lang="scss">
.hash {
  margin-top: 14px;
}
</style>
