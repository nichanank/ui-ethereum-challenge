pragma solidity ^0.5.8;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import "@openzeppelin/contracts/ownership/Ownable.sol";

/// @title Token contract with additional _startTime and _stopTime params

contract Token is ERC20, Ownable {

  using SafeMath for uint;

  uint TOKENS_PER_ETH_DONATED = 100;
  
  uint public startTime;
  uint public stopTime;

  address public contributionContract;

  modifier onlyContributionContract {
    require(msg.sender == contributionContract, "function can only be called by the contribution contract");
    _;
  }

  event TokensIssued(uint indexed amount, address indexed recipient);
  
  constructor (uint _startTime, uint _stopTime) public ERC20() {
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
    require(startTime >= block.timestamp, "start time before block.timestamp");
    require(stopTime <= block.timestamp, "stop time after block.timestamp");
    uint tokensToMint = amountDonated.mul(TOKENS_PER_ETH_DONATED);
    _mint(recipient, tokensToMint);
    emit TokensIssued(tokensToMint, recipient);

  }
 
}