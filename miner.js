import Web3 from 'web3';
import read from 'read';
import Q from 'q';
import ethWallet from 'ethereumjs-wallet';
import fs from 'fs';

// configurations
var web3 = new Web3('wss://ropsten.infura.io/ws/v3/4afb7fbcd3aa47d887121272bfc6b00a');
const acContract = new web3.eth.Contract(require('./src/web3/address_mining_abi.json'), '0xaA737aBA880090F3fb5161BEA76f7c22864a2CCe');
const lowestBalance = web3.utils.toBN(web3.utils.toWei('250', 'micro'));
const gasPrice = web3.utils.toWei('1', 'gwei');

var asyncRead = Q.denodeify(read);
var asyncReadFile = Q.denodeify(fs.readFile);
var asyncWriteFile = Q.denodeify(fs.writeFile);

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
    }
    
    let targetDiff1BN = await acContract.methods.target_difficulty1().call();
    let targetDiff1 = web3.utils.toBN(targetDiff1BN);
    let decimalsBN = await acContract.methods.difficulty_decimals().call();
    let decimals = web3.utils.toBN(decimalsBN);
    let nextId = await acContract.methods.getNextAddressIndex().call();
    let lastAddress = await acContract.methods.addresses(nextId-1).call();
    let prevHash = lastAddress.hash;
    let id = nextId;
    let diff = web3.utils.toBN(lastAddress.difficulty);
    console.log('Mine #' + id + ', prev hash: ' + prevHash);
    let decimalsPow = web3.utils.toBN(10);
    decimalsPow = decimalsPow.pow(decimals);
    let target = targetDiff1.mul(decimalsPow).div(diff);
    let targetHex = web3.utils.padLeft(web3.utils.toHex(target), 64);
    console.log('difficulty: ' + (diff.toNumber() / decimalsPow.toNumber()));
    console.log('target: ' + targetHex);

    let iteration = 0;
    const infoCount = 100000;
    while (true) {
        let addressData = ethWallet.generate();
        let address = addressData.getChecksumAddressString();
        let data = web3.eth.abi.encodeParameters(['address', 'uint64', 'bytes32'], [address, id, prevHash]);
        let hash = web3.utils.keccak256(data);
        let hashBN = web3.utils.toBN(hash);
        if ((iteration+1) % infoCount == 0 || hashBN.lte(target)) {
            console.log('Iteration: ' + (iteration+1) + ' address: ' + address);
            console.log('Hash: ' + hash);
            if (hashBN.lte(target)) {
                console.log('Successful mined!');
                web3.eth.accounts.wallet.add(addressData.getPrivateKeyString());
                let encryptedWallet = web3.eth.accounts.wallet.encrypt(pwd);
                await asyncWriteFile(process.argv[2], JSON.stringify(encryptedWallet));
                console.log('Wallet successfully saved!');
                let minedAccount = web3.eth.accounts.privateKeyToAccount(addressData.getPrivateKeyString());
                await mine(baseAccount, minedAccount, id);
                break;
            }
        }

        iteration ++;
    }
    return 0;
}

async function mine(baseAccount, minedAccount, id) {
    let ethBalanceBN = await web3.eth.getBalance(minedAccount.address);
    let ethBalance = web3.utils.toBN(ethBalanceBN);
    if (ethBalance.lt(lowestBalance)) {
        let res = await baseAccount.signTransaction({
            to: minedAccount.address,
            value: lowestBalance,
            gas: '21000',
            gasPrice: gasPrice});
        console.log(res);
        console.log('Send eth to mined address ' + minedAccount.address);
        let receipt = await web3.eth.sendSignedTransaction(res.rawTransaction);
        console.log(receipt);
        if (!receipt.status) {
            console.log('Error sending eth to mined address');
            return;
        }
    }
    let res = await minedAccount.signTransaction({
        to: minedAccount.address,
        to: acContract.options.address,
        data: acContract.methods.mine(id).encodeABI(),
        gas: '150000', // TODO: optimize
        gasPrice: gasPrice});
    console.log(res);
    console.log('Call mine() from mined address ' + minedAccount.address);
    let receipt = await web3.eth.sendSignedTransaction(res.rawTransaction);
    console.log(receipt);
    if (!receipt.status) {
        console.log('Error calling mine() to mined address');
        return;
    }
    console.log('Successfully mine address');
}

main().then(function() {
    process.exit(0);
});

