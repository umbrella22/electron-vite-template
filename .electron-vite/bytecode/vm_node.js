const path = require("path");
module.require_proxy = (id) => {
  return require(id);
}
const vm = require(path.resolve(__dirname, "./encryption.node"));
vm.start(module);
