const { BN, ether, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers')

const Token = artifacts.require("./contracts/Token.sol")
const Contribution = artifacts.require("./contracts/Contribution.sol")

contract('Contribution', async (accounts) => {
  const owner = accounts[0]
  const user1 = accounts[1]

  const testAmount = ether('2')
  
  beforeEach('set up Contribution contract for each test', async () => {
    // hypothetical startTime is one day from latest block, endTime one week from startTime
    testStartTime = (await time.latest()).add(time.duration.days(1))
    testEndTime = testStartTime.add(time.duration.weeks(1))

    // deploy new contracts for each test case
    tokenInstance = await Token.new(testStartTime, testEndTime)
    contributionInstance = await Contribution.new(tokenInstance.address)
  })

  describe("contract setup", async () => {

    it('should revert if contributions are made before the Contribution contract has been set ("approved" to issue tokens) on the Token contract', async () => {
      await expectRevert(contributionInstance.contribute({from: user1, value: testAmount}), 'function can only be called by the contribution contract')
    })
  
  })

  describe("contributions accounting and token issuance", async () => {
  
    it('should accept contributions and issue tokens when Contribution contract has been apporved on the Token contract', async () => {
      await tokenInstance.setContributionContract(contributionInstance.address, {from: owner})
      await contributionInstance.contribute({from: user1, value: testAmount})
    })

    it('should emit an event when a contribution has been made', async () => {
      await tokenInstance.setContributionContract(contributionInstance.address, {from: owner})

      let receipt = await contributionInstance.contribute({from: user1, value: testAmount})
      expectEvent(receipt, 'ContributionMade', { contributor: user1, amount: testAmount })
    })

    it('should accurately return how much ETH a user has contributed', async () => {
      await tokenInstance.setContributionContract(contributionInstance.address, {from: owner})
      
      await contributionInstance.contribute({from: user1, value: testAmount})
      var callAmount = await contributionInstance.amountContributed(user1, {from: owner})
      
      // this tests for equality in BigNumber objects: a.cmp(b) = 0 means a == b
      assert.equal(0, testAmount.cmp(callAmount))

      await contributionInstance.contribute({from: user1, value: testAmount})
      callAmount = await contributionInstance.amountContributed(user1, {from: owner})
      
      // callAmount should equal testAmount * 2 since the smart contract records the total amount contributed by the user
      assert.equal(0, testAmount.mul(new BN(2)).cmp(callAmount))
    })

    it('should revert if the user calls `contribute` without attaching any ETH', async () => {
      await tokenInstance.setContributionContract(contributionInstance.address, {from: owner})

      await expectRevert(contributionInstance.contribute({from: owner}), 'Insufficient contribution: Amount should be more than 0')
      await expectRevert(contributionInstance.contribute({from: user1}), 'Insufficient contribution: Amount should be more than 0')
    })

    it('should not accept contributions or issue tokens when contract is paused', async () => {
      await tokenInstance.setContributionContract(contributionInstance.address, {from: owner})

      await contributionInstance.pause({from: owner})
      await expectRevert(contributionInstance.contribute({from: owner, value: 100}), 'Pausable: paused')
    })

    it('should accept contributions when the contract is unpaused (emergency stop)', async () => {
      await tokenInstance.setContributionContract(contributionInstance.address, {from: owner})

      await contributionInstance.pause({from: owner})
      await expectRevert(contributionInstance.contribute({from: owner, value: testAmount}), 'Pausable: paused')
      await contributionInstance.unpause({from: owner})
      await contributionInstance.contribute({from: user1, value: testAmount})
    })

  })

  describe("fund withdrawal", async () => {

    it('should allow owner to withdraw a specified amount', async () => {
      await tokenInstance.setContributionContract(contributionInstance.address, {from: owner})

      await contributionInstance.contribute({from: user1, value: testAmount})
      let receipt = await contributionInstance.withdraw(testAmount, {from: owner})
      expectEvent(receipt, 'FundWithdrawal', { amount: testAmount })
    })

    it('should allow owner to withdraw the total balance of the contract', async () => {
      let receipt = await contributionInstance.withdrawAll({from: owner})
      expectEvent(receipt, 'FundWithdrawal')
    })

    it('should revert when owner tries to withdraw a higher amount than the contract balance', async () => {
      await expectRevert(contributionInstance.withdraw(1000, {from: owner}), 'Invalid amount given: Amount should be between 0 and the total balance of this contract')
    })

    it('should revert when someone other than the owner try to withdraw from the contract (withdraw amount)', async () => {
      await expectRevert(contributionInstance.withdraw(100, {from: user1}), 'Ownable: caller is not the owner')
    })

    it('should revert when someone other than the owner try to withdraw from the contract (withdrawAll)', async () => {
      await expectRevert(contributionInstance.withdrawAll({from: user1}), 'Ownable: caller is not the owner')
    })
  
  })

})