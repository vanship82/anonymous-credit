import Web3 from 'web3';

let web3;

if (typeof window.web3 !== 'undefined') {
    console.log('Metamask linked');
    web3 = new Web3(window.web3.currentProvider);
} else {
    console.log('No currentProvider for Web3js');
    web3 = new Web3();
}

if (window.ethereum) {
    // 请求用户授权
    window.ethereum.enable(function(){
        web3.eth.getAccounts((error, accounts) => {
            web3.eth.defaultAccount = accounts[0];
        })
    })
}
const acContract = new web3.eth.Contract(require('./anonymous_credit_abi.json'), '0x98565C9D33e609412dD275d68f6Bd02A4664BFDd');
const amContract = new web3.eth.Contract(require('./address_mining_abi.json'), '0xaA737aBA880090F3fb5161BEA76f7c22864a2CCe');
const cbtcContract = new web3.eth.Contract(require('./ierc20_abi.json'), '0xa3619656EDDD61cf7a06b7a5eA37Da72D45fE224');
export { web3, acContract, amContract, cbtcContract };
