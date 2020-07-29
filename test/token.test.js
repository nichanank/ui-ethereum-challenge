const { BN, ether, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers')

const Token = artifacts.require("./contracts/Token.sol")
const Contribution = artifacts.require("./contracts/Contribution.sol")

contract('Token', async (accounts) => {
  const owner = accounts[0]
  const user1 = accounts[1]
  const user2 = accounts[2]

  const testAmount = ether('2')
  const TOKENS_PER_ETH_DONATED = new BN('100')
  
  beforeEach('set up Token contract for each test', async () => {
    testStartTime = (await time.latest()).add(time.duration.days(1))
    testEndTime = testStartTime.add(time.duration.weeks(1))
    tokenInstance = await Token.new(testStartTime, testEndTime)
    contributionInstance = await Contribution.new(tokenInstance.address)
    await tokenInstance.setContributionContract(contributionInstance.address, {from: owner})
  })

  describe("contract setup", async () => {
  
    it('should have the correct name and symbol', async () => {
      let name = 'Token'
      let symbol = 'TKN'
      callName = await tokenInstance.name()
      callSymbol = await tokenInstance.symbol()
      assert.equal(callName, name)
      assert.equal(callSymbol, symbol)
    })

    it('should accurately report the owner-defined startTime and endTime', async () => {
      callStart = await tokenInstance.startTime()
      callStop = await tokenInstance.endTime()
      assert.equal(callStart.toNumber(), testStartTime)
      assert.equal(callStop.toNumber(), testEndTime)
    })

    it('should revert when someone other than the owner tries to set the Contribution contract', async () => {
      await expectRevert(tokenInstance.setContributionContract(contributionInstance.address, {from: user1}), 'Ownable: caller is not the owner')
    })

  })

  describe("token issuance", async () => {

    it('should emit an event when tokens have been issued', async () => {
      let { tx } = await contributionInstance.contribute({from: user1, value: testAmount})
      await expectEvent.inTransaction(tx, tokenInstance, 'TokensIssued', { amount: testAmount.mul(TOKENS_PER_ETH_DONATED), recipient: user1 })
    })
  
  })

  describe("time-dependent transfers (transfer)", async () => {
    
    it('should not let users transfer tokens before the startTime', async () => {
      await contributionInstance.contribute({from: user1, value: 100})
      await expectRevert(tokenInstance.transfer(user2, 20, {from: user1}), 'block.timestamp is before startTime')
    })

    it('should let users transfer tokens after the startTime, before the endTime', async () => {
      await contributionInstance.contribute({from: user1, value: 100})
      
      // increase to after startTime, before endTime
      await time.increase(time.duration.days(3))
      await time.advanceBlock()
      
      await tokenInstance.transfer(user2, 20, {from: user1})
    })

    it('should not users transfer tokens after the endTime', async () => {
      await contributionInstance.contribute({from: user1, value: 100})
      
      // increase to after endTime
      await time.increase(time.duration.weeks(3))
      await time.advanceBlock()

      await expectRevert(tokenInstance.transfer(user2, 20, {from: user1}), 'block.timestamp is after endTime')
    })

  })

  describe("time-dependent transfers (transferFrom)", async () => {
    
    it('should not let users transferFrom tokens before the startTime', async () => {
      await contributionInstance.contribute({from: user1, value: 100})
      await tokenInstance.approve(owner, 20, {from: user1})
      await expectRevert(tokenInstance.transferFrom(user1, user2, 20, {from: owner}), 'block.timestamp is before startTime')
    })

    it('should let users transferFrom tokens after the startTime, before the endTime', async () => {
      await contributionInstance.contribute({from: user1, value: 100})
      await tokenInstance.approve(owner, 20, {from: user1})
      
      // increase to after startTime, before endTime
      await time.increase(time.duration.days(3))
      await time.advanceBlock()
      
      await tokenInstance.transferFrom(user1, user2, 20, {from: owner})
    })

    it('should not users transferFrom tokens after the endTime', async () => {
      await contributionInstance.contribute({from: user1, value: 100})
      await tokenInstance.approve(owner, 20, {from: user1})
      
      // increase to after endTime
      await time.increase(time.duration.weeks(3))
      await time.advanceBlock()

      await expectRevert(tokenInstance.transferFrom(user1, user2, 20, {from: owner}), 'block.timestamp is after endTime')
    })

  })

})