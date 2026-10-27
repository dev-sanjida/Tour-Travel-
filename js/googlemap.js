/*----------------------------------------------------*/
/* Travel Agency - Google Map
/* Pages: contacts, flights, hotels, cars, cruises and their search and
/* booking pages (the .google-map element).
/*
/* Each map reads its settings from data attributes on its element:
/*   data-lat, data-lng  map centre
/*   data-zoom           zoom level (1 = world, 18 = street)
/*   data-style          "gray" or "teal" colour scheme
/*   data-marker         optional marker image, e.g. images/rmarker.png
/*
/* Google Maps needs your own API key: create one at
/* https://developers.google.com/maps/documentation/javascript/get-api-key
/* and paste it below. Until a key is set, the map area shows a plain panel
/* instead of loading Google Maps, so the page has no console errors.
/*----------------------------------------------------*/
(function () {
  'use strict';

  var GOOGLE_MAPS_API_KEY = 'AIzaSyDjCcpdtjph61I97EtkUsR7KqvxCVQ8ORw';

  var STYLES = {
    gray: [
      { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#444444' }] },
      { featureType: 'landscape', elementType: 'all', stylers: [{ color: '#f2f2f2' }] },
      { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
      { featureType: 'road', elementType: 'all', stylers: [{ saturation: -100 }, { lightness: 45 }] },
      { featureType: 'road.highway', elementType: 'all', stylers: [{ visibility: 'simplified' }] },
      { featureType: 'road.arterial', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', elementType: 'all', stylers: [{ visibility: 'off' }] },
      { featureType: 'water', elementType: 'all', stylers: [{ color: '#979797' }, { visibility: 'on' }] }
    ],
    teal: [
      { featureType: 'landscape.natural', elementType: 'geometry.fill', stylers: [{ visibility: 'on' }, { color: '#e0efef' }] },
      { featureType: 'poi', elementType: 'geometry.fill', stylers: [{ visibility: 'on' }, { color: '#c0e8e8' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ lightness: 100 }, { visibility: 'simplified' }] },
      { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit.line', elementType: 'geometry', stylers: [{ visibility: 'on' }, { lightness: 700 }] },
      { featureType: 'water', elementType: 'all', stylers: [{ color: '#7dcdcd' }] }
    ]
  };

  var maps = document.querySelectorAll('.google-map');
  if (!maps.length) return;

  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
    maps.forEach(function (el) { el.classList.add('map-placeholder'); });
    return;
  }

  // Called by the Maps API once it has loaded (see "callback=" below).
  window.googlemapinit = function () {
    maps.forEach(function (el) {
      var center = new window.google.maps.LatLng(parseFloat(el.dataset.lat), parseFloat(el.dataset.lng));
      var map = new window.google.maps.Map(el, {
        zoom: parseInt(el.dataset.zoom, 10) || 12,
        center: center,
        styles: STYLES[el.dataset.style] || STYLES.gray,
        scrollwheel: false
      });
      if (el.dataset.marker) {
        new window.google.maps.Marker({ position: center, map: map, icon: el.dataset.marker });
      }
    });
  };

  // Load the Maps JavaScript API asynchronously, as Google recommends:
  // https://developers.google.com/maps/documentation/javascript/load-maps-js-api
  var script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(GOOGLE_MAPS_API_KEY) + '&loading=async&callback=googlemapinit';
  script.async = true;
  document.head.appendChild(script);
})();
