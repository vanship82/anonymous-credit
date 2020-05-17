<template>
<div>
  <div class="title">Mining</div>
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
</style>
