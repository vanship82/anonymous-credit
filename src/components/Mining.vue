<template>
<div>
  <div class="title">Mining</div>
  <div class="hash"><span class="screen-green">Last Hash:</span> {{lastHash}}</div>
  <div class="hash"><span class="screen-green">Current Difficulty:</span> {{mineDifficulty}}</div>
  <div class="hash"><span class="screen-green">Current Block:</span> {{mineIndex}}</div>
  <div class="hash"><span class="screen-green" v-show="address">Address:</span> {{address}}</div>
  <div class="hash"><span class="screen-green" v-show="address">Private Key:</span> {{key}}</div>
  <button v-on:click="startMining" v-show="mining==false">Start Mining</button>
  <button v-on:click="stopMining" v-show="mining">Stop Mining</button>
  <button v-on:click="transferGas">Transfer Gas</button>
  <button v-on:click="addressMine">Address Mine</button>
  <button v-on:click="verifyHash">VerifyHash</button>
</div>
</template>

<script>
import { web3, acContract } from '../web3';
import { mapState } from 'vuex';
import ethWallet from 'ethereumjs-wallet';
import { keccak256, bufferToHex, bufferToInt } from 'ethereumjs-util';
import BN from 'bn.js';

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
    async transferGas() {
      const accounts = await web3.eth.getAccounts();
      const message = {
        from: accounts[0],
        to: this.$data.address,
        value: web3.utils.toWei('0.2', 'ether')
      };
      console.log(message);
      const res = await web3.eth.sendTransaction(message);
      console.log(res);
    },
    async verifyHash() {
      
    },
    async addressMine() {
      const res = await acContract.methods.mine(1).send({from: this.$data.address});
      console.log(res);
    },
    async mine() {
      const difficulty = new BN(this.$store.state.mineDifficulty,16);
      for(let index=0; index < 1000000; index++) {
        let addressData = ethWallet.generate();
        this.$data.counter = this.$data.counter + 1;
        let _hash = bufferToHex(this.calculateHash(addressData.getAddressString(), this.$store.state.mineIndex, web3.utils.hexToBytes(this.$store.state.lastHash)));
        if (index % 1000 == 0) {
          console.log(index);
        }
        _hash = new BN(_hash, 16);
        if (_hash.lt(difficulty)) {
          console.log(_hash.toString(16,64));
          console.log(difficulty.toString(16,64));
          this.$data.key = addressData.getPrivateKeyString();
          this.$data.address = addressData.getAddressString();
          this.$data.hash = _hash;
          this.$data.mining = false;
          return;
        }
      };
    },
    calculateHash(addr, index, previous_hash) {
      return keccak256(web3.eth.abi.encodeParameters(['address', 'uint64', 'bytes32'], [addr, index, previous_hash]));
    }
  },
  mounted: async function () {
    this.$store.dispatch('getMineState');
  },
  data() {
    return {
      address: '0x6fc3241d26fd6a915fe5f0d61d0ad6bac2c25be6',
      key: '0x41b86e405955cb1e97f57233e9f2efa8f05e4de5b2571c2f5d96c7c493cb1df7',
      hash: '000000000000000000000000000000000000000000000000000000000000000800001bcbbab3be0276fc17704e085ffae799e45a6d63f75a6c870f9b1daed4b0',
      counter: 0,
      mining: false,
    };
  },
  computed: {
    ...mapState([
        'lastHash',
        'mineIndex',
        'mineDifficulty'
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
