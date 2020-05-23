pragma solidity ^0.6.0;

interface IPriceFeed {
    function getPrice(string calldata sym) external view
        returns(uint256 price, uint256 height);
}
