const Token = artifacts.require("./contracts/Token.sol")

contract('Token', async (accounts) => {
  const user1 = accounts[0]
  let catchRevert = require("./exceptions.js").catchRevert
  
  beforeEach('set up Token contract for each test', async () => {
    tokenInstance = await Token.new()
  })

  describe("token setup", async () => {
  
    it('should have the correct name and symbol', async () => {
    
    })

    it('should accurately report the owner-defined startTime and stopTime', async () => {
    
    })

  })

  describe("token issuance", async () => {

    it('should issue tokens if the current time is between startTime and stopTime', async () => {
      
    })

    it('should emit an event when tokens have been issued', async () => {
      
    })
    
    it('should not issue tokens before the startTime', async () => {
      
    })

    it('should not issue tokens after the stopTime', async () => {
      
    })
  
  })

})