var mapUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBcXmdCcC6w1sMcyoFfXT5fSZOLulLiCow";
//global map object
var map = {};
//global markers list
var markers = [];
var positions = [];
//current position
var myLatLng = {};
//user account info
var account = {};
//group list info
var group = {
	id: "",
	list: []
};

var init = true;
// loadMapAPIs();
$.getScript("https://www.google.com/jsapi", function(data, textStatus, jqXHR){
	if (jqXHR.status == 200) {
		console.log("init map");
		google.load('maps', '3', { other_params: 'key=AIzaSyBcXmdCcC6w1sMcyoFfXT5fSZOLulLiCow', 
			callback: function() {
		        map = new google.maps.Map(document.getElementById('map'), {
				zoom:15
			});

			Omlet.ready(function() {
				//get group info
				//for local testing
				
				
				// account = {
				// 	name: "Ricky",
				// 	account: "Ricky123"
				// };
				// group.id = "Feed123";
				// group.list = [
				// 	{
				// 		displayname: "Ricky",
				// 		account: "Ricky123"
				// 	},
				// 	{
				// 		displayname: "Darren",
				// 		account: "Darren123"
				// 	}
				// ]
				

				account = Omlet.getIdentity();		
				group.id = Omlet.scope.feed_key;
				//remove equal sign 
				group.id = group.id.replace(/\=/g, '');

				var text = 'omlet_id:' + account.account
						+ 'omlet_name:' + account.name
						+ 'group_id:' + group.id;
				$("#name").text(text);
				console.log(group.id);

				group.list = Omlet.getFeedMembers();	
				

				uploadGroupInfo();					
				//get current location
				getLocation();

				//get all markers position
				getAllMarkers();
				
				// setInterval(function() {				
				// 	//get current location
				// 	getLocation();
				// 	//get all markers position
				// 	getAllMarkers();				
				// }, 2000);			
			})
	    }});
					
	} else {
		console.log(textStatus);
	};
})	

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
        	//self location
			myLatLng = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			

			if (positions.length == 1) {
				initMarkers(positions);	
			};
			
			updateLocation(myLatLng);
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function initMarkers(positions) {
	
	if (positions.length == 0) {
		//init
		
		var myMarker = new google.maps.Marker({
			position: {
				lat: myLatLng.lat, 
				lng: myLatLng.lng
			},
			map: map,
			label: account.name.charAt(0)
		});
		//show users on the map
		myMarker.setMap(map);	
		markers.push(myMarker);
		positions.push(myLatLng);
	} else {
		//remove the exsiting element
		console.log("length is " + positions.length)
		markers.pop();
		//show all positions on the map
	  	for (var i = 0; i < positions.length; i++) {
	  		if (positions[i].lat) {
	  			var marker = new google.maps.Marker({
				    position: {
				    	lat: positions[i].lat, 
				    	lng: positions[i].lng},
				    map: map,
				    label: positions[i].omlet_id.charAt(0)
				});
				marker.setMap(map);
				markers.push(marker);	
	  		} else {
	  			continue;
	  		};	  		
		}	
	};
	
	//update the center of the map
	updateCenter(positions);
}

function updateMarkers(positions) {

	console.log("updating the markers")
	for (var i = markers.length - 1; i >= 0; i--) {
		var postion = {
			lat: positions[i].lat,
			lng: positions[i].lng
			// omlet_id: account.name
		}
		console.log(postion);
		markers[i].setPosition(postion);
	};
}

function updateLocation(position) {
	//send the location and Omlet info to the db
	$.ajax({
		url: '/marker/' + account.account,
		type: 'POST',
		dataType: 'application/json',
		data: JSON.stringify(position),
	})
	.done(function() {
		console.log("upload my location");
	})
	.fail(function(err) {
		console.log(err);
	})
}

//get the latest postion of all markers
function getAllMarkers() {
	$.ajax({
		url: '/group/' + group.id,
		type: 'GET',
    	contentType: 'application/json'
	})
	.done(function(data) {
		//update all markers
		positions = data.markers;
		// positions.forEach(function(marker) {
		// 	lat: marker.lat,
		// 	lng: marker.lng
		// })
		if (init) {
			initMarkers(positions);
		};
		updateMarkers(positions);
		updateCenter(positions);
	});

}

//upload group info to db
function uploadGroupInfo(callback) {
	var markers = [];
	group.list.forEach(function(member) {
		markers.push(member.account);
	})
	var data = {
		"conversation_id": group.id,
		"title": account.name + "'s Location",
		"markers": markers
	}
	$.ajax({
		url: '/group',
		type: 'POST',
		data: JSON.stringify(data),
    	contentType: 'application/json'
	})
	.done(callback)
	.fail(function() {
		console.log("error");
	})
	
}

function updateCenter(positions) {
	var bound = new google.maps.LatLngBounds(); 
	for (i = 0; i < positions.length; i++) {
		if (positions[i].lat && positions[i].lng) {
			bound.extend(new google.maps.LatLng(positions[i].lat, positions[i].lng)); 	
		}; 			
	}
	
	map.setCenter(bound.getCenter());
}
