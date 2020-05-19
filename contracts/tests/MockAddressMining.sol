pragma solidity ^0.6.0;

// import "@openzeppelin/contracts/math/SafeMath.sol";

import "github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol";

import "../AddressMining.sol";

contract MockAddressMining is AbstractAddressMining {

    mapping(address => uint64) public addressMapPlusOne;
    uint64 public index;
    
    constructor() public {
        index = 0;
    }
    
    function mine(address addr) public {
        require(addressMapPlusOne[addr] == 0, "no double mined");
        index++;
        addressMapPlusOne[addr] = index;
    }
    
    function isMinedAddress(address addr) public override view returns(bool) {
        return addressMapPlusOne[addr] > 0;
    }

    function getMinedAddress(address addr) public override view
        returns(uint64 inidex, uint256 diffiiculty, uint256 height) {
        uint64 id = addressMapPlusOne[addr];
        require(id > 0);
        return (id-1, 1000, 100000);
    }
}
