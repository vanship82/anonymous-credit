import Web3 from 'web3';
if (typeof web3 !== 'undefined') {
    console.log('Metamask linked');
    web3 = new Web3(web3.currentProvider);
} else {
    console.log('No currentProvider for Web3js');
    web3 = new Web3();
}

const acContract = new web3.eth.Contract(require('./address_mining_abi.json'), '0xf51a5e777dc6fd930fefdcaa20bf067d72d6af4f');
export { web3, acContract };
