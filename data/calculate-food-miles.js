var fs = require("fs");
var d3 = require("d3");
var queue = require("queue-async");

queue()
  .defer(fs.readFile,"clean/distances.json")
  .defer(fs.readFile,"clean/countries-by-code.json")
  .defer(fs.readFile,"clean/all-countries-domestic-crops.json")
  .defer(fs.readFile,"clean/trade-matrix-2011-averaged.json")
  .defer(fs.readFile,"shared_items.json")
  .defer(fs.readFile,"country-codes.json")
  .await(function(error,distances,countries,domestic,trade,items,abbreviations){
    distances = JSON.parse(distances);
    countries = JSON.parse(countries);
    domestic = JSON.parse(domestic);
    trade = JSON.parse(trade);
    items = JSON.parse(items);
    abbreviations = JSON.parse(abbreviations);

    console.log(abbreviations);

    d3.keys(items).forEach(function(d){
      doProduct(+d);
    });

    function doProduct(bananas) {
      var us = 231;
      bananas = +bananas;

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

      var domesticProduction = d3.sum(
          domestic.filter(function(d){
                  return +d.country == us && +d.crop == bananas;
                 })
                .map(function(d){
                  return d.amount;
                })
      );

      var discount = (domesticProduction+totalImports-totalExports)/(domesticProduction+totalImports);

      domesticProduction = domesticProduction * discount;

      imports = imports.map(function(d){
        d.a = d.a * discount;
        return d;
      });

      var totalConsumption = domesticProduction + d3.sum(imports.map(function(d){ return d.a; }));

      var miles = d3.sum(

        imports.map(function(d){
          if (distances[us+"-"+d.e]) {
            return d.a/totalConsumption * distances[us+"-"+d.e];
          }

          return 0;

        })
      );

      var importDetails = imports.filter(function(d){
        return countries[d.e] && distances[us+"-"+d.e];
      }).map(function(d){
        if (!abbreviations[countries[d.e]]) {
          console.log(countries[d.e]);
        }
        return {
          "name": countries[d.e],
          "abbreviation": abbreviations[countries[d.e]],
          "distance": distances[us+"-"+d.e],
          "pct": Math.round(10000*d.a/totalConsumption)/100
        }
      });

      var results = {
        "miles": miles,
        "imports": totalImports,
        "exports": totalExports,
        "domestic": domesticProduction/discount,
        "countries": importDetails
      };

      console.log(bananas);

      fs.writeFile("mileage/"+us+"-"+bananas+".json",JSON.stringify(results),function(err){
        console.log(err);
      });
    }

  });