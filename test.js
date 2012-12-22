
var ULSParser = require("./ulsparser"),
    path = require("path");

var i = 0;

var p = new ULSParser(path.join(__dirname, "src"));

p.parseEntriesForType("AM", function(doc, cb) {
    console.log("line: ", doc);
    if (++i == 200) {
        process.exit();
    } else {
        cb();
    }
});
