pragma solidity ^0.6.0;

interface IAddressMining {

    event AddressMined(address addr, uint64 index);

    function isMinedAddress(address addr) external view returns(bool);

    function getMinedAddress(address addr) external view
        returns(uint64 index, uint256 diffiiculty, uint256 height);

    function getNextAddressIndex() external view returns(uint64 index);
}
