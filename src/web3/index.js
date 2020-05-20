import Web3 from 'web3';

if (typeof web3 !== 'undefined') {
    console.log('Metamask linked');
    web3 = new Web3(web3.currentProvider);
} else {
    console.log('No currentProvider for Web3js');
    web3 = new Web3();
}

if (window.ethereum) {
    // 请求用户授权
    window.ethereum.enable(function(){
        web3.eth.getAccounts((error, accounts) => {
            web3.eth.defaultAccount = accounts[0];
            console.log(accounts)
        })
    })
}

const acContract = new web3.eth.Contract(require('./address_mining_abi.json'), '0xEd8C0cBDD0260162d04167A29C8f7a21D4E6443f');
export { web3, acContract };
