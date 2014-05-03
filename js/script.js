$(document).ready(function(){
	$(".chosen-select").chosen();

  jQuery.getJSON("data/shared_items.json", function(data){
    for (var food_category in data) {
      for (var food_id in data[food_category]) {
        var food = data[food_category][food_id];
        $("#food").append('<option value="'+ food_id +'">'+ food + '</option>');
        $("#food").trigger("chosen:updated");
      }
    }
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
