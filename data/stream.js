var fs = require("fs");
var split = require("split");
var through = require("through");
var d3 = require("d3");

var stream = fs.createReadStream("trade-matrix-2011.csv",{"encoding": "utf8"});
var newFile = fs.createWriteStream("trade-matrix-temp.json");

var countries = {};

stream.pipe(split())
      .pipe(through(
        function write(data) {

          if (!data.length) return true

          try {
            var cells = d3.csv.parseRows(data)[0];
          } catch(e) {
            console.log(data);
          }

          if (!cells[7].match(/Quantity .tonnes./)) return true;

          if (!countries[cells[1]]) countries[cells[1]] = +cells[2];
          if (!countries[cells[3]]) countries[cells[3]] = +cells[4];

          cells = {
            "i": cells[7].match(/Import/) ? +cells[2] : +cells[4], //importer
            "e": cells[7].match(/Import/) ? +cells[4] : +cells[2], //exporter
            "c": +cells[6], //product code
            "a": +cells[11], //amount
            "f": cells[12] //flag
          };

          if (cells.i == 231 && cells.e == 138 && cells.c == 486) {
            console.log(data);
          }

          this.queue(JSON.stringify(cells)+","); //data *must* not be null
        },
        function end() { //optional
          console.log(JSON.stringify(countries));
          this.queue(null);
        }
      ))
      .pipe(newFile);