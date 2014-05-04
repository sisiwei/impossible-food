var fs = require("fs");
var d3 = require("d3");
var queue = require("queue-async");

queue()
  .defer(fs.readFile,"clean/distances.json")
  .defer(fs.readFile,"clean/countries-by-code.json")
  .defer(fs.readFile,"clean/all-countries-domestic-crops.json")
  .defer(fs.readFile,"clean/trade-matrix-2011.json")
  .await(function(error,distances,countries,domestic,trade){
    distances = JSON.parse(distances);
    countries = JSON.parse(countries);
    domestic = JSON.parse(domestic);
    trade = JSON.parse(trade);

    var us = 231;
    var bananas = 68;

    var exports = trade.filter(function(d){
      return d.e == us && d.c == bananas;
    });

    var totalExports = d3.sum(exports.map(function(d){
      return d.a;
    }));

    var imports = trade.filter(function(d){
      return d.i == us && d.c == bananas;
    });

    var totalImports = d3.sum(imports.map(function(d){
      return d.a;
    }));

    var domestic = d3.sum(
      domestic.filter(function(d){
                return +d.country == us && +d.crop == bananas;
               })
              .map(function(d){
                return d.amount;
              })
    );

    var discount = (domestic+totalImports-totalExports)/(domestic+totalImports);

    domestic = domestic * discount;

    imports = imports.map(function(d){
      d.a = d.a * discount;
      return d;
    });

    var totalConsumption = domestic + d3.sum(imports.map(function(d){ return d.a; }));

    var miles = d3.sum(

      imports.map(function(d){
        if (distances[us+"-"+d.e]) {
          return d.a/totalConsumption * distances[us+"-"+d.e];
        }

        return 0;

      })
    );

    console.log(miles);

  });