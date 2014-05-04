var fs = require("fs");
var d3 = require("d3");

fs.readFile("clean/trade-matrix-2011.json","utf8",function(err,data){

  data = JSON.parse(data);

  console.log(data.length);

  var output = {};

  data.forEach(function(d){
    var key = d.i+"-"+d.e+"-"+d.c;
    if (!(key in output)) {
      output[key] = [];
    }

    output[key].push(d);

  });

  var entries = d3.entries(output);

  entries = entries.map(function(d){

    if (d.value.length > 1) {

      var avg = d3.mean(d.value.map(function(f){
        return f.a;
      }));

      d.value[0].a = avg;

    }

    return d.value[0];

  });

  fs.writeFile("clean/trade-matrix-2011-averaged.json",JSON.stringify(entries),function(err){
    console.log(err);
  });

});