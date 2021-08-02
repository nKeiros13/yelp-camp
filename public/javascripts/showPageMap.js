mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: "map", // container ID
	style: "mapbox://styles/mapbox/light-v10", // style URL
	center: camp.geometry.coordinates, // starting position [lng, lat]
	zoom: 8, // starting zoom
});

new mapboxgl.Marker()
	.setLngLat(camp.geometry.coordinates)
	// .setPopup(
	// 	new mapboxgl.setPopup({ offset: 25 }).setHTML(`<h3>${camp.title}</h3>`)
	// )
	.addTo(map);
