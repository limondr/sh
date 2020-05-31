function initMap(selector, config) {
  return new Promise((resolve, reject) => {
    try {
      ymaps.ready(function() {
        var myMap = new ymaps.Map(selector, config);

        var clusterer = new ymaps.Clusterer({
          clusterDisableClickZoom: true,
          clusterOpenBalloonOnClick: true,
          clusterBalloonContentLayout: "cluster#balloonCarousel",
          clusterBalloonPanelMaxMapArea: 0,
          clusterBalloonContentLayoutWidth: 400,
          clusterBalloonContentLayoutHeight: 260,
          clusterBalloonPagerSize: 5
        });

        myMap.geoObjects.add(clusterer);
        _clusterer = clusterer;

        resolve({
          map: myMap,
          clusterer
        });
      });
    } catch (error) {
      reject(error);
    }
  });
}

let _clusterer;

async function geocoder(coords) {
  var response = await ymaps.geocode(coords);

  return response.geoObjects.get(0).getAddressLine();
}

function createPlacemark(coords, config) {
  var placemark = new ymaps.Placemark(coords, config);

  _clusterer.add(placemark);

  return placemark;
}

export { initMap, geocoder, createPlacemark };
