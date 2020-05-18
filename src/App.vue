<template>
  <div id="app">
    <div class="nav">
      <div class="brand">Anonymous<span class="screen-green">Credit</span></div>
      <ul class="nav-list">
        <li v-bind:class="{ active: $route.name === 'home' }">
          <a href="#/home">
            welcome_
          </a>
        </li>
        <li v-bind:class="{ active: $route.name === 'mining' }">
          <a href="#/mining">
            mining_
          </a>
        </li>
      </ul>
    </div>
    <router-view/>
  </div>
</template>

<script>
import Vue from 'vue';
import moment from 'moment';
// import { web3 } from './web3';

// define filters
Vue.filter('formatDate', function(value) {
  const format = 'MM.DD.YYYY';
  if (value >= 0) {
    return moment.unix(String(value)).format(format);
  }
});

Vue.filter('usd', function (value) {
  return (value/1e18).toFixed(6);
});

Vue.filter('eth', function (value) {
  return (value/1e18).toFixed(8);
});

export default {
  name: 'App',
  components: { },
  mounted () {
  },
  methods: {
  }
}
</script>

<style lang="scss">

html, body {
  background-color: rgb(24, 25, 26);
  margin: 0;
  padding: 0;
  height: 100%;
  vertical-align: middle;
}

.screen-green {
  color:greenyellow;
}

#app {
  font-family: 'Roboto Condensed', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  height: 100%;

  >div:last-child {
    flex: 1 1 auto;
    max-width: 805px;
    color: white;
    padding: 0 16px 16px 0;
    // height: 100%;
    // overflow: scroll;

    >.title {
      height: 48px;
      line-height: 48px;
      margin: 84px 0 24px 0;
      font-size: 16px;
      letter-spacing: 0.05em;

      color: #ECEFF1;
    }
  }
}

.sep {
  height: 0!important;
  border-top: 1px solid rgb(14, 15, 15);
}

select {
  height: 24px;
  background: #263238;
  border-radius: 4px;
  line-height: 20px;
  font-size: 10px;
  letter-spacing: 0.015em;
  text-transform: uppercase;
  font-variant: small-caps;
  color: #607D8B;
  min-width: 80px;
}

button {
  line-height: 30px;
  font-size: 14px;
  text-align: center;
  background: rgb(24, 25, 26);
  border-radius: 6px;
  height: 30px;
  color: #CFD8DC;
  border: 1px solid #CFD8DC;
  min-width: 80px;
}

button:hover {
  color:greenyellow;
  border: 1px solid greenyellow;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.left {
  float: left;
}
.right {
  float: right;
}
.text-right {
  text-align: right;
}

.help-mark {
    width: 20px;
    font-size: 20px;
    display: inline-block;
}

.tip-content {
  color:#78909C;
  line-height: 16px;
  padding: 10px;
  .tip-title {
    font-weight: bold;
    margin: 10px 0;
  }
}

.red {
  color: red;
}
</style>

<style scoped lang="scss">
.nav {
  flex: 0 1 auto;
  margin: 84px 56px;
  width: 300px;
  height: 189px;

  .brand {
    height: 48px;
    line-height: 48px;

    font-family: Eczar;
    font-size: 32px;
    letter-spacing: 0.06em;

    color: #ECEFF1;
  }

  .nav-list {
    list-style: none;
    margin: 21px 0 0 0;
    padding: 0;

    li {
      margin-bottom: 8px;
      height: 32px;
      line-height: 32px;
      font-size: 16px;

      a {
        display: flex;
        color: #ECEFF1;
        text-decoration: none;

        > * {
          align-self: center;
          vertical-align: center;
        }

        .material-icons {
          padding: 8px;
          font-size: 16px;
          color: #ECEFF1;
        }
      }

      &.active {
        a {
          color: yellowgreen;
          // background-color: #263238;
          border-radius: 4px;
          .material-icons {
            color: yellowgreen;
          }
        }
      }
    }
  }
}
</style>
