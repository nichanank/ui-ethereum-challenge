const { BN, ether, constants, expectEvent, shouldFail, time } = require('@openzeppelin/test-helpers')

const Token = artifacts.require("./contracts/Token.sol")
const Contribution = artifacts.require("./contracts/Contribution.sol")

contract('Contribution', async (accounts) => {
  const owner = accounts[0]
  const user1 = accounts[1]
  const user2 = accounts[2]
  let catchRevert = require("./exceptions.js").catchRevert

  const testStartTime = 111111
  const testStopTime = 555555
  
  beforeEach('set up Contribution contract for each test', async () => {
    tokenInstance = await Token.new(testStartTime, testStopTime)
    contributionInstance = await Contribution.new(tokenInstance.address)
    await tokenInstance.setContributionContract(contributionInstance.address, {from: owner})
  })

  describe("contributions accounting and token issuance", async () => {
  
    it('should accept contributions and issue tokens when contract is not paused', async () => {
      await contributionInstance.contribute({from: owner, value: 100})
    })

    it('should not accept contributions and issue tokens when contract is paused', async () => {
      await contributionInstance.pause({from: owner})
      await catchRevert(contributionInstance.contribute({from: owner, value: 100}))
    })

    it('should emit an event when a contribution has been made', async () => {
      let receipt = await contributionInstance.contribute({from: user1, value: 100})
      expectEvent(receipt, 'ContributionMade', { contributor: user1, amount: new BN(100) })
    })

    it('should accurately return how much ETH a user has contributed', async () => {

    })

    it('should not accept contributions when the contract is paused', async () => {

    })

  })

  describe("fund withdrawal", async () => {

    it('should allow owner to withdraw a specified amount', async () => {
      await contributionInstance.contribute({from: user1, value: 100})
      await contributionInstance.withdraw(100, {from: owner})
    })

    it('should allow owner to withdraw the total balance of the contract', async () => {
      await contributionInstance.withdrawAll({from: owner})
    })

    it('should revert when owner tries to withdraw a higher amount than the contract balance', async () => {
      await catchRevert(contributionInstance.withdraw(1000, {from: owner}))
    })

    it('should revert when someone other than the owner try to withdraw from the contract (withdraw amount)', async () => {
      await catchRevert(contributionInstance.withdraw(100, {from: user1}))
    })

    it('should revert when someone other than the owner try to withdraw from the contract (withdrawAll)', async () => {
      await catchRevert(contributionInstance.withdrawAll({from: user1}))
    })
  
  })

})