let GMap

// Initialize and add the map
function initMap() {
    //McMaster university logitude and latitude
	const mcmasterLocation = { lat: 43.26094539110192, lng: -79.91916639360102 };
    
    //Create the map centered at mcmaster
    GMap = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: mcmasterLocation,
	})

	setTimeout(getMarkers, 2000);
}

const addCurrLocation = () => {
	// Try HTML5 geolocation.
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			(position) => {
			const pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude,
			};
			GMap.setCenter(pos);
			addMarker(pos.lat, pos.lng, "curr-position")
			RGeocode(pos.lat.toString() + "," + pos.lng.toString())
			}, () => {
			handleLocationError(true, infoWindow, map.getCenter());
			}
		);
	} else {
		// Browser doesn't support Geolocation
		handleLocationError(false, infoWindow, map.getCenter());
	}
}

async function addMarker(latNumber, longNumber, address) {
	try {
		if (isNaN(latNumber) || isNaN(longNumber)) {
			console.error(`One of the inputs of ${latNumber}, ${longNumber} is not a number`)
			return
		}
	} catch (err) {
		console.error(`One of the inputs of ${latNumber}, ${longNumber} aren't correct`)
		return
	}

	await firebase.firestore().collection('/LocationData').add({
		lat: latNumber,
		long: longNumber,
		address: address
	})

	getMarkers()
}

async function getMarkers() {
	const c = await firebase.firestore().collection('/LocationData').get()
	const markers = []
	globalMarkers = []
	c.forEach(e => {
		markers.push(e.data())

		const marker = new google.maps.Marker({
			position: {
				lng: e.data().long,
				lat: e.data().lat
			},
			map: GMap
		})
		globalMarkers.push(marker)
	})
	//console.log(markers)
}

var globalMarkers = []
var toggle = false
const toggleMarkers = () => {
	var elem = document.getElementById("toggle")

	if (!toggle) {
		globalMarkers.forEach(e => {
			e.setMap(null);
		})
		elem.classList.add("dark")
		elem.innerHTML = "Click to Turn Markers On"
	} else {
		getMarkers()
		elem.classList.remove("dark")
		elem.innerHTML = "Click to Turn Markers Off"
	}
	toggle = !toggle
}

function Geocode(e) {
	e.preventDefault();

	var location = document.getElementById("location-input").value;
	axios.get("https://maps.googleapis.com/maps/api/geocode/json?", {
		params:{
			address: location,
			region: "ca",
			key:'(Google maps geocode API key)'
		}
	}).then((response) => {
		//Log full response
		//console.log(response);
		//Formatted address
		formattedAddress  = response.data.results[0].formatted_address;
		formattedAddressOutput = `
			<ul class="list-group">
				<li class="list-group-item">${formattedAddress}</li>
			</ul>`;
		
		//Address Components
		var addressComponents = response.data.results[0].address_components
		var addressComponentsOutput = '<ul class"list-group">';
		for(var i = 0; i < addressComponents.length; i++) {
			addressComponentsOutput +=`
				<li class="list-group-item">
					<strong>${addressComponents[i].types[0]}</strong> : ${addressComponents[i].long_name}
				</li>`;
		}
		addressComponentsOutput += '</ul>'

		//Geometry
		var lat = response.data.results[0].geometry.location.lat;
		var lng = response.data.results[0].geometry.location.lng;
		var geometryOutput = ` 
		<ul class="list-group">
			<li class="list-group-item"><strong>Latitude</strong>: ${lat}</li>
			<li class="list-group-item"><strong>Longitude</strong>: ${lng}</li>
		</ul>`;

		addMarker(lat, lng, formattedAddress)
		GMap.setCenter({lat: lat, lng: lng});

		document.getElementById('formatted-address').innerHTML = formattedAddressOutput;
		document.getElementById('address-components').innerHTML = addressComponentsOutput;
		document.getElementById('geometry').innerHTML = geometryOutput;
	}).catch(function(error){
		console.log(error);
	})
}

function RGeocode(latlng) {
	axios.get("https://maps.googleapis.com/maps/api/geocode/json?", {
		params:{
			latlng: latlng,
			key:'(Google maps geocode API key)'
		}
	}).then((response) => {
		//Log full response
		//console.log(response);
		//Formatted address
		formattedAddress  = response.data.results[0].formatted_address;
		formattedAddressOutput = `
			<ul class="list-group">
				<li class="list-group-item">${formattedAddress}</li>
			</ul>`;
		
		//Address Components
		var addressComponents = response.data.results[0].address_components
		var addressComponentsOutput = '<ul class="list-group" >';
		for(var i = 0; i < addressComponents.length; i++) {
			addressComponentsOutput +=`
				<li >
					<strong>${addressComponents[i].types[0]}</strong> : ${addressComponents[i].long_name}
				</li>`;
		}
		addressComponentsOutput += '</ul>'

		//Geometry
		var lat = response.data.results[0].geometry.location.lat;
		var lng = response.data.results[0].geometry.location.lng;
		var geometryOutput = ` 
		<ul class="list-group" id="small">
			<li class="list-group-item"><strong>Latitude</strong>: ${lat}</li>
			<li class="list-group-item"><strong>Longitude</strong>: ${lng}</li>
		</ul>`;

		document.getElementById('formatted-address').innerHTML = formattedAddressOutput;
		document.getElementById('address-components').innerHTML = addressComponentsOutput;
		document.getElementById('geometry').innerHTML = geometryOutput;
	}).catch(function(error){
		console.log(error);
	})
}