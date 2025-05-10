import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CONFIG from '../config.js';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

class StoryMap {
  constructor(mapElementId) {
    this.map = L.map(mapElementId).setView([-2.5489, 118.0149], 5);
    this.markers = [];
    this._initBaseLayers();
  }

  _initBaseLayers() {
    this.baseLayers = {
      'Street': L.tileLayer(
        `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${CONFIG.MAPTILER_API_KEY}`,
        {
          attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> ' +
                     '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>'
        }
      ),
      'Satellite': L.tileLayer(
        `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${CONFIG.MAPTILER_API_KEY}`,
        {
          attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> ' +
                     '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>'
        }
      )
    };

    this.baseLayers['Street'].addTo(this.map);
    L.control.layers(this.baseLayers, null, { position: 'topright' }).addTo(this.map);
  }

  plotMarkers(stories) {
    this.clearMarkers();
    
    stories.forEach(story => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon])
          .addTo(this.map)
          .bindPopup(`
            <b>${story.name}</b>
            <p>${story.description.substring(0, 100)}${story.description.length > 100 ? '...' : ''}</p>
            <img src="${story.photoUrl}" style="max-width: 150px; max-height: 100px;">
          `);
        this.markers.push(marker);
      }
    });

    if (this.markers.length > 0) {
      const group = new L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds());
    }
  }

  clearMarkers() {
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];
  }
}

export default StoryMap;