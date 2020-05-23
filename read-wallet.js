import Web3 from 'web3';
import read from 'read';
import Q from 'q';
import ethWallet from 'ethereumjs-wallet';
import fs from 'fs';

// configurations
var web3 = new Web3('wss://ropsten.infura.io/ws/v3/4afb7fbcd3aa47d887121272bfc6b00a');

var asyncRead = Q.denodeify(read);
var asyncReadFile = Q.denodeify(fs.readFile);

async function main() {
    let walletFile = process.argv[2];
    let wallet;
    let pwd;
    try {
        let walletJSON = await asyncReadFile(walletFile);
        let walletEncryptedData = JSON.parse(walletJSON);
        let pwdResult = await asyncRead({prompt: 'Enter password to decrypt wallet: ', silent: true});
        pwd = pwdResult[0];
        wallet = web3.eth.accounts.wallet.decrypt(walletEncryptedData, pwd); 
    } catch(e) {
        console.log('Error reading wallet');
        return 0;
    }
    let baseAccount = wallet[0];
    console.log('all accounts');
    for (var i = 0; i < wallet.length; i++) {
        console.log('account #' + i + ': ' + wallet[i].address);
        if (wallet[i].address == process.argv[3]) {
            console.log(wallet[i]);
        }
    }
     return 0;
}

main().then(function() {
    process.exit(0);
});

