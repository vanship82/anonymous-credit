<template>
<div>
  <div class="title">Mining</div>
  <div class="address">Address: {{address}}</div>
  <div class="key">Private Key: {{key}}</div>
  <button v-on:click="mining">Start</button>
</div>
</template>

<script>
import { web3 } from '../web3';
import ethWallet from 'ethereumjs-wallet';
import { keccak256, bufferToHex, bufferToInt } from 'ethereumjs-util';
import bigNumber from 'big-number';

export default {
  name: 'Mining',
  components: {},
  methods: {
    async reload() {
      // this.$data.proposals = await listExchanges();
    },
    mining() {
      const difficulty = web3.utils.toBN(this.$store.state.mineDifficulty);
      for(let index=0; index < 100000; index++) {
        let addressData = ethWallet.generate();
        this.$data.counter = this.$data.counter + 1;
        let _hash = bufferToHex(this.calculateHash(addressData.getAddressString(), this.$store.state.mineIndex, this.$store.state.lastHash));
        if (this.$data.counter % 100 == 0) {
          console.log('Address Tried:', this.$data.counter);
        }
        if (web3.utils.toBN(_hash).lt(difficulty)) {
          this.$data.key = addressData.getPrivateKeyString();
          this.$data.address = addressData.getAddressString();
          this.$data.hash = _hash;
          return;
        }
      }
    },
    calculateHash(addr, index, previous_hash) {
      return keccak256(web3.eth.abi.encodeParameters(['address', 'uint64', 'bytes32'], [addr, index, previous_hash]));
    }
  },
  mounted() {
    this.reload();
  },
  data() {
    return {
      address: '',
      key: '',
      hash: '',
      counter: 0
    };
  }
}
</script>

<style scoped lang="scss">
.create {
  position: fixed;
  text-align: center;
  padding: 0 20px;
  line-height: 32px;
  right: 32px;
  bottom: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: #263238;
  font-size: 14px;
}
</style>
