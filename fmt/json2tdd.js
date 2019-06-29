#!/usr/bin/env node

var fs = require("fs");
var path = require("path");
var vm = require("vm");

for (var filename of ["Colour.js", "tdd.js", "json_to_tdd.js"]) {
  vm.runInThisContext(fs.readFileSync(path.resolve(__dirname, filename), "utf-8"));
}

if (process.argv.length <= 2) {
  console.log("You must specify an input file");
  process.exit(1);
}

for (var n = 2; n < process.argv.length; n++) {
  var input_filename = path.resolve(process.argv[n]);
  var output_filename = path.parse(input_filename).name + ".tdd";

  var json = require(input_filename);
  fs.writeFileSync(output_filename, json_to_tdd(json).toString());
}