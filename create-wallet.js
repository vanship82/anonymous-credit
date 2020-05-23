import Web3 from 'web3';
import read from 'read';
import Q from 'q';
import fs from 'fs';

var web3 = new Web3('wss://ropsten.infura.io/ws/v3/4afb7fbcd3aa47d887121272bfc6b00a');
var asyncRead = Q.denodeify(read);
var asyncWriteFile = Q.denodeify(fs.writeFile);
var asyncAccess = Q.denodeify(fs.access);

async function main() {
    if (process.argv.length < 3) {
        console.log('Missing wallet file!');
        console.log('Usage: node ' + process.argv[1] + ' [wallet_file]');
        return;
    }
    try {
        await asyncAccess(process.argv[2]);
        let overwriteResult = await asyncRead({prompt: 'File exists, overwrite? (y|N): '});
        if (overwriteResult[0] != 'y') {
            return;
        }
    } catch (e) {
    }
    let w = web3.eth.accounts.wallet.create(1);
    console.log(w[0].address);
    let pwd;
    while (true) {
        let pwdResult = await asyncRead({prompt: 'Enter password: ', silent: true});
        pwd = pwdResult[0];
        let confirmPwdResult = await asyncRead({prompt: 'Confirm password: ', silent: true});
        if (pwd == confirmPwdResult[0]) {
            break;
        }
        console.log('Password does not match!');
    }
    let encryptedWallet = web3.eth.accounts.wallet.encrypt(pwd);
    await asyncWriteFile(process.argv[2], JSON.stringify(encryptedWallet));
    console.log('Successfully saved!');
}

main().then(function() {
    process.exit(0);
});

