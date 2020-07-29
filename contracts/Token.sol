// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ERC20 Token contract with custom startTime and endTime requirements for token transfers
/// @author Nichanan Kesonpat (nich@nichanank.com)

contract Token is ERC20, Ownable {

  using SafeMath for uint;

  /// @dev hypothetical number of tokens to issue relative to donated amount
  uint TOKENS_PER_ETH_DONATED = 100;
  
  /// @notice startTime and endTime constraints within which tokens can be transferred. In other words, token transfers cannot occur before the startTime or after the endTime
  uint public startTime;
  uint public endTime;

  /// @notice address of the contract that is allowed to issue new Tokens in response to a user contribution
  /// @dev owner must call `setContributionContract` in order to permit the Contribution contract to mint and issue tokens
  address public contributionContract;

  /// @dev emits when tokens are minted and issued to a user
  event TokensIssued(uint indexed amount, address indexed recipient);

  /// @dev allows function to execute only if it was called by the Contribution contract
  modifier onlyContributionContract {
    require(_msgSender() == contributionContract, "function can only be called by the contribution contract");
    _;
  }

  /// @dev ensure that a function only executes if it was called within the startTime and endTime
  modifier onlyWithinStartAndEndTime {
    require(block.timestamp > startTime, "block.timestamp is before startTime");
    require(block.timestamp < endTime, "block.timestamp is after endTime");
    _;
  }
  
  constructor (uint _startTime, uint _endTime) public ERC20("Token", "TKN") {
    // set startTime and endTime to what the owner specified
    startTime = _startTime;
    endTime = _endTime;
  }

  /// @dev allows the owner to set the contribution contract address allowed to issue tokens. Owner must call this to "approve" the Contribution contract before Tokens can be minted in response to a donation.
  /// @param addr of the Contribution contract that is permitted to call `issueTokens`
  function setContributionContract(address addr) external onlyOwner {
    contributionContract = addr;
  }

  /// @dev issues tokens to a contributer, can only be called by the contribution contract
  /// @param recipient of tokens (contributor)
  /// @param amountDonated in ETH. This determines how many tokens are to be issued to the contributor
  function issueTokens(address recipient, uint amountDonated) public onlyContributionContract {
    uint tokensToMint = amountDonated.mul(TOKENS_PER_ETH_DONATED);
    _mint(recipient, tokensToMint);
    emit TokensIssued(tokensToMint, recipient);
  }

  /// @dev overrides ERC20 transfer function so that tokens can only be transferred between the startTime and endTime
  /// @param recipient of the tokens
  /// @param amount to transfer
  /// @return true if the transfer is successful
  function transfer(address recipient, uint256 amount) public override onlyWithinStartAndEndTime returns (bool) {
    super.transfer(recipient, amount);
  }

  /// @dev overrides ERC20 transferFrom function so that tokens can only be transferred between the startTime and endTime
  /// @param sender address that the tokens 'belongs' to
  /// @param recipient of the tokens
  /// @param amount to transfer
  /// @return true if the transfer is successful
  function transferFrom(address sender, address recipient, uint256 amount) public override onlyWithinStartAndEndTime returns (bool) {
    super.transferFrom(sender, recipient, amount);
  }
 
}