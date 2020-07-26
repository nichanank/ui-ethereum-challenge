const Token = artifacts.require("./contracts/Token.sol")
const Contribution = artifacts.require("./contracts/Contribution.sol")

contract('Contribution', async (accounts) => {
  const owner = accounts[0]
  const user1 = accounts[1]
  const user2 = accounts[1]
  let catchRevert = require("./exceptions.js").catchRevert
  
  beforeEach('set up Contribution contract for each test', async () => {
    tokenInstance = await Token.new(111111, 555555)
    contributionInstance = await Contribution.new(tokenInstance.address)
  })

  describe("contributions accounting and token issuance", async () => {
  
    it('should accept contributions and issue tokens when contract is not paused', async () => {
      
    })

    it('should emit an event when a contribution has been made', async () => {
      
    })

    it('should accurately return how much ETH a user has contributed', async () => {

    })

    it('should not accept contributions when the contract is paused', async () => {

    })

  })

  describe("fund withdrawal", async () => {

    it('should allow owner to withdraw a specified amount', async () => {
      
    })

    it('should allow owner to withdraw the total balance of the contract', async () => {
      
    })

    it('should revert when owner tries to withdraw a higher amount than the contract balance', async () => {
      
    })

    it('should revert when someone other than the owner try to withdraw from the contract (withdraw amount)', async () => {
      
    })

    it('should revert when someone other than the owner try to withdraw from the contract (withdrawAll)', async () => {
      
    })
  
  })

})