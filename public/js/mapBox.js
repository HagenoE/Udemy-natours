export const displayMap = (locations) => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiZWxyaWNlZCIsImEiOiJjbHN5eGIyeWMwajI4MnFwMjFmOWN4N3pyIn0.epjvcWJpW_9-jSTJ4-kb-A';

  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/elriced/clsyydnv9002e01p81ra82cfb', // style URL
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((location) => {
    const element = document.createElement('div');
    element.className = 'maker';

    new mapboxgl.Marker(element).setLngLat(location.coordinates).addTo(map);

    new mapboxgl.Popup()
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day} : ${location.description}</p>`)
      .addTo(map);

    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 200,
      left: 100,
      right: 100,
    },
  });
};
