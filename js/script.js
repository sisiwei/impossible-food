$(document).ready(function(){
	$(".chosen-select").chosen();

  $.getJSON("data/shared_items.json", function(data){
    for (var food_id in data) {
      var food = data[food_id];
      $("#food").append('<option value="'+ food_id +'" data-food=' + food + '>'+ food + '</option>');
      $("#food").trigger("chosen:updated");
    }
  });

  $('.add-to-list').click(function(){
  	// Detect the values in the select boxes
  	var foodID = $('#food').val();
  	var foodName = $("#food option:selected").text();
  	var qty = ($('#qty').val() == "" || $('#qty').val() == null) ? "1" : $('#qty').val();

  	// Calculate the food miles TBD
  	var foodMiles = 0;

    var chartHeight = 180, chartWidth = 300;

    var yScale = d3.scale.linear().range([chartHeight - 2,0]);

  	$.getJSON("data/mileage/231-" + foodID + ".json", function(data){

	    foodMiles = parseInt(data.miles);

      $("#food option[value='"+foodID+"']").remove();
      $("#food").trigger("chosen:updated");

	  	// Add a line into the .table below
	  	var $text = $('<div class="tr just-loaded cf"><div class="qty-col"><span>' + qty + '</span><input type="text" pattern="[0-9]*" value="' + qty + '"/></div> <div class="food-item"><span>' + foodName + ' <i class="fa fa-times"></i></span></div> <div class="food-miles">' + addCommas(foodMiles) + '</div><div class="chart" id="chart-'+foodID+'"></div></div>');
      $text.find("div.food-item").on("click",function(e){
        $(this).parent().toggleClass("details");
      });

      $text.find("input").on("blur change",function(e){
        var $div = $(this).parent();
        $div.removeClass("active");
        if ($(this).val().match(/^[0-9]+$/)) {
          $div.find("span").text($(this).val());
        } else {
          $(this).val($div.find("span").text());
        }

      });
      $text.find(".qty-col").on("click",function(e){
        $(this).addClass("active");
        $(this).find("input").focus();
      });
	  	$('.table .th').after($text);
	  	$('.just-loaded').fadeIn(1000);
	  	$('.just-loaded').removeClass('.just-loaded');

      yScale.domain([0,d3.max(data.countries.map(function(d){
        return d.pct;
      }))]);

      var chart = d3.select("div#chart-"+foodID).append("svg").attr("height",chartHeight).attr("width",chartWidth);

      var chartData = data.countries.sort(function(a,b){
        return a.distance - b.distance;
      }).filter(function(d){
        return d.pct >= 1;
      });

      chart.append("path").attr("d","M0,"+chartHeight+"L"+chartWidth+","+chartHeight)

      var groups = chart.selectAll("g").data(chartData)
      .enter()
      .append("g")
      .attr("transform",function(d,i){
        return "translate("+(i * chartWidth/5)+")";
      });

      groups.append("rect")
        .attr("x",4)
        .attr("y",function(d){
          return yScale(d.pct);
        })
        .attr("width",chartWidth/5 - 8)
        .attr("height",function(d){
          return chartHeight-1-yScale(d.pct);
        });

      groups.append("text")
        .text(function(d){
          return d.name;
        })
        .attr("dy","14px")
        .attr("x",chartWidth/10)
        .attr("y",function(d){
          return yScale(d.pct);
        });

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