const SimpleTransaction = artifacts.require("SimpleTransaction");

module.exports = function (deployer) {
  deployer.deploy(SimpleTransaction);
};