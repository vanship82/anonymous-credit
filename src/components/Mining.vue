<template>
<div>
  <div class="title">Mining</div>
  <div class="hash"><span class="screen-green">Last Hash:</span> {{lastHash}}</div>
  <div class="hash"><span class="screen-green">Current Difficulty:</span> {{mineDifficulty}}</div>
  <div class="hash"><span class="screen-green">Current Block:</span> {{mineIndex}}</div>
  <div class="hash"><span class="screen-green" v-show="address">Address:</span> {{address}}</div>
  <div class="hash"><span class="screen-green" v-show="address">Private Key:</span> {{key}}</div>
  <div class="instruction">
    Instruction:<br/>
    1. Click "Start Mining" and check status from console, wait for valid address.<br/>
    2. Click "Transfer Gas" after a valid address mined.<br/>
    3. Import the private key into metamask and and select the new address as current address.<br/>
    4. Click "Address Mine" and register the new valid address.
  </div>
  <button v-on:click="startMining">Start Mining</button>
  <button v-on:click="transferGas">Transfer Gas</button>
  <button v-on:click="addressMine">Address Mine</button>
</div>
</template>

<script>
import { web3, amContract } from '../web3';
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
      this.$data.steps = 1;
      this.mine();
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
    async addressMine() {
      const accounts = await web3.eth.getAccounts();
      const res = await amContract.methods.mine(this.$store.state.mineIndex).send({from: accounts[0]});
      console.log(res);
    },
    async mine() {
      const difficulty = new BN(this.$store.state.mineDifficulty,16);
      for(let index=0; index < 1000000; index++) {
        let addressData = ethWallet.generate();
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
      address: '',
      key: '',
      hash: ''
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
.instruction {
  margin: 20px;
  font-size: 14px;
}
</style>
