const Token = artifacts.require("Token")

module.exports = function(deployer) {
  deployer.deploy(Token, 111111, 555555)
}