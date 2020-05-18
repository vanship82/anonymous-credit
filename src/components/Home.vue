<template>
<div class="container">
  <div><img class="vimg" src="~@/assets/v.png"></img></div>
  <div>welcome to anonymous <span class="screen-green">credit</span>, loan without <span class="screen-green">identification</span>.</div>
</div>
</template>

<script>
import { web3, acContracts } from '../web3';

export default {
  name: 'Home',
  components: {},
  methods: {
    async reload() {
      // this.$data.proposals = await listExchanges();
    }
  },
  mounted() {
    this.reload();
  },
  data() {
    return {
      proposals: []
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
.vimg {
  width: 250px;
  margin: 50px;
}
.container {
  text-align: center;
  margin-top: 150px;
}
</style>
