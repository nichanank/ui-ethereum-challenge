// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Token contract with additional _startTime and _stopTime params

contract Token is ERC20, Ownable {

  using SafeMath for uint;

  uint TOKENS_PER_ETH_DONATED = 100;
  
  uint public startTime;
  uint public stopTime;

  address public contributionContract;

  /// @dev allows function to execute only if it was called by the contribution contract
  modifier onlyContributionContract {
    require(_msgSender() == contributionContract, "function can only be called by the contribution contract");
    _;
  }

  /// @dev allows function to execute only if it was called within the startTime and stopTime
  modifier onlyWithinStartAndStopTime {
    require(block.timestamp > startTime, "block.timestamp is before startTime");
    require(block.timestamp < stopTime, "block.timestamp is after stopTime");
    _;
  }

  event TokensIssued(uint indexed amount, address indexed recipient);
  
  constructor (uint _startTime, uint _stopTime) public ERC20("Token", "TKN") {
    // set startTime and stopTime to what the deployer specified
    startTime = _startTime;
    stopTime = _stopTime;
  }

  /// @dev allows the owner to set the contribution contract address allowed to issue tokens
  function setContributionContract(address addr) external onlyOwner {
    contributionContract = addr;
  }

  /// @dev issues tokens to a contributer, can only be called by the contribution contract
  /// @param recipient of tokens (contributor)
  /// @param amountDonated donated in ETH. This determines how many tokens issued to the contributor
  function issueTokens(address recipient, uint amountDonated) public onlyContributionContract {
    uint tokensToMint = amountDonated.mul(TOKENS_PER_ETH_DONATED);
    _mint(recipient, tokensToMint);
    emit TokensIssued(tokensToMint, recipient);
  }

  /// @dev overrides ERC20 transfer function so that tokens can only be transferred between the _startTime and _stopTime
  function transfer(address recipient, uint256 amount) public override onlyWithinStartAndStopTime returns (bool) {
    _transfer(_msgSender(), recipient, amount);
    return true;
  }

  /// @dev overrides ERC20 transferFrom function so that tokens can only be transferred between the _startTime and _stopTime
  function transferFrom(address sender, address recipient, uint256 amount) public override onlyWithinStartAndStopTime returns (bool) {
    _transfer(sender, recipient, amount);
    decreaseAllowance(_msgSender(), amount);
    // _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
    return true;
  }
 
}