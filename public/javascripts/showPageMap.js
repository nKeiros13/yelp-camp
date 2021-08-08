mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: "map", // container ID
	style: "mapbox://styles/mapbox/dark-v10", // style URL
	center: camp.geometry.coordinates, // starting position [lng, lat]
	zoom: 8, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl(), "bottom-left");

new mapboxgl.Marker()
	.setLngLat(camp.geometry.coordinates)
	.setPopup(
		new mapboxgl.Popup({ offset: 25 }).setHTML(
			`<h5>${camp.title}</h5> <p>${camp.location}</p>`
		)
	)
	.addTo(map);
