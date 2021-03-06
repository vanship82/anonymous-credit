pragma solidity ^0.6.0;

// import "@openzeppelin/contracts/math/SafeMath.sol";

import "github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol";

import "./IAddressMining.sol";

contract AddressMining is IAddressMining {

    using SafeMath for uint256;

    bytes32 public constant initial_hash = "";
    uint256 public constant target_difficulty1 = 0xffff * 2**224; // reduced difficulty, 2**208 in bitcoin
    uint256 public constant difficulty_decimals = 3; // smaller decimals to prevent overflow
    uint64 public constant difficulty_adjustment = 2016;
    uint256 public constant target_blocks_difficulty_adjustment = difficulty_adjustment * 40;
    address public constant genesis_addr = 0x443E9d8fD84b01Cd76a51cE6313698ae9E108183;
    uint256 public constant genesis_difficulty = 1000; // 1 after decimals

    struct MinedAddress {
        // Mined address
        address addr;
        // Index of the mined address
        uint64 index;
        // Difficulty of the mined address
        uint256 difficulty;
        // Block height when the address is mined
        uint256 height;
        // Hash of the current mined address
        bytes32 hash;
    }

    // Store list of all mined addresses
    MinedAddress[] public addresses;
    // Mapping of mined address to its index + 1
    mapping(address => uint64) public addressMapPlusOne;

    // Current difficulty, number of leading zeroes in hash
    uint256 public current_difficulty;

    // constructor(address genesis_addr, uint256 genesis_difficulty) public {
    constructor() public {
        bytes32 hash = calculateHash(genesis_addr, 0, initial_hash);
        require(verifyHash(hash, genesis_difficulty));
        addresses.push(MinedAddress(genesis_addr, 0, genesis_difficulty, block.number, hash));
        addressMapPlusOne[genesis_addr] = 1;
        emit AddressMined(genesis_addr, 0);
        current_difficulty = genesis_difficulty;
    }

    // constructor(uint256 genesis_difficulty) public {
    //     current_difficulty = genesis_difficulty;
    // }

    function mine(uint64 index) public {
        require(addresses.length == index);
        require(!isMinedAddress(msg.sender), "no double mined of same address");
        bytes32 previous_hash = initial_hash;
        if (index > 0) {
            previous_hash = addresses[index-1].hash;
        }
        bytes32 hash = calculateHash(msg.sender, index, previous_hash);
        require(verifyHash(hash, current_difficulty));
        addresses.push(MinedAddress(msg.sender, index, current_difficulty, block.number, hash));
        addressMapPlusOne[msg.sender] = index + 1;

        emit AddressMined(msg.sender, index);

        if (index > 0 && index % difficulty_adjustment == 0) {
            // Adjust difficulty
            uint256 actual_blocks = block.number.sub(addresses[index - difficulty_adjustment].height);
            current_difficulty = adjustDifficulty(actual_blocks, current_difficulty);
        }
    }

    function isMinedAddress(address addr) public override view returns(bool) {
        return addressMapPlusOne[addr] > 0;
    }

    function getMinedAddress(address addr) public override view
        returns(uint64 index, uint256 diffiiculty, uint256 height) {
        uint64 id = addressMapPlusOne[addr];
        require(id > 0);
        MinedAddress memory ma = addresses[id-1];
        return (ma.index, ma.difficulty, ma.height);
    }

    function getNextAddressIndex() public override view returns(uint64 index) {
        require(addresses.length <= 2**64-1);
        return uint64(addresses.length);
    }

    function adjustDifficulty(uint256 actual_blocks, uint256 previous_difficulty)
        public
        pure
        returns (uint256 difficulty) {
        uint256 ratio = target_blocks_difficulty_adjustment.mul(10**difficulty_decimals).div(actual_blocks);
        if (ratio > 4 * 10**difficulty_decimals) {
            ratio = 4 * 10**difficulty_decimals;
        } else if (ratio < 10**difficulty_decimals/4) {
            ratio = 10**difficulty_decimals/4;
        }
        return previous_difficulty.mul(ratio).div(10**difficulty_decimals);
    }

    function calculateHash(address addr, uint64 index, bytes32 previous_hash)
        public
        pure
        returns (bytes32 hash) {
        return keccak256(abi.encode(addr, index, previous_hash));
    }

    function verifyHash(bytes32 hash, uint256 difficulty)
        public
        pure
        returns (bool valid) {
        return uint256(hash) <= target_difficulty1.mul(10**difficulty_decimals).div(difficulty);
    }
}
