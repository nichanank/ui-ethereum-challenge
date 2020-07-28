# UI Ethereum Developer Challenge

## Core Deliverables
* Develop a token contract that inherits from OpenZeppelin’s ERC20 contract and extends its functionality
so that tokens can only be transferred after a particular `_startTime` and before a particular `_endTime`
that are provided in the constructor.
* Develop corresponding unit tests to account for the `_startTime` and `_endTime` constraints.
* Implement a `Contribution` contract that users can donate ETH to. In return for their ETH-based
contributions, your `Contribution` contract should issue them tokens from your token contract in return.
* Your `Contribution` contract should store the addresses of users that donate as well as the amount of
ETH they’ve donated.
* Develop a function in your `Contribution` contract that will accept a wallet address and return the amount
of ETH that a wallet address has contributed to the `Contribution` contract.
* Develop unit tests for the `Contribution` contract.
* Use OpenZeppelin’s` SafeMath` library in the `Contribution` contract

## Bonus Deliverables
* Develop events that emit when functions in your token and `Contribution` contracts execute.
* Develop corresponding unit tests for the events.

## Design Decisions
* **Emergency stop pattern** implemented via inheriting OpenZeppelin's `Pausable` contract. This allows the `owner` (address that deployed the contract) to `pause` and `unpause` certain functionalities. In this case, the `contribution` function in the `Contribution` contract reverts if the contract is paused.
* **Access control** is implemented via inheriting OpenZeppelin's `Ownable` contract. This identifies the deployer address as the `owner` and gives the address access to call `pause`/`unpause` and `withdraw` functions in the `Contribution` contract
* Owner must call `setContributionContract` from the `Token` contract before the Contribution contract is "allowed" to mint and issue new tokens. This way, there is a separation of concerns between Token logic and Contribution logic. Should there be a bug in the Contribution contract, the owner can `pause` contributions so no more money comes in and set a new Contribution contract without having to redeploy the Token contract.

### External docs/libraries used
* `@openzeppelin/test-helpers` was used along with truffle for testing utils
* `@openzeppelin/contracts` used for the `ERC20` implementation, `SafeMath`, `Pausable`, and `Ownable` contracts

## Development

### Environment
* Truffle v5.1.9 (core: 5.1.9)
* Solidity - ^0.6.0 (solc-js)
* Node v11.1.0
* Web3.js v1.2.1

### Installation
1. Clone the repository using `git clone https://github.com/nichanank/ui-ethereum-challenge.git`
2. Navigate to the project repo `cd ui-ethereum-challenge`
3. Install dependencies `npm i`

### Testing
Have a development blockchain running (e.g. Ganache) on port 7545 and run `truffle test`