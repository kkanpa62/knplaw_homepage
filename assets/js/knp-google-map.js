(function (window, document) {
  'use strict';

  var mapElements = Array.prototype.slice.call(document.querySelectorAll('[data-google-map]'));
  if (!mapElements.length) {
    return;
  }

  var FALLBACK_CENTER = { lat: 37.5665, lng: 126.9780 };

  function toFloat(value) {
    var parsed = parseFloat(value);
    return isFinite(parsed) ? parsed : null;
  }

  function getBooleanDatasetValue(el, key, defaultValue) {
    if (!Object.prototype.hasOwnProperty.call(el.dataset, key)) {
      return defaultValue;
    }
    var value = el.dataset[key];
    if (value === '') {
      return true;
    }
    return value.toLowerCase() === 'true';
  }

  function initialiseElement(el) {
    if (el.dataset.googleMapLoaded === 'true') {
      return;
    }

    var lat = toFloat(el.dataset.lat);
    var lng = toFloat(el.dataset.lng);
    var zoom = parseInt(el.dataset.zoom, 10);
    zoom = isFinite(zoom) ? zoom : 17;

    var mapOptions = {
      center: lat !== null && lng !== null ? { lat: lat, lng: lng } : FALLBACK_CENTER,
      zoom: zoom,
      scrollwheel: getBooleanDatasetValue(el, 'scrollwheel', false),
      streetViewControl: getBooleanDatasetValue(el, 'streetViewControl', false),
      mapTypeControl: getBooleanDatasetValue(el, 'mapTypeControl', false),
      fullscreenControl: getBooleanDatasetValue(el, 'fullscreenControl', false)
    };

    var map = new google.maps.Map(el, mapOptions);

    function placeMarker(position) {
      map.setCenter(position);
      var markerTitle = el.dataset.markerTitle || '';
      var marker = new google.maps.Marker({
        map: map,
        position: position,
        title: markerTitle || undefined
      });

      var infoWindowContent = el.dataset.markerInfo;
      if (infoWindowContent && getBooleanDatasetValue(el, 'markerInfoEnabled', false)) {
        var infoWindow = new google.maps.InfoWindow({
          content: infoWindowContent
        });
        infoWindow.open(map, marker);
      }

      var markerUrl = el.dataset.markerUrl;
      if (markerUrl) {
        var target = el.dataset.markerUrlTarget === '_self' ? '_self' : '_blank';
        marker.addListener('click', function () {
          window.open(markerUrl, target);
        });
      }
    }

    if (lat !== null && lng !== null) {
      placeMarker({ lat: lat, lng: lng });
      el.dataset.googleMapLoaded = 'true';
      return;
    }

    var address = el.dataset.address;
    if (!address) {
      console.warn('KNP map: Provide either coordinates or an address to render the map.');
      el.dataset.googleMapLoaded = 'true';
      return;
    }

    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, function (results, status) {
      if (status === 'OK' && results && results[0]) {
        placeMarker(results[0].geometry.location);
      } else {
        console.warn('KNP map: Failed to geocode address "%s" (%s).', address, status);
      }
      el.dataset.googleMapLoaded = 'true';
    });
  }

  function initAllMaps() {
    mapElements.forEach(initialiseElement);
  }

  window.knpInitGoogleMaps = initAllMaps;

  if (window.google && window.google.maps && typeof window.google.maps.Map === 'function') {
    initAllMaps();
    return;
  }

  if (!document.querySelector('script[data-knp-google-maps]')) {
    var apiKey = window.GOOGLE_MAPS_API_KEY || 'GOOGLE_MAPS_API_KEY';
    if (apiKey === 'GOOGLE_MAPS_API_KEY') {
      console.warn('KNP map: Replace GOOGLE_MAPS_API_KEY with a valid Google Maps API key before deploying.');
    }

    var script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.dataset.knpGoogleMaps = 'true';
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(apiKey) + '&callback=knpInitGoogleMaps';
    script.onerror = function () {
      console.error('KNP map: Failed to load the Google Maps JavaScript API.');
    };
    document.head.appendChild(script);
  }
})(window, document);
