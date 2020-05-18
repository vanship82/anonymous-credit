<template>
<div>
  <div class="title">Mining</div>
  <div class="hash"><span class="screen-green">Last Hash:</span> {{lastHash}}</div>
  <div class="hash"><span class="screen-green">Current Block:</span> {{mineIndex}}</div>
  <div class="hash"><span class="screen-green" v-show="address">Address:</span> {{address}}</div>
  <div class="hash"><span class="screen-green" v-show="address">Private Key:</span> {{key}}</div>
  <button v-on:click="startMining" v-show="mining==false">Start Mining</button>
  <button v-on:click="stopMining" v-show="mining">Stop Mining</button>
</div>
</template>

<script>
import { web3 } from '../web3';
import { mapState } from 'vuex';
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
    startMining() {
      this.$data.mining = true;
      this.mine();
    },
    stopMining() {
      this.$data.mining = false;
    },
    mine() {
      const difficulty = web3.utils.toBN(this.$store.state.mineDifficulty);
      for(let index=0; index < 1000; index++) {
        let addressData = ethWallet.generate();
        this.$data.counter = this.$data.counter + 1;
        let _hash = bufferToHex(this.calculateHash(addressData.getAddressString(), this.$store.state.mineIndex, this.$store.state.lastHash));
        if (web3.utils.toBN(_hash).lt(difficulty)) {
          this.$data.key = addressData.getPrivateKeyString();
          this.$data.address = addressData.getAddressString();
          this.$data.hash = _hash;
          this.$data.mining = false;
          return;
        }
      }
      if (this.$data.mining && this.$data.counter < 10000) {
        console.log('Tried:', this.$data.counter);
        this.$forceUpdate();
        this.mine();
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
      counter: 0,
      mining: false,
    };
  },
  computed: {
    ...mapState([
        'lastHash',
        'mineIndex'
    ]),
  },   
}
</script>

<style scoped lang="scss">
.hash {
  margin-top: 14px;
}
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
