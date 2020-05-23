# anonymous-credit

> an ethereum based pay-day loan system

## Local address miner

```bash
# wallet.json should be already in the repo
node -r esm miner.js wallet.json
```

### Create or reset wallet for local miner

```bash
# prompt whether to overwrite existing wallet.json
node -r esm create-wallet.js wallet.json
```
The first output address is used as base address, so you need to deposit some ether to the address before starting mining.


## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
