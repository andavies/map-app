/*-----------------------------------------------------------------------------------------*/
/* CONTROLLER */

// map in global scope for access
var map;

function initMap() {
	// Create a new map object and add to #map div
	map = new google.maps.Map(document.getElementById('map'), initOptions);

	// add search box
	addSearchBox();
}

function addSearchBox() {
	var input = document.getElementById('searchbox');
	var searchBox = new google.maps.places.SearchBox(input);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	// bias searchbox results towards current map bounds
	map.addListener('bounds_changed', function() {
		searchBox.setBounds(map.getBounds());
	});

	addSearchListener(searchBox);
}

function addSearchListener(searchBox) {
	// listen for user selecting place
	searchBox.addListener('places_changed', function() {
		// getPlaces() return an ARRAY of possible matches
		// so "li" returns array of possibles
		var places = searchBox.getPlaces();
		// just select 1st place in array
		var place = places[0];

		// create new marker
		var newMarkOptions = {
			map : map,
			title : place.formatted_address,
			position : place.geometry.location
		};
		addMarker(newMarkOptions);

		// centre screen on marker
		var bounds = new google.maps.LatLngBounds();
		if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
        }
        else {
            bounds.extend(place.geometry.location);
        }

		// fit map to bounds selected by place search
		map.fitBounds(bounds);
		// set zoom to street level
		map.setZoom(15);

		// get stop/search data from api
		getStopsData();
	});
}

function addMarker(markerOptions) {
	marker = new google.maps.Marker(markerOptions);
	var marker = new google.maps.Marker(markerOptions);

	// add info window for each stop

	// format date/time
	var date = new Date(stop.datetime);
	var formattedDate = date.toString();

	var infoContent = "<div id='infowindow'>"
							+ '<p>' + formattedDate + '</p>'
					   		+ '<p>' + stop.legislation + '</p>'
					   		+ '<p>' + stop.gender + ', ' + stop.age_range + ', ' + stop.self_defined_ethnicity + '</p>'
					   		+ '<p>' + 'result: ' + stop.outcome + '</p>'
					   	+ '</div>';

	// test
	console.log(infoContent);

	var infowindow = new google.maps.InfoWindow({
		content: infoContent
	});
	marker.addListener('click', function() {
		infowindow.open(map, marker);
	})
};

function getStopsData() {
	// get current bounds from getBounds object
	var current_bounds = map.getBounds();
	var min_lat = current_bounds.R.R;
	var min_lng = current_bounds.j.j;
	var max_lat = current_bounds.R.j;
	var max_lng = current_bounds.j.R;

	// get police.uk stop-search data for current bounds (https://data.police.uk/docs/method/stops-street/)
	var poly_1 = min_lat.toString() + ',' + min_lng.toString() + ':';
	var poly_2 = min_lat.toString() + ',' + max_lng.toString() + ':';
	var poly_3 = max_lat.toString() + ',' + max_lng.toString(); // 4th poly not required as per documentation
	var query = 'https://data.police.uk/api/stops-street?poly=' + poly_1 + poly_2 + poly_3;
	var stops;

	var request = new XMLHttpRequest();
	request.open("GET", query); // async by default
	request.addEventListener("load", function() {
		// once loaded, do this..

		stops = JSON.parse(request.responseText);

		// test
		// console.log(stops);

		addStopsMarkers(stops);
	});
	request.send(null);
}

function addStopsMarkers(stops) {
	//test
	console.log(stops);
	for (stop of stops) {
		// test
		console.log(stop);
		var markerOptions = {};
		markerOptions.position = {
			lat: Number(stop.location.latitude),
			lng: Number(stop.location.longitude)
		};
		markerOptions.animation = google.maps.Animation.DROP;
		markerOptions.map = map;
		addMarker(markerOptions);

	}
}

/*-----------------------------------------------------------------------------------------*/
/* MODEL */

var initOptions = {
	center : {lat : 53.328, lng: -3.101995},
	zoom : 8
};

/*---------------------------------------------------------------------------------------*/
/* VIEW */

initMap();
