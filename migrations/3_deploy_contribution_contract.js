const Token = artifacts.require("Token")
const Contribution = artifacts.require("Contribution")

module.exports = function(deployer) {
  deployer.deploy(Contribution, Token.address)
}