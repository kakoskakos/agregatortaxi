var data = {
	latA:0,
	latB:0,
	lngA:0,
	lngB:0,
	duration:0,
	distance:0
};

var auto_start;
var auto_end;

function activatePlacesSearch(){
	var start = document.getElementById('start');
	var end = document.getElementById('end');
	
	var defaultBounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(55.16, 61.354)
	);
	var opt	= {
		bounds: defaultBounds
	};
	auto_start = new google.maps.places.Autocomplete(start,opt);
	auto_end = new google.maps.places.Autocomplete(end,opt);

}

function geocodeAddress(geocoder) {
	
    var start = document.getElementById('start').value;
	var end = document.getElementById('end').value;
	
	geocoder.geocode({'address': start}, function(results, status) {
        if (status === 'OK') {
            console.log(results[0]);
			data.latA =  results[0].geometry.location.lat();
			data.lngA =  results[0].geometry.location.lng();
			markroute();
			update();
        }
		else {
            console.log('Geocode was not successful for the following reason: ' + status);
            $('#circle').hide();
            $('#go').prop('disabled', false);
			riseErr('start');
		}
	});
	geocoder.geocode({'address': end}, function(results, status) {
        if (status === 'OK') {
        	console.log(results[0]);
			data.latB = results[0].geometry.location.lat();
			data.lngB = results[0].geometry.location.lng();
			markroute();
			update();
        }
		else {
			console.log('Geocode was not successful for the following reason: ' + status);
            $('#circle').hide();
            $('#go').prop('disabled', false);
			riseErr('end');
		}
	});
	google.maps.event.addListener(auto_start, 'place_changed', function() {
		console.log('Place changed start');
		resetData('start');
		update();
	});
	google.maps.event.addListener(auto_end, 'place_changed', function() {
		console.log('Place changed end');
		resetData('end');
		update();
	});

}
function markroute(){
	
	var options = {
		zoom:12,
		center:{
			lat:55.16,
			lng:61.354
		}
	}
	
	var map = new google.maps.Map(document.getElementById('map'),options);
	
	var directionsService = new google.maps.DirectionsService;
	var directionsDisplay = new google.maps.DirectionsRenderer;

	directionsDisplay.setMap(map);
	directionsDisplay.setOptions( { suppressMarkers: true } );
	
	var pointA = new google.maps.LatLng(data.latA, data.lngA);
    var pointB = new google.maps.LatLng(data.latB, data.lngB);

	var marker = new google.maps.Marker({
		map: map,
		position: pointA,
		label: 'A'
	});
	var marker = new google.maps.Marker({
		map: map,
		position: pointB,
		label: 'B'
	});
	calcRoute(directionsDisplay,directionsService,pointA,pointB);
	
}
function calcRoute(directionsDisplay,directionsService,pointA,pointB) {
	var request = {
		origin: pointA,
		destination: pointB,
		travelMode: 'DRIVING'
	};
	directionsService.route(request, function(result, status) {
		if (status == 'OK') {
			//console.log("pop",request,result,data);
			directionsDisplay.setDirections(result);
		}
		else{
			//console.log(request);
			
		}
	});
}
function resetData(type) {
	if (type != 'end') {
		data.latA = 0;
		data.lngA = 0;
	}
	if (type != 'start') {
		data.latB = 0;
		data.lngB = 0;
	}
	data.duration = 0;
	data.distance = 0;
}
function update() {
	var place_start = auto_start.getPlace();
	if (place_start) {
		if (place_start.geometry) {
			data.latA = place_start.geometry.location.lat();
			data.lngA = place_start.geometry.location.lng();
		}
	}
	var place_end = auto_end.getPlace();
	if (place_end) {
		if (place_end.geometry) {
			data.latB = place_end.geometry.location.lat();
			data.lngB = place_end.geometry.location.lng();
		}
	}

	if (data.latA != 0 && data.lngA != 0 
		&& data.latB != 0 && data.lngB != 0)
	{
		var origin = new google.maps.LatLng(data.latA, data.lngA);
		var destination = new google.maps.LatLng(data.latB, data.lngB);
		var directionsService = new google.maps.DirectionsService();
		var request = {
			origin: origin, // LatLng|string
			destination: destination, // LatLng|string
			travelMode: google.maps.DirectionsTravelMode.DRIVING,
			durationInTraffic: true
		};

		directionsService.route(request, function( response, status ) {
			if ( status === 'OK' ) {
				var point = response.routes[ 0 ].legs[ 0 ];
				data.duration = point.duration.value;
				data.distance = point.distance.value;
			} else {
				// console.log('Couldnt update route params!');
			}
		});
	} else {
		// console.log('Lattitude and longitude not ready yet!');
	}
}

function riseErr(mes){
	if (mes === 'both'){
        let res = '<h5>Ошибка полей ввода:</h5>' +
			'<ul id = "error" class="list-group md-3">' +
            '<li> Введите адрес отправления </li>' +
            '<li> Введите адрес назначения </li>' +
            '</ul>';
        $('#err').html(res).show();
    }else if (mes === 'nullstart'){
        let res = '<h5>Ошибка полей ввода:</h5>' +
            '<ul id = "error" class="list-group md-3">' +
            '<li> Введите адрес отправления </li>' +
            '</ul>';
        $('#err').html(res).show();
    }else if (mes === 'nullend'){
        let res = '<h5>Ошибка полей ввода:</h5>' +
            '<ul id = "error" class="list-group md-3">' +
            '<li> Введите адрес назначения </li>' +
            '</ul>';
        $('#err').html(res).show();
	}else if (mes === 'start'){
		let res = '<h5>Ошибка полей ввода:</h5>' +
			'<ul id = "error" class="list-group md-3">' +
			'<li> Некорректный адрес отправления или назначения </li>' +
			'</ul>';
		$('#err').html(res).show();
	}else if (mes === 'end'){
		let res = '<h5>Ошибка полей ввода:</h5>' +
			'<ul id = "error" class="list-group md-3">' +
			'<li> Некорректный адрес отправления или назначения </li>' +
			'</ul>';
		$('#err').html(res).show();
	}else if (mes === 'same'){
        let res = '<h5>Ошибка полей ввода:</h5>' +
            '<ul id = "error" class="list-group md-3">' +
            '<li> Адреса не должны совпадать </li>' +
            '</ul>';
		$('#err').html(res).show();
	}

}