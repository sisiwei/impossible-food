var fs = require("fs");
var d3 = require("d3");
var queue = require("queue-async");

var weirdCountries = {
  "Ascension": "Saint Helena, Ascension and Tristan da Cunha",
  "Bolivia": "Bolivia (Plurinational State of)",
  "Brunei": "Brunei Darussalam",
  "Burma": "Myanmar",
  "Cape Verde": "Cabo Verde",
  "Cote d'Ivoire": "Côte d'Ivoire",
  "Falkland Islands": "Falkland Islands (Malvinas)",
  "Federated States of Micronesia": "Micronesia (Federated States of)",
  "Gaza Strip": "Gaza Strip (Palestine)",
  "Iran": "Iran (Islamic Republic of)",
  "Macedonia": "The former Yugoslav Republic of Macedonia",
  "Republic of the Congo": "Democratic Republic of the Congo",
  "Sudan": "Sudan (former)",
  "Taiwan": "China, Taiwan Province of",
  "Vatican City": "Holy See",
  "Venezuela": "Venezuela (Bolivarian Republic of)",
  "Vietnam": "Viet Nam",
  "Wallis and Futuna": "Wallis and Futuna Islands"
};

queue()
  .defer(fs.readFile,"country_centroids_primary.csv","utf8")
  .defer(fs.readFile,"TM-countries.json","utf8")
  .await(function(err,centroids,countries){

    countries = JSON.parse(countries).map(function(d){
      return d[1];
    });

    centroids = d3.tsv.parse(centroids).map(function(d){
      return {
        "lngLat": [+d.LONG,+d.LAT],
        "name": d.SHORT_NAME,
        "fullName": d.FULL_NAME,
        "realName": null
      };
    });

    centroids = centroids.map(function(d){
      if (countries.indexOf(d.name) != -1) d.realName = d.name;
      else if (countries.indexOf(d.fullName) != -1) d.realName = d.fullName;
      else if (weirdCountries[d.name])  d.realName = weirdCountries[d.name];
      return d;
    });

    centroids = centroids.filter(function(d){
      return d.realName !== null;
    });

    console.log(countries.filter(function(d){
      return centroids.filter(function(f){
        return f.realName == d;
      }).length == 0;
    }));

    var output = {};

    centroids.forEach(function(d){
      output[d.realName] = d.lngLat;
    });

  fs.writeFile("centroids.json",JSON.stringify(output,null,"\t"),function(err){
    console.log(err);
  });
});