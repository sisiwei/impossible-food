var fs = require("fs");
var d3 = require("d3");

fs.readFile("centroids-by-code.json","utf8",function(err,centroids){
  
  var codes, output = {};
  
  centroids = JSON.parse(centroids);
  codes = d3.keys(centroids);

  codes.forEach(function(d){
    codes.forEach(function(e){
      if (d == e) return true;

      output[e+"-"+d] = output[d+"-"+e] = distance(centroids[d],centroids[e]);
    });
  });

  fs.writeFile("distances.json",JSON.stringify(output),function(err){
    console.log(err);
  });

});

function distance(lnglat1,lnglat2) {

    var rad = Math.PI / 180,
        lat1 = lnglat1[1] * rad,
        lat2 = lnglat2[1] * rad;

    //Earth's radius in miles
    return  3963.19 * Math.acos(Math.sin(lat1) * Math.sin(lat2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.cos((lnglat2[0] - lnglat1[0]) * rad));
}