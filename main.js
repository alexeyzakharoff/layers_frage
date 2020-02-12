import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import Stamen from 'ol/source/Stamen';
import VectorLayer from 'ol/layer/Vector';
import Vector from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Stroke from 'ol/style/Stroke';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import * as olProj from 'ol/proj';
import {toLonLat} from 'ol/proj';
import {Icon, Style} from 'ol/style';
import Overlay from 'ol/Overlay';
import sync from 'ol-hashed';
import XYZ from 'ol/source/XYZ';

const container = document.getElementById('popup');
const content = document.getElementById('popup-content1');
const closer = document.getElementById('popup-closer');

const map = new Map({
  target: 'map',
  view: new View({
    center: olProj.fromLonLat([15.52, 48.18]),
    zoom: 14
  })
});
/* map.addLayer(new TileLayer({
  source: new Stamen({
    layer: 'terrain'
  })
}));
 */

sync(map);

const satLayer = new TileLayer({
  source: new XYZ({
    //attributions: ['Powered by Esri', 'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'],
    attributionsCollapsible: false,
    url: 'http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}',
    maxZoom: 23
  })
});

const baseLayer = new TileLayer({
  source: new Stamen({
    layer: 'terrain'
  })
});
map.addLayer(baseLayer);

const sat = document.getElementById('sat');
sat.addEventListener('click', function(event) {
  //Anderen Layer entfernen
  map.removeLayer(baseLayer);
  //Satelliten Layer hinzufügen
  map.addLayer(satLayer);
});

const base = document.getElementById('base');
base.addEventListener('click', function(event) {
  //Anderen Layer entfernen
  map.removeLayer(satLayer);
  //Satelliten Layer hinzufügen
  map.addLayer(baseLayer);
});

const verkehrStyle = layer.setStyle(new Style({ //Gestaltung der Feedbacks zum Thema "Verkehr"
  image: new Icon({
    anchor: [0, 1],
    scale: 0.04,
    src: 'data/feedback_blau.png'
  })
})); 

const ortskernStyle = layer.setStyle(new Style({ //Gestaltung der Feedbacks zum Thema "Ortskern"
    image: new Icon({
    anchor: [0, 1],
    scale: 0.04,
    src: 'data/feedback_grau.png'
  })
})); 

const gruenraumStyle = layer.setStyle(new Style({ //Gestaltung der Feedbacks zum Thema "Grünraum"
    image: new Icon({
    anchor: [0, 1],
    scale: 0.04,
    src: 'data/feedback_gruen.png'
  })
})); 

const overlay = new Overlay({
  element: document.getElementById('popup-container'),
  positioning: 'bottom-center',
  offset: [0, -10],
  autoPan: true,
  autoPanAnimation: {
    duration: 10
  }
});
map.addOverlay(overlay);
overlay.getElement().addEventListener('singleclick', function() {
  overlay.setPosition();
});

const overlay1 = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});
map.addOverlay(overlay1);

closer.onclick = function() {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

const gemaprima = new VectorLayer({
  source: new Vector({
    url: 'data/gemaprima.geojson',
    format: new GeoJSON()
  })
});
map.addLayer(gemaprima);
gemaprima.setZIndex(4);

const gruenraeume = new VectorLayer({
  source: new Vector({
    url: 'data/gruenraeume.geojson',
    format: new GeoJSON()
  })
});
map.addLayer(gruenraeume);
gruenraeume.setZIndex(5);

gruenraeume.setStyle(function(feature) {
  return new Style({
    fill: new Fill({
      color: 'rgba(58, 183, 38, 0.4'})
  });
});

const markers = new VectorLayer({
  source: new Vector({
    url: 'data/markers.geojson',
    format: new GeoJSON()
  })
});
map.addLayer(markers);
markers.setZIndex(7);

markers.setStyle(new Style({
  image: new Icon({
    anchor: [0.5, 0.5],
    scale: 0.07,
    src: 'data/baum.png'
  })
}));

const feedback = new VectorLayer({
  source: new Vector({
    url: 'https://student.ifip.tuwien.ac.at/geoweb/2019/g05/postgis_geojson.php',
    format: new GeoJSON()
  })
});
map.addLayer(feedback);
feedback.setZIndex(6);

/* feedback.setStyle(new Style({
  image: new Icon({
    anchor: [0, 1],
    scale: 0.04,
    src: 'data/feedback.png'
  })
})); */

feedback.setStyle(function(feature) {
  let feedbackStyle; //Variable für die Gestaltung (Icon) des Layers
  const feedbackThemen = feature.getProperties(); //Konstante für das Thema des Feedbacks
  for (const feedbackThema in feedbackThemen) {
  if (feedbackThema = 'Verkehr') {
    feedbackStyle = verkehrStyle;
  } else if (feedbackThema = 'Ortskern') {
    feedbackStyle = ortskernStyle;
  } else {
    feedbackStyle = gruenraumStyle;
  }
};

map.on('singleclick', function(e) {
  let markup = '';
  let foundFeature = false;
  map.forEachFeatureAtPixel(e.pixel, function(feature) {
    if (foundFeature) {
      return;
    }
    foundFeature = true;
    const properties = feature.getProperties();
    markup += markup + '<hr><table>';
    for (const property in properties) {
      if (property != 'geometry' && property != 'Name' && property != 'fill') {
        markup += '<tr><th>' + property + '</th><td>' + properties[property] + '</td></tr>';
      }
    }
    markup += '</table>';
  }, {
    layerFilter: function(l) {
      const isLayer = (l === gruenraeume || l === feedback);
      return isLayer;
    }
  });
  if (markup) {
    document.getElementById('popup-container').innerHTML = markup;
    overlay.setPosition(e.coordinate);
  } else {
    const pos = toLonLat(e.coordinate);
    const anklicken = '<a href="https://student.ifip.tuwien.ac.at/geoweb/2019/g05/feedback_gemaprima.php?pos=' + pos.join(' ') + '" style="color: #ffffff">Hier fühle ich mich wohl!</a>';
    document.getElementById('popup-container').innerHTML = anklicken;
    overlay.setPosition(e.coordinate);
   
  }
});

function calculateStatistics() {
  const feedbacks = feedback.getSource().getFeatures();
  const gemeinden = gemaprima.getSource().getFeatures();
  if (feedbacks.length > 0 && gemeinden.length > 0) {
    for (let i = 0, ii = feedbacks.length; i < ii; ++i) {
      const feedback1 = feedbacks[i];
      for (let j = 0, jj = gemeinden.length; j < jj; ++j) {
        const gemeinde = gemeinden[j];
        let count = gemeinde.get('FEEDBACKS') || 0;
        const feedbackGeom = feedback1.getGeometry();
        if (feedbackGeom &&
    gemeinde.getGeometry().intersectsCoordinate(feedbackGeom.getCoordinates())) {
          ++count;
        }
        gemeinde.set('FEEDBACKS', count);
      }
    }
  }
}
gemaprima.getSource().once('change', calculateStatistics);
feedback.getSource().once('change', calculateStatistics);


gemaprima.setStyle(function(feature) {
  let fillColor;
  const feedbackCount = feature.get('FEEDBACKS');
  if (feedbackCount <= 1) { // if feedbackCount > verkehrCount
    fillColor = 'rgba(240, 226, 211, 0.4';
  } else if (feedbackCount < 5) { // if verkehrCount > feedbackCount
    fillColor = 'rgba(238, 176, 110, 0.7)';
  } else {
    fillColor = 'rgba(240, 145, 43, 0.7)';
  }
  return new Style({
    fill: new Fill({
      color: fillColor
    }),
    stroke: new Stroke({
      color: 'rgba(4, 4, 4, 1)',
      width: 1
    })
  });
});