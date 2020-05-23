pragma solidity ^0.6.0;

// import "@openzeppelin/contracts/math/SafeMath.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol";
import "github.com/OpenZeppelin/zeppelin-solidity/contracts/token/ERC20/ERC20.sol";

import "../AnonymousCredit.sol";

contract TestCBTC is ERC20 {

    constructor() ERC20("cross-chain BTC", "cBTC") public {
        _setupDecimals(8);
        _mint(msg.sender, 21 * (10**6) * (10**8));
    }
}

contract MockPriceFeed is IPriceFeed {

    function getPrice(string memory) public override view
        returns(uint256 price, uint256 height) {
        return (9000*100, block.number);
    }
}

contract MockAddressMining is IAddressMining {

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

    function getNextAddressIndex() public override view returns(uint64 _index) {
        return index + 1;
    }
}

contract MockBorrower {

    AnonymousCredit ac;
    ERC20 token;

    constructor(AnonymousCredit _ac, ERC20 _token) public {
        ac = _ac;
        token = _token;
    }

    function borrow() public {
        ac.borrow();
    }

    function approve(address addr, uint256 amount) public {
        token.approve(addr, amount);
    }

    function payoff() public {
        ac.payoff();
    }
}

contract TestAnonymousCredit {

    event DebugLog(string name, uint256 balance);

    function testAnonymousCredit() public {
        ERC20 cbtc = new TestCBTC();
        IPriceFeed pf = new MockPriceFeed();
        MockAddressMining am = new MockAddressMining();
        AnonymousCredit ac = new AnonymousCredit(am, cbtc, pf, 8);
        cbtc.transfer(address(ac), 1000 * (10**8));
        emit DebugLog("initial deposit main", cbtc.balanceOf(address(this)));
        emit DebugLog("initial deposit ac", cbtc.balanceOf(address(ac)));

        MockBorrower b1 = new MockBorrower(ac, cbtc);
        MockBorrower b2 = new MockBorrower(ac, cbtc);

        am.mine(address(b1));
        b1.borrow();
        emit DebugLog("after borrow b1", cbtc.balanceOf(address(b1)));
        emit DebugLog("after borrow ac", cbtc.balanceOf(address(ac)));
        emit DebugLog("after borrow b1 outstanding balance", ac.outstandingBalanceOf(address(b1)));

        am.mine(address(b2));
        b2.borrow();
        emit DebugLog("after borrow b2", cbtc.balanceOf(address(b2)));
        emit DebugLog("after borrow ac", cbtc.balanceOf(address(ac)));
        emit DebugLog("after borrow b2 outstanding balance", ac.outstandingBalanceOf(address(b2)));

        cbtc.transfer(address(b1), 8889); // 80% 2w interest rate
        b1.approve(address(ac), 20000);
        b1.payoff();
    }
}
