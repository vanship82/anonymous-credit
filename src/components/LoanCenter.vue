<template>
<div>
    <div class="title">Loan Center</div>
    <section v-if="isValidAddress">
      <div class="hash"><span class="screen-green">Current CBTC Balance: </span>{{cbtcBalance | btc}} cBTC</div>
      <div class="hash"><span class="screen-green">Your Credit Line: </span>{{loanState['credit_limit'] | usd}} USD</div>
      <div class="hash"><span class="screen-green">Outstanding Balance: </span>{{balance | btc}} cBTC</div>
      <div class="instruction">
        Instruction:<br/>
        1. Click "Borrow" to get a loan of same amount of your credit limit in form of cBTC.<br/>
        2. You could "Payoff" your debit anytime in 2 weeks.<br/>
        3. You can only borrow once in every 2 weeks peroid.<br/>
        4. Your credit line will increase and interest rate will decrease each time you payoff your debit.
      </div>
      <button v-on:click="borrow">Borrow</button>
      <button v-on:click="payoff">Payoff</button>
    </section>
    <section v-else>
      <div class="instruction">
        Your current address is not a valid mined address, please mine first.
      </div>
    </section>
</div>
</template>

<script>
import { web3, acContract, cbtcContract } from '../web3c';
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
    async payoff() {
      console.log(cbtcContract,acContract)
      const batch = new web3.BatchRequest();
      const accounts = await web3.eth.getAccounts();
      batch.add(cbtcContract.methods.approve(acContract._address, this.$store.state.balance).send.request({from: accounts[0]}));
      batch.add(acContract.methods.payoff().send.request({from: accounts[0]}));
      batch.execute();
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
        'cbtcBalance',
        'loanState',
        'isValidAddress'
    ]),
  }, 
}
</script>

<style scoped lang="scss">
.hash {
  margin-top: 14px;
}
.instruction {
  margin: 20px;
  font-size: 14px;
}
</style>
