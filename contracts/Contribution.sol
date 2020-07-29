// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./Token.sol";

/// @title Contribution contract that allows users to donate ETH and receive Tokens in return
/// @author Nichanan Kesonpat (nich@nichanank.com)
/// @dev Contract implements the emergency stop pattern by inheriting Pausable, allowing the deployer to pause the contribution (and thus token issuance) functionality. Contract allows users to contribute ETH more than once, issuing an amount of Tokens proportional to the amount donated each time.

contract Contribution is Pausable, Ownable {
    
    using SafeMath for uint;

    /// @notice ERC20 tokens that are issued to a user when they make a donation
    Token public tokenContract;

    /// @dev maps addresses to amount donated
    mapping (address => uint) private _contributions;

    /// @dev emits when a user makes a donation
    event ContributionMade(address indexed contributor, uint indexed amount);
    /// @dev emits when contract owner withdraws funds
    event FundWithdrawal(uint indexed amount);

    constructor (Token _tokenContract) public {
      tokenContract = _tokenContract;
    }

    /// @notice users can call this function to make ETH donations and receive Tokens in return
    /// @dev accepts ETH as a contribution, updates total contribution amount by the sender, and issues Tokens to the sender
    function contribute() public payable whenNotPaused {
      require(msg.value > 0, "Insufficient contribution: Amount should be more than 0");

      // add latest donation to total contributions by user
      uint currentTotalContributed = _contributions[_msgSender()];
      _contributions[_msgSender()] = currentTotalContributed.add(msg.value);

      // issue tokens for latest donation
      tokenContract.issueTokens(_msgSender(), msg.value);

      emit ContributionMade(_msgSender(), msg.value);
    }

    /// @notice check the total contribution amount by a given address
    /// @dev accepts a wallet address and return amount that a wallet address has contributed
    /// @param addr to check total amount contributed
    /// @return total amount contributed by specified address
    function amountContributed(address addr) public view returns (uint) {
      return _contributions[addr];
    }

    /// @notice returns the contact balance
    function getBalance() public view returns (uint) {
      return address(this).balance;
    }

    /// @dev allows owner to pause the contract in case a bug is discovered. When the contract is paused, calls to make contributions will be rejected
    function pause() external onlyOwner {
      _pause();
    }

    /// @dev allows owner to unpause the contract. If owner decides to pause the contract, they must unpause it to start accepting contributions again
    function unpause() external onlyOwner {
      _unpause();
    }

    /// @notice allows owner of contract to withdraw a stated amount from contract
    /// @dev reverts if amount is 0 or if the stated withdrawal amount is higher than the contract balance
    /// @param _amount to withdraw
    function withdraw(uint _amount) external onlyOwner {
        require(_amount > 0 && address(this).balance >= _amount, "Invalid amount given: Amount should be between 0 and the total balance of this contract");
        _msgSender().transfer(_amount);
        emit FundWithdrawal(_amount);
    }

    /// @notice allows owner of contract to withdraw all funds from the contract
    /// @dev reverts if contract balance is 0
    function withdrawAll() external onlyOwner {
        require(address(this).balance >= 0, "Nothing to withdraw: Contract balance is 0");
        uint totalBalance = address(this).balance;
        _msgSender().transfer(totalBalance);
        emit FundWithdrawal(totalBalance);
    }

}