var fs = require("fs");
var path = require("path");
var vm = require("vm");

for (var filename of ["Colour.js", "tdd.js", "json_to_tdd.js"]) {
  vm.runInThisContext(fs.readFileSync(path.resolve(__dirname, filename), "utf-8"));
}

var input_filename = "../../draft (81).json";
if (process.argv.length > 2) {
  input_filename = process.argv[2];
}

var json = require(input_filename);
console.log(json_to_tdd(json).toString());