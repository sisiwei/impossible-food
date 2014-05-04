var shareURL; 

$(document).ready(function(){
	$(".chosen-select").chosen();

  $.getJSON("data/shared_items.json", function(data){
    for (var food_id in data) {
      var food = data[food_id];
      $("#food").append('<option value="'+ food_id +'" data-food=' + food + '>'+ food + '</option>');
      $("#food").trigger("chosen:updated");
    }

  	// Does a hash exist?
		var url = window.location.href.split('#')[1];
		if (url == "" || url == undefined){
			// do nothing
		} else {
			var items = url.split(',');
			$.each(items, function(k,v){
				createRows(parseInt(v));
			});
		}
  });

  $('.add-to-list').click(function(){
    if (!$('.add-to-list').hasClass('disabled')) {
  	  createRows();
    }
  });

  updateAddButton();
  setTimeout(updateAddButton, 100);
  // Dumb, but wait for Chosen to update if user pressed "refresh"
  $("#food").chosen().change(updateAddButton);

  $('.rows .fa.close').click(function(e){
  	var numRemaining = $('.rows').length;
  	$(this).closest('.rows').fadeOut(1000, function(){
  		$(this).closest('.rows').remove();
  	});  	
  	if (numRemaining == 1){
  		$('.recommendations').fadeOut(500);
  	};
  });

  $('.rows .fa-plus').click(function(){
  	var numRemaining = $('.rows').length;
  	var adding = $(this).parent().attr('data-foodid');
  	createRows(parseInt(adding));
  	$(this).parent().fadeOut(500);
  	if (numRemaining == 1){
  		$('.recommendations').fadeOut(500);
  	};
  });
});

function createRows(paramID){
	$('.table').fadeIn(500);

	var foodID;
	var foodName;
	var qty;

	// Detect the values in the URL or the select boxes
	paramID = typeof paramID !== 'undefined' ? paramID : null;
	if (paramID != null){
		foodID = paramID;
		foodName = $('#food option[value="' + foodID + '"]').attr("data-food");
		qty = "1";
	} else {
		foodID = $('#food').val();
		foodName = $("#food option:selected").text();
		qty = ($('#qty').val() == "" || $('#qty').val() == null) ? "1" : $('#qty').val();
	}

  var foodMiles;

  var margin = {top: 20, right: 40, bottom: 20, left: 2}, chartWidth = 300-margin.left-margin.right, barHeight = 18, barSpacing = 3, chartHeight;

  var xScale = d3.scale.linear().range([0,chartWidth]);

  $('.just-loaded').removeClass('just-loaded');

	$.getJSON("data/mileage/231-" + foodID + ".json", function(data){

    foodMiles = parseInt(data.miles);

    $("#food option[value='"+foodID+"']").remove();
    $("#food").trigger("chosen:updated");

  	// Add a line into the .table below
  	var $text = $('<div class="tr just-loaded cf"><div class="qty-col"><span>' + qty + '</span><input type="text" pattern="[0-9]*" value="' + qty + '"/></div> <div class="food-item gen" data-foodid="' + foodID + '"><span>' + foodName + ' <i class="fa fa-times"></i></span></div> <div class="food-miles">' + addCommas(foodMiles) + '</div><div class="chart" id="chart-'+foodID+'"></div></div>');
    $text.find("div.food-item span").on("click",function(e){
      $(this).parent().parent().toggleClass("details");
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

    data.countries.push({
      "home": true,
      "name": "United States of America",
      "distance": 0,
      "pct": Math.round(10000*data.domestic/(data.domestic+data.imports))/100
    });

    var chartData = data.countries.filter(function(d){
      return d.pct !== null && d.pct >= 1;
    });

    chartData.sort(function(a,b){
      if (a.home) return -1;
      if (b.home) return 1;
      return b.pct - a.pct;
    });

    if (chartData.length > 5) chartData = chartData.slice(0,5);

    chartData.sort(function(a,b){
      if (a.home) return -1;
      if (b.home) return 1;
      return a.distance - b.distance;
    });

    xScale.domain([0,d3.max(data.countries.map(function(d){
      return d.pct;
    }))*1.2]);

    chartHeight = ((barSpacing*2 + barHeight)*chartData.length);

    var svg = d3.select("div#chart-"+foodID)
      .append("svg")
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", chartHeight + margin.top + margin.bottom)

    var chart = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");;

    var groups = chart.selectAll("g").data(chartData)
    .enter()
    .append("g")
    .attr("transform",function(d,i){
      var offset = i*(barHeight+(2*barSpacing));
      return "translate(0,"+offset+")";
    });

    groups.append("rect")
      .attr("x",0)
      .attr("y",barSpacing)
      .attr("width",function(d){
        return xScale(d.pct);
      })
      .attr("height",barHeight)
      .classed("home",function(d,i){
        return !i;
      })
      .on("mouseover",function(d){
        console.log(d);
      });

    groups.append("text")
      .text(function(d){
        return d.pct+"% ("+d.name.slice(0,3)+")";
      })
      .attr("x",function(d){
        return xScale(d.pct)+2;
      })
      .attr("y",16);

    chart.append("path").attr("d","M0,0 L0,"+chartHeight);

    svg.append("text").attr("class","label").text("Nearest").attr("x",0).attr("y",margin.top-4);

    svg.append("text").attr("class","label").text("Farthest").attr("x",0).attr("y",margin.top+chartHeight+12);

  	// Removing a line
	  $('.food-item .fa').click(function(e){
      e.stopImmediatePropagation();
	  	$(this).closest('.tr').fadeOut(1000, function(){
	  		$(this).closest('.tr').remove();
	  		totalUpdate();
	  	});
	  });

	  totalUpdate();
	  createHash();
  });
};

function totalUpdate(){
	// Change the total
	var total = 0;
	$.each($('.tr .food-miles'), function(k,v){
		var num = $(v).text();
		total = total + parseInt(num.replace(/,/g, ''));
	});
	$('.total').html(addCommas(total));
}

function addCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function createHash() {
	// Get all the added items
	var $food = $('.food-item.gen');
	var hash = [];
	$.each($food, function(k,v){
		hash.push($(v).attr('data-foodid'));
	});

	shareURL = window.location.href + "#" + hash.join(",");
	shareHTML = "<i class='fa fa-link'></i><input type='text' value='" + shareURL + "'>";
	$('.copy-url').html(shareHTML);

	$('.share').click(function(){
		$('.copy-url').fadeIn(500);
	});
}

function updateAddButton() {
  if ($("#food option:selected").val()) {
    $('.add-to-list').removeClass('disabled');
  } else {
    $('.add-to-list').addClass('disabled');
  }
};

