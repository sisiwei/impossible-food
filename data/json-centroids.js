var fs = require("fs");
var d3 = require("d3");
var queue = require("queue-async");

var weirdCountryNames = {
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
  .defer(fs.readFile,"clean/countries-by-name.json","utf8")
  .await(function(err,centroids,countries){

    countries = JSON.parse(countries);

    var countryNames = d3.keys(countries);

    centroids = d3.tsv.parse(centroids).map(function(d){
      return {
        "lngLat": [+d.LONG,+d.LAT],
        "name": d.SHORT_NAME,
        "fullName": d.FULL_NAME,
        "realName": null
      };
    });

    centroids = centroids.map(function(d){
      if (countryNames.indexOf(d.name) != -1) d.realName = d.name;
      else if (countryNames.indexOf(d.fullName) != -1) d.realName = d.fullName;
      else if (weirdCountryNames[d.name])  d.realName = weirdCountryNames[d.name];
      else console.log(d);
      return d;
    });

    centroids = centroids.filter(function(d){
      return d.realName !== null;
    });

    console.log(countryNames.filter(function(d){
      return centroids.filter(function(f){
        return f.realName == d;
      }).length == 0;
    }));

    var byName = {}, byCode = {};

    centroids.forEach(function(d){
      byName[d.realName] = d.lngLat;
      byCode[countries[d.realName]] = d.lngLat;
    });

    fs.writeFile("clean/centroids-by-name.json",JSON.stringify(byName),function(err){console.log(err);});
    fs.writeFile("clean/centroids-by-codes.json",JSON.stringify(byCode),function(err){console.log(err);});

});