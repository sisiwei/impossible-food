var fs = require("fs");
var d3 = require("d3");
var queue = require("queue-async");

queue()
  .defer(fs.readFile,"clean/distances.json")
  .defer(fs.readFile,"clean/countries-by-code.json")
  .defer(fs.readFile,"clean/all-countries-domestic-crops.json")
  .defer(fs.readFile,"clean/trade-matrix-2011.json")
  .defer(fs.readFile,"shared_items.json")
  .await(function(error,distances,countries,domestic,trade,items){
    distances = JSON.parse(distances);
    countries = JSON.parse(countries);
    domestic = JSON.parse(domestic);
    trade = JSON.parse(trade);
    items = JSON.parse(items);

    //d3.keys(items)
    [486].forEach(function(d){
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

      console.log(imports);

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
        console.log(d.e);
        return countries[d.e] && distances[us+"-"+d.e];
      }).map(function(d){
        return {
          "name": countries[d.e],
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

      fs.writeFile("mileage/"+us+"-"+bananas+".json",JSON.stringify(results),function(err){
        console.log(err);
      });
    }

  });