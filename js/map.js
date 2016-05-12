/* 
 * map.js
 * andy davies
 *
 * Creates a Google Map in index.html, listens for user searching or scrolling,
 * then queries police.uk API and plots markers showing stop/search data.
 *
 */

/*-----------------------------------------------------------------------------------------*/
/* MODEL */

// initial options for map
var initOptions = {
	center : {lat : 53.328, lng: -3.101995},
	zoom : 15
};

// zoom level once a place is searched for (street level)
var streetZoom = 15

// minimum (widest) zoom for stops API to be called (prevents too wide an area returning too much data)
var minimum_zoom = 13;

// alert to user when zoom too wide
var alertMessage = 'Zoom is too wide, zoom in to see stop data';

// color of icons
var redIcon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
var blueIcon = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';

// array of markers to add to when police API called
//var	stopMarkers = [];


/*-----------------------------------------------------------------------------------------*/
/* CONTROLLER */

// Create a new map object in global scope (for access) and add to #map div
var map = new google.maps.Map(document.getElementById('map'), initOptions);	

// create new search box object, assign it to #searchbox <input>,
// and bias it towards current map bounds
var input = document.getElementById('searchbox');
var searchBox = new google.maps.places.SearchBox(input);
map.addListener('bounds_changed', function() {
	searchBox.setBounds(map.getBounds());
});

// searchBox listens for user entering a search
searchBox.addListener('places_changed', function() {

	// when they do, getPlaces returns an array of possible place matches
	var places = searchBox.getPlaces();

	// select places[0] TODO: why? will this be correct every time?
	// TODO: need error checking here. Maybe test if ...geometry.location exists
	var place = places[0];		

	// set viewport on selected place and zoom in to street level
	map.setCenter(place.geometry.location);
	map.setZoom(streetZoom);

	// add place marker for selected place
	var searchMarker = addMarker(place.geometry.location, redIcon);	
})

// map listens for boundaries being changed (when user scrolls map OR when changed via search as above)
map.addListener('bounds_changed', function() {
	
	// query API, but not if map zoomed out too much - to prevent too many data	
	if (map.zoom <= minimum_zoom) {

		// alert user
		document.getElementById('alert').innerHTML = alertMessage;

	}
	else {

		// clear any previous alert
		document.getElementById('alert').innerHTML = '';

		// call police.uk API
		getStopsData();
	}	
})




/*-------------FUNCTIONS------------------------------------------------*/

function getStopsData() {
	// clear previous stop markers to stop overloading
	/*for (var i = 0; i < stopMarkers.length; i++) {
		// remove map reference from each marker
    	stopMarkers[i].setMap(null);
    } */
    // clear array of markers altogether
	//stopMarkers = [];	

	// get current bounds from getBounds object
	var current_bounds = map.getBounds();
	var min_lat = current_bounds.getSouthWest().lat();
	var min_lng = current_bounds.getSouthWest().lng();
	var max_lat = current_bounds.getNorthEast().lat();
	var max_lng = current_bounds.getNorthEast().lng();

	/* TEST: add markers at boundary points
	addMarker(current_bounds.getSouthWest(), blueIcon);
	addMarker(current_bounds.getNorthEast(), blueIcon); */

	// form search string for API request (https://data.police.uk/docs/method/stops-street/)
	var poly_1 = min_lat.toString() + ',' + min_lng.toString() + ':';
	var poly_2 = min_lat.toString() + ',' + max_lng.toString() + ':';
	var poly_3 = max_lat.toString() + ',' + max_lng.toString() + ':'; 
	var poly_4 = max_lat.toString() + ',' + min_lng.toString();
	var query = 'https://data.police.uk/api/stops-street?poly=' + poly_1 + poly_2 + poly_3 + poly_4;

	// query API. Creates JSON object of 'stops'
	var request = new XMLHttpRequest();
	request.open("GET", query); // async by default
	request.addEventListener("load", function() {
		
		// once loaded, parse the json string
		stops = JSON.parse(request.responseText);

		// add stops markers to map
		addStopsMarkers(stops);
	});
	// http://stackoverflow.com/questions/15123839/why-do-we-pass-null-to-xmlhttprequest-send
	request.send(null);	
}

/*
 * adds a marker with specified icon at specified location
 */
function addMarker(location, icon) {
	var markerOptions = {
		map : map,
		position : location,
		icon: icon
	};

	// animate marker if blue (therefore a stop)
	if (icon === blueIcon) {
		markerOptions.animation = google.maps.Animation.DROP;
	}

	return new google.maps.Marker(markerOptions);	
}

/*
 * takes a json object of stops and creates a marker for each
 */
function addStopsMarkers(stops) {
	for (stop of stops) {
		
		// TODO: markerOptions.animation = google.maps.Animation.DROP;		

		// convert coords returned by police.uk API into format required for google maps API
		var stopLocation = {
			lat : Number(stop.location.latitude), 
			lng: Number(stop.location.longitude)
		};

		// create marker
		var stopMarker = addMarker(stopLocation, blueIcon);

		// add each marker by pushing to array
		//stopMarkers.push(stopMarker);
	}
}








