# UI Ethereum Developer Challenge

## Core Deliverables
* `Token` contract inherits from OpenZeppelin’s ERC20 standard implementation
* `Token` can only be transferred after a particular `_startTime` and before a particular `_endTime`, provided in the constructor
* Unit tests to account for the `_startTime` and `_endTime` constraints
* `Contribution` contract that users can donate ETH to. For their ETH-based contributions, `Contribution` issues tokens from the `Token` contract in return
* `Contribution` contract stores addresses of users that donate as well as the amount of
ETH they’ve donated
* `Contribution` contract has a function that accepts a wallet address, and returns the amount of ETH that a wallet address has contributed to the `Contribution` contract
* Unit tests for the `Contribution` contract
* Use OpenZeppelin’s` SafeMath` library in the `Contribution` contract

## Bonus Deliverables
* Events that emit when functions in `Token` and `Contribution` contracts execute
* Unit tests for the events

## Design Decisions
* **Emergency stop pattern** implemented via inheriting OpenZeppelin's `Pausable` contract. This allows the `owner` (address that deployed the contract) to `pause` and `unpause` certain functionalities. In this case, the `contribution` function in the `Contribution` contract reverts if the contract is paused.
* **Access control** is implemented via inheriting OpenZeppelin's `Ownable` contract. This identifies the deployer address as the `owner` and gives the address access to call `pause`/`unpause` and `withdraw` functions in the `Contribution` contract. `Token` also inherits from `Ownable` to allow the contract deployer to set the address of the `Contribution` contract that is permitted to mint and issue tokens
* Owner must call `setContributionContract` from the `Token` contract before the Contribution contract is "allowed" to mint and issue new tokens. This way, there is a separation of concerns between Token logic and Contribution logic. Should there be a bug in the Contribution contract, the owner can `pause` contributions so no more money comes in and set a new Contribution contract without having to redeploy the Token contract.
* To **prevent integer underflow/overflow**, both `Contribution` and `Token` utilizes the `SafeMath` library to perform arithmatics. `Contribution` uses the library to update the `amountContributed` by a user should they make additional contributions. `Token` uses the library to calculate the number of tokens to issue to a user relative to their contribution amount (this multipler is a hypothetical constant)
* Both `transfer` and `transferFrom` functions of the ERC20 are restricted by `startTime` and `endTime`. Token owners can `approve` tokens outside this window, but `transferFrom` will not work
* Time constraints are only implemented on the `transfer` and `transferFrom` functions. This means that users can still contribute ETH to the Contribution contract and be issued new tokens outside of the `startTime` and `endTime` window because the `contribution` function calls `mint` and not `transfer`

### External tools/libraries used
* Truffle suite for contract migration setup and testing
* Ganache v4.2.0 as a development blockchain
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
* Have a development blockchain running (e.g. Ganache) on port 7545 and run `truffle test`