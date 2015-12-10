var apiKey = "";
//global map object
var map = {};

/*
	store in google map markers format
*/
var markers = [];
/*
	structure like following, storing into db
	{
      "lat": null,
      "timestamp": "2015-10-27T18:01:29.599351+00:00",
      "lng": null,
      "creation_time": "2015-10-27T18:01:29.599325+00:00",
      "omlet_id": "kenny"
    }
*/
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

var debug_text = "";

var init = true;
// loadMapAPIs();
$.getScript("https://www.google.com/jsapi", function(data, textStatus, jqXHR){
	if (jqXHR.status == 200) {
		console.log("init map");
		google.load('maps', '3', { other_params: 'key=' + apiKey, 
			callback: function() {
		        map = new google.maps.Map(document.getElementById('map'), {
				zoom:20
			});

			Omlet.ready(function() {
				//get group info
				//for local testing
				
				/*
				account = {
					name: "Ricky",
					account: "Ricky123"
				};
				group.id = "Feed123";
				group.list = [
					{
						displayname: "Ricky",
						account: "Ricky123"
					},
					{
						displayname: "Darren",
						account: "Darren123"
					}
				]
				*/
				
				account = Omlet.getIdentity();		
				group.id = Omlet.scope.feed_key;
				//remove equal sign 
				group.id = group.id.replace(/\=/g, '');

				group.list = Omlet.getFeedMembers();
				
				checkGroup(group.id);					
				//get current location
				getLocation();

				//get all markers position
				getAllMarkers();
				
				setInterval(function() {					
					//get current location
					watchLocation();
					//get all markers position
					getAllMarkers();				
				}, 7000);			
			})
	    }});
					
	} else {
		console.log(textStatus);
	};
})	

//check group info exsited or not
function checkGroup(groupID) {
	$.ajax({
		url: '/group/' + groupID,
		type: 'GET',
    	contentType: 'application/json'
	})
	.done(function(data) {
		
	})
	.fail(function(err){
		uploadGroupInfo();
	});
}


function getLocation() {
	
    if (navigator.geolocation) {
    	
        navigator.geolocation.getCurrentPosition(function(position) {
        	
        	//self location
			myLatLng = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};

			uploadLocation(myLatLng);
        }, function(error) {        
        	alert(error);
        });
    } else {
        alert("Geolocation is not supported by this browser.");       
    }
}

function watchLocation() {
	
	navigator.geolocation.watchPosition(function(position) {
    	//self location    
		myLatLng = {
			lat: position.coords.latitude,
			lng: position.coords.longitude
		};

		uploadLocation(myLatLng);
    }, function(error) {
    	alert(error);
    });
}

function initMarkers(pos) {

	//show all pos on the map
  	for (var i = 0; i < pos.length; i++) {
  		if (pos[i].lat) {
  			var marker = new google.maps.Marker({
			    position: {
			    	lat: pos[i].lat, 
			    	lng: pos[i].lng},
			    map: map,
			    label: pos[i].omlet_id.charAt(0)
			});
			marker.setMap(map);
			markers.push(marker);	
  		} 	  		
	}	
}

//update markers on the client based on the return data from the server
function updateMarkers(pos) {

	for (var i = markers.length - 1; i >= 0; i--) {
		var postion = {
			lat: pos[i].lat,
			lng: pos[i].lng		
		}
		markers[i].setPosition(postion);
	};
}

//upload the location and Omlet info to the db
function uploadLocation(position) {

	$.ajax({
		url: '/marker/' + account.account,
		type: 'POST',
		dataType: 'application/json',
		data: JSON.stringify(position),
	})
	.done(function() {
	
	})
	.fail(function(err) {
		alert(err);
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

		//get valid positions from db
		var count = 0;
		var init = false;
		if (positions.length == 0) {
			init = true;
		} else {
			//clear the exsited positions
			positions =[];
		};		
		for (var i = data.markers.length - 1; i >= 0; i--) {
			//only store valid positions
			if(data.markers[i].lat && data.markers[i].lng) {
				positions.push(data.markers[i]);			
				count++;
			}
		}

		if (init || positions.length < count) {
			//initialize or new data added
			initMarkers(positions);
		} else {
			//only update client's own location		
			updateMarkers(positions);
		};
		
		updateCenter(positions);
	});

}

//upload group info to db
function uploadGroupInfo() {
	var markersName = [];
	group.list.forEach(function(member) {
		markersName.push(member.account);
	})
	var data = {
		"conversation_id": group.id,
		"title": account.name + "'s Location",
		"markers": markersName
	}
	$.ajax({
		url: '/group',
		type: 'POST',
		data: JSON.stringify(data),
    	contentType: 'application/json'
	})
	.done()
	.fail(function() {
		console.log("error");
	})
	
}

function updateCenter(pos) {
	var bound = new google.maps.LatLngBounds(); 
	for (i = 0; i < pos.length; i++) {
		if (pos[i].lat && pos[i].lng) {
			bound.extend(new google.maps.LatLng(pos[i].lat, pos[i].lng)); 	
		}; 			
	}
	map.setCenter(bound.getCenter());
}
