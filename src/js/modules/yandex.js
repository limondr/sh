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

        var temp__clusterer = new ymaps.Clusterer({
            clusterDisableClickZoom: true,
            clusterOpenBalloonOnClick: false,
            clusterBalloonContentLayout: "cluster#balloonCarousel"
          });

        myMap.geoObjects.add(clusterer);
        myMap.geoObjects.add(temp__clusterer);
        _clusterer = clusterer;
        _temp__clusterer = temp__clusterer;

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

let temp__placemark;
let _clusterer;
let _temp__clusterer;

async function geocoder(coords) {
  var response = await ymaps.geocode(coords);

  return response.geoObjects.get(0).getAddressLine();
}

function createPlacemark(coords, config) {
  var placemark = new ymaps.Placemark(coords, config);

  _clusterer.add(placemark);

  return placemark;
}

function createTempPlacemark(coords, config) {
    temp__placemark = new ymaps.Placemark(coords, config);
    try {
        _temp__clusterer.add(temp__placemark);
    } catch (error) {
        console.log(error);
    }
    return temp__placemark;
}

function destroyTempPlacemark() {
    try {
        if(temp__placemark !== undefined && temp__placemark !== null) {
            _temp__clusterer.remove(temp__placemark);
            temp__placemark = null;
        }
    } catch (error) {
        console.log(error);
    }
}

export { initMap, geocoder, createPlacemark, createTempPlacemark, destroyTempPlacemark };
