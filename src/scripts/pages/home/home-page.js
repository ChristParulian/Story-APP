import CONFIG from '../../config';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

class HomePage {
  constructor() {
    this._stories = [];
    this._map = null;
    this._markers = [];
  }

  async render() {
    return `
      <section class="content-container">
        <h1 class="page-title">Cerita Terkini</h1>
        
        <div class="stories-grid" id="storiesContainer">
          <!-- Stories will be loaded here -->
        </div>
        
        <div class="map-container">
          <h2>Lokasi Cerita</h2>
          <div id="storyMap" style="height: 400px; width: 100%;"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this._fetchStories();
    this._initMap();
    this._renderStories();
    this._plotMarkers();
  }

  async _fetchStories() {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY)}`
        }
      });
      const data = await response.json();
      this._stories = data.listStory;
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    }
  }

  _initMap() {
    this._map = L.map('storyMap').setView([-2.5489, 118.0149], 5); // Center on Indonesia
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this._map);

    delete L.Icon.Default.prototype._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
  });
  }

  _renderStories() {
    const container = document.getElementById('storiesContainer');
    container.innerHTML = this._stories.map(story => `
      <article class="story-card">
        <img src="${story.photoUrl}" alt="Story by ${story.name}" class="story-image">
        <div class="story-content">
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <time datetime="${story.createdAt}">
            ${new Date(story.createdAt).toLocaleDateString()}
          </time>
        </div>
      </article>
    `).join('');
  }

  _plotMarkers() {
    // Clear existing markers
    this._markers.forEach(marker => marker.remove());
    this._markers = [];

    this._stories.forEach(story => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon])
          .addTo(this._map)
          .bindPopup(`<b>${story.name}</b><p>${story.description.substring(0, 50)}...</p>`);
        this._markers.push(marker);
      }
    });

    // Auto-zoom to fit all markers
    if (this._markers.length > 0) {
      const group = new L.featureGroup(this._markers);
      this._map.fitBounds(group.getBounds());
    }
  }
}

export default HomePage;