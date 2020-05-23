#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

docker run -it -p 30303:30303 -p 8545:8545 \
    -v $DIR/geth-data:/root/.ethereum \
    ethereum/client-go:stable \
    --ropsten \
    --ipcdisable \
    --rpc --rpcaddr "0.0.0.0" \
    $@
