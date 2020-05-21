pragma solidity ^0.6.0;

// import "@openzeppelin/contracts/math/SafeMath.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

import "./IAddressMining.sol";
import "github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol";
import "github.com/OpenZeppelin/zeppelin-solidity/contracts/access/Ownable.sol";
import "github.com/OpenZeppelin/zeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "github.com/OpenZeppelin/zeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

contract AnonymousCredit is Ownable {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint64 constant decimals = 18;
    // ethereum blocks for 2 weeks
    uint64 constant borrow_blocks = 2016 * 600 / 15;
    // # of borrow times the interest_rate is halved
    uint64 constant halving_times = 8;
    uint256 constant initial_credit_limit = 1 * (uint256(10)**decimals);
    // initial 2-week interest rate is 80%
    uint256 constant initial_interest_rate_2w = 8 * (uint256(10)**(decimals - 1));

    // Credit for a mined address
    struct Credit {
        // Credit limit with decimals
        uint256 credit_limit;
        // 2-week interest rate with decimals
        uint256 interest_rate_2w;
        // # of borrow times
        uint64 borrow_times;
        // block height at last borrow
        uint256 last_borrow_height;
        // whether the last borrow has been payoff
        // if payoff is false after payoff block, no further borrow is allowed
        // even if payoff after payoff block
        bool payoff;
    }

    IAddressMining public addressMining;
    mapping(address => Credit) public creditMap;
    IERC20 public token;
    // 1 credit corresponding to tokenBase
    uint256 public tokenBase;

    constructor(IAddressMining am, IERC20 tok, uint256 base) public {
        addressMining = am;
        token = tok;
        tokenBase = base;
    }

    function withdraw(uint256 amount) public onlyOwner {
        token.safeTransfer(msg.sender, amount);
    }

    function borrow() public {
        require(addressMining.isMinedAddress(msg.sender), "invalid mined address");
        Credit memory c = creditMap[msg.sender];
        if (c.borrow_times == 0) {
            c.credit_limit = initial_credit_limit;
            c.interest_rate_2w = initial_interest_rate_2w;
        } else {
            require(c.credit_limit > 0, "zero credit limit caused by default is not allowed to borrow");
            // payoff
            require(c.payoff, "no payoff, no borrow");
            // after 2 weeks, not within
            require(block.number >= c.last_borrow_height.add(borrow_blocks), "no double borrows");
            c.credit_limit = c.credit_limit.mul(c.interest_rate_2w.add(uint256(10) ** decimals))
                .div(uint256(10) ** decimals);
            if (c.borrow_times % halving_times == 0) {
                // halving interest rate
                c.interest_rate_2w.div(2);
            }
        }
        c.borrow_times++;
        c.payoff = false;
        c.last_borrow_height = block.number;
        uint256 amount = c.credit_limit.mul(tokenBase).div(uint256(10) ** decimals);

        token.safeTransfer(msg.sender, amount);
        creditMap[msg.sender] = c;
    }

    // Need to approve outstandingBalanceOf() to this contract before calling payoff.
    function payoff() public {
        require(addressMining.isMinedAddress(msg.sender), "invalid mined address");
        Credit memory c = creditMap[msg.sender];
        require(c.borrow_times > 0, "invalid borrow times");
        require(!c.payoff, "payoff already");
        require(c.last_borrow_height > 0, "invalid last borrow height");

        uint256 amount = c.credit_limit
            .mul(c.interest_rate_2w.add(uint256(10) ** decimals))
            .div(uint256(10) ** decimals)
            .mul(tokenBase)
            .div(uint256(10) ** decimals);
        token.safeTransferFrom(msg.sender, address(this), amount);

        if (block.number >= c.last_borrow_height.add(borrow_blocks)) {
            // default
            c.credit_limit = 0;
        }
        c.payoff = true;
        creditMap[msg.sender] = c;
    }

    function outstandingBalanceOf(address addr) public view returns(uint256) {
        // TODO: require does not work
        require(addressMining.isMinedAddress(addr), "invalid mined address");
        Credit memory c = creditMap[addr];
        if (c.payoff) {
            return 0; // no outstanding balance when payoff
        }
        return c.credit_limit
            .mul(c.interest_rate_2w.add(uint256(10) ** decimals))
            .div(uint256(10) ** decimals)
            .mul(tokenBase)
            .div(uint256(10) ** decimals);
    }
}
