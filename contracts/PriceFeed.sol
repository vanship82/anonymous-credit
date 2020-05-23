pragma solidity ^0.6.0;

import "https://github.com/smartcontractkit/chainlink/evm-contracts/src/v0.6/ChainlinkClient.sol";
import "https://github.com/smartcontractkit/chainlink/evm-contracts/src/v0.6/vendor/Ownable.sol";

import "./IPriceFeed.sol";

contract PriceFeed is IPriceFeed, ChainlinkClient, Ownable {
    uint256 constant private ORACLE_PAYMENT = 1 * LINK;

    struct Price {
        uint256 price;
        uint256 height;
    }
    mapping(bytes32 => Price) public priceMap;
    mapping(bytes32 => string) public reqPathMap;
    mapping(bytes32 => string) public reqIdMap;

    event RequestPriceFulfilled(
        bytes32 indexed requestId,
        uint256 indexed price,
        string symbol
    );

    constructor() public Ownable() {
        setPublicChainlinkToken();
    }

    function getPrice(string memory _sym) public override view returns(uint256 price, uint256 height) {
        Price memory p = priceMap[stringToBytes32(_sym)];
        return (p.price, p.height);
    }

    function setReqPath(string memory _sym, string memory _path)
        public
        onlyOwner {
        reqPathMap[stringToBytes32(_sym)] = _path;
    }

    function requestPrice(address _oracle, string memory _jobId, string memory _sym)
        public
        onlyOwner {
        Chainlink.Request memory req = buildChainlinkRequest(
            stringToBytes32(_jobId),
            address(this),
            this.fulfillPrice.selector);
        req.add("get", reqPathMap[stringToBytes32(_sym)]);
        req.add("path", "USD");
        req.addInt("times", 100);
        bytes32 reqId = sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
        reqIdMap[reqId] = _sym;
    }

    function fulfillPrice(bytes32 _requestId, uint256 _price)
        public
        recordChainlinkFulfillment(_requestId) {
        string memory sym = reqIdMap[_requestId];
        bytes32 symBytes = stringToBytes32(sym);
        emit RequestPriceFulfilled(_requestId, _price, sym);
        priceMap[symBytes] = Price(_price, block.number);
    }

    function getChainlinkToken() public view returns (address) {
        return chainlinkTokenAddress();
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
    }

    function cancelRequest(
        bytes32 _requestId,
        uint256 _payment,
        bytes4 _callbackFunctionId,
        uint256 _expiration)
        public
        onlyOwner {
        cancelChainlinkRequest(_requestId, _payment, _callbackFunctionId, _expiration);
    }

    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly { // solhint-disable-line no-inline-assembly
            result := mload(add(source, 32))
        }
    }
}