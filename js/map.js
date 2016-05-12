/*-----------------------------------------------------------------------------------------*/
/* MODEL */

// set initial options for map
var initOptions = {
	center : {lat : 53.328, lng: -3.101995},
	zoom : 15
};

// zoom level once a place is searched for (street level)
var streetZoom = 15

// color of icons
var redIcon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
var blueIcon = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';

/*-----------------------------------------------------------------------------------------*/
/* CONTROLLER */

// Create a new map object in global scope (for access) and add to #map div
var map = new google.maps.Map(document.getElementById('map'), initOptions);	

// create new search box object and assign to #searchbox <input>
var input = document.getElementById('searchbox');
var searchBox = new google.maps.places.SearchBox(input);

// bias searchbox results towards current map bounds,
map.addListener('bounds_changed', function() {
	searchBox.setBounds(map.getBounds());
});

// listen for user entering a search
searchBox.addListener('places_changed', function() {

	// when they do, getPlaces returns an array of possible matches
	var places = searchBox.getPlaces();

	// select places[0] TODO: why? will this be correct every time?
	var place = places[0];

	// TESTS
	//console.log(places);
	//console.log(place.geometry.viewport);
	//console.log("NEWTEST: " + place.geometry.location);	

	// TODO: need error checking here. Maybe test if ...geometry.location exists

	// set viewport on selected place and zoom in
	map.setCenter(place.geometry.location);
	map.setZoom(streetZoom);

	// add place marker for selected place
	var searchMarker = addMarker(place.geometry.location, redIcon);	
})



// when bounds change (when user scrolls map OR when changed via search as above)
map.addListener('bounds_changed', function() {
	
	// query API
	getStopsData()

	// TEST
	//console.log(map.getBounds().getSouthWest().lat());
})

function getStopsData() {
	// get current bounds from getBounds object
	var current_bounds = map.getBounds();
	var min_lat = current_bounds.getSouthWest().lat();
	var min_lng = current_bounds.getSouthWest().lng();
	var max_lat = current_bounds.getNorthEast().lat();
	var max_lng = current_bounds.getNorthEast().lng();

	// TEST
	//console.log(current_bounds);
	console.log(min_lat, min_lng, max_lat, max_lng);
	//console.log(place.geometry.viewport);

	/* TEST: add markers at boundary points
	addMarker(current_bounds.getSouthWest(), blueIcon);
	addMarker(current_bounds.getNorthEast(), blueIcon); */

	// form search string for API request (https://data.police.uk/docs/method/stops-street/)
	var poly_1 = min_lat.toString() + ',' + min_lng.toString() + ':';
	var poly_2 = min_lat.toString() + ',' + max_lng.toString() + ':';
	var poly_3 = max_lat.toString() + ',' + max_lng.toString() + ':'; 
	var poly_4 = max_lat.toString() + ',' + min_lng.toString();
	var query = 'https://data.police.uk/api/stops-street?poly=' + poly_1 + poly_2 + poly_3 + poly_4;

	// test query string
	console.log(query);

	// query API. Creates JSON object of 'stops'
	var stops;
	var request = new XMLHttpRequest();
	request.open("GET", query); // async by default
	request.addEventListener("load", function() {
		// once loaded, do this..

		stops = JSON.parse(request.responseText);

		// test
		//console.log(stops);

		addStopsMarkers(stops);
	});
	request.send(null);

	
}

// addSearchListener(searchBox);






/*function addSearchListener(searchBox) {
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
} */

/*function addMarker(markerOptions) {
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
}; */

/*function getStopsData() {
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
} */

function addMarker(location, icon) {
	var markerOptions = {
		map : map,
		position : location,
		icon: icon
	};
	return new google.maps.Marker(markerOptions);	
}

function addStopsMarkers(stops) {
	for (stop of stops) {
		
		// TODO: markerOptions.animation = google.maps.Animation.DROP;
		

		var stopLocation = {
			lat : Number(stop.location.latitude), 
			lng: Number(stop.location.longitude)
		};

		addMarker(stopLocation, blueIcon);

	}
}








