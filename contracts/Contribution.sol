// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./Token.sol";

/// @title Contribution contract - allows users to donate ETH and receive Tokens in return
/// @dev Contract implements the emergency stop pattern by inheriting Pausable, allowing the deployer to pause the contribution (and thus token issuance) functionalities

contract Contribution is Pausable, Ownable {
    
    using SafeMath for uint;

    Token tokenContract;

    /// @dev maps addresses to amount donated
    mapping (address => uint) private _contributions;

    /// @dev emits when a user makes a donation
    event ContributionMade(address indexed contributor, uint indexed amount);
    /// @dev emits when contract owner withdraws funds
    event FundWithdrawal(uint indexed amount);

    constructor (Token _tokenContract) public {
      tokenContract = _tokenContract;
    }

    /// @dev accepts ETH as a contribution, stores the contribution amount by the sender, and issues the sender Tokens
    function contribute() public payable whenNotPaused {
      require(msg.value > 0, "Insufficient contribution: Amount should be more than 0");
      _contributions[_msgSender()].add(msg.value);

      // issue tokens
      tokenContract.issueTokens(_msgSender(), msg.value);

      emit ContributionMade(_msgSender(), msg.value);
    }

    /// @dev accepts a wallet address and return the amount of ETH that a wallet address has contributed
    /// @param addr to check amount contributed
    /// @return amount contributed
    function amountDonated(address addr) public view returns (uint) {
      return _contributions[addr];
    }

    /// @dev returns the contact balance
    function getBalance() public view returns (uint) {
      return address(this).balance;
    }

    /// @dev allows owner of contract to withdraw a stated amount from contract
    /// @param _amount to withdraw
    function withdraw(uint _amount) external onlyOwner {
        require(_amount > 0 && address(this).balance >= _amount, "Invalid amount given: Amount should be between 0 and the total balance of this contract");
        _msgSender().transfer(_amount);
        emit FundWithdrawal(_amount);
    }

    /// @dev allows owner of contract to withdraw all funds from the contract
    function withdrawAll() external onlyOwner {
        require(address(this).balance >= 0, "Nothing to withdraw: Contract balance is 0");
        uint totalBalance = address(this).balance;
        _msgSender().transfer(totalBalance);
        emit FundWithdrawal(totalBalance);
    }

}