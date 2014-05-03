var fs = require("fs");

fs.readFile("trade-matrix-temp.json","utf8",function(err,data){

  data = JSON.parse("["+data.slice(0,data.length-1)+"]");

  if (data.every(function(d){

    return d.f.length == 0;

  })) {

    data = data.map(function(d){
      delete d.f;
      return d;
    });

  }

  fs.writeFile("trade-matrix.json",JSON.stringify(data),function(err){
    console.log(err);
  });
})