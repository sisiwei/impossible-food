$(document).ready(function(){
	$(".chosen-select").chosen();

  jQuery.getJSON("data/shared_items.json", function(data){
    for (var food_category in data) {
      for (var food_id in data[food_category]) {
        var food = data[food_category][food_id];
        $("#food").append('<option value="'+ food_id +'" data-food=' + food + '>'+ food + '</option>');
        $("#food").trigger("chosen:updated");
      }
    }
  });

  $('.add-to-list').click(function(){
  	// Detect the values in the select boxes
  	var foodID = $('#food').val();
  	var foodName = $("#food option:selected").text();
  	var qty = $('#qty').val() == "" ? "1" : $('#qty').val();

  	// Calculate the food miles TBD
  	var foodMiles = "2,345";

  	// Add a line into the .table below
  	var text = '<div class="tr just-loaded cf"><div class="qty-col">' + qty + '</div> <div class="food-item"><span>' + foodName + ' <i class="fa fa-times"></i></span></div> <div class="food-miles">' + foodMiles + '</div> </div>';
  	$('.table .th').after(text);
  	$('.just-loaded').fadeIn(1000);
  	$('.just-loaded').removeClass('.just-loaded');

  	// Removing a line
	  $('.fa').click(function(){
	  	$(this).closest('.tr').fadeOut(1000, function(){
	  		$(this).closest('.tr').remove();
	  		totalUpdate();
	  	});
	  });

	  totalUpdate();
  });


});

function totalUpdate(){
	// Change the total
	var total = 0;
	$.each($('.tr .food-miles'), function(k,v){
		var num = $(v).text();
		total = total + parseInt(num.replace(/,/g, ''));
	});
	$('.total').html(addCommas(total));
 }

function distance(lnglat1,lnglat2) {
    var rad = Math.PI / 180,
        lat1 = lnglat1[1] * rad,
        lat2 = lnglat2[1] * rad;

    //Earth's radius in miles
    return  3963.19 * Math.acos(Math.sin(lat1) * Math.sin(lat2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.cos((lnglat2[0] - lnglat1[0]) * rad));
}

function addCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}