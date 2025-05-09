import CONFIG from '../../config';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

class HomePage {
  constructor() {
    this._allStories = [];
    this._currentStories = [];
    this._map = null;
    this._markers = [];
    this._currentPage = 1;
    this._pageSize = 6;
    this._isLoading = false;
    this._baseLayers = {
      'Street': null,
      'Satellite': null
    };
  }

  async render() {
    return `
      <section class="content-container">
        <h1 class="page-title">Cerita Terkini</h1>
        
        <div class="loading-indicator" id="loadingIndicator">
          <div class="spinner"></div>
          <p>Memuat cerita...</p>
        </div>
        
        <div class="stories-grid" id="storiesContainer"></div>
        
        <div class="pagination" id="paginationControls"></div>
        
        <div class="map-container">
          <h2>Lokasi Cerita</h2>
          <div id="storyMap"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._initMap();
    await this._loadAllStories();
    this._setupPagination();
    this._renderCurrentPage();
  }

  async _loadAllStories() {
    this._showLoading(true);
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories?size=100`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY)}`
        }
      });
      const data = await response.json();
      this._allStories = data.listStory;
    } catch (error) {
      console.error('Failed to fetch stories:', error);
      this._showError('Gagal memuat cerita');
    } finally {
      this._showLoading(false);
    }
  }

  _renderCurrentPage() {
    const startIdx = (this._currentPage - 1) * this._pageSize;
    this._currentStories = this._allStories.slice(startIdx, startIdx + this._pageSize);
    
    const container = document.getElementById('storiesContainer');
    container.innerHTML = this._currentStories.map(story => `
      <article class="story-card">
        <img src="${story.photoUrl}" alt="Story by ${story.name}" class="story-image" 
             onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
        <div class="story-content">
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <time datetime="${story.createdAt}">
            ${new Date(story.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </time>
          ${story.lat && story.lon ? `
            <div class="story-location">
              <i class="fas fa-map-marker-alt"></i>
              Lokasi: ${story.lat.toFixed(3)}, ${story.lon.toFixed(3)}
            </div>
          ` : ''}
        </div>
      </article>
    `).join('');

    this._plotMarkers();
  }

  _setupPagination() {
    const totalPages = Math.ceil(this._allStories.length / this._pageSize);
    const paginationContainer = document.getElementById('paginationControls');
    
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    paginationContainer.innerHTML = `
      <button class="pagination-btn prev-btn" id="prevPage" ${this._currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i> Sebelumnya
      </button>
      <span class="page-info">Halaman ${this._currentPage} dari ${totalPages}</span>
      <button class="pagination-btn next-btn" id="nextPage" ${this._currentPage === totalPages ? 'disabled' : ''}>
        Selanjutnya <i class="fas fa-chevron-right"></i>
      </button>
    `;

    document.getElementById('prevPage').addEventListener('click', () => {
      this._currentPage--;
      this._renderCurrentPage();
      this._updatePaginationControls();
    });

    document.getElementById('nextPage').addEventListener('click', () => {
      this._currentPage++;
      this._renderCurrentPage();
      this._updatePaginationControls();
    });
  }

  _updatePaginationControls() {
    const totalPages = Math.ceil(this._allStories.length / this._pageSize);
    const paginationContainer = document.getElementById('paginationControls');
    
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    paginationContainer.innerHTML = `
      <button class="pagination-btn prev-btn" id="prevPage" ${this._currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i> Sebelumnya
      </button>
      <span class="page-info">Halaman ${this._currentPage} dari ${totalPages}</span>
      <button class="pagination-btn next-btn" id="nextPage" ${this._currentPage === totalPages ? 'disabled' : ''}>
        Selanjutnya <i class="fas fa-chevron-right"></i>
      </button>
    `;

    document.getElementById('prevPage').addEventListener('click', () => {
      this._currentPage--;
      this._renderCurrentPage();
      this._updatePaginationControls();
    });

    document.getElementById('nextPage').addEventListener('click', () => {
      this._currentPage++;
      this._renderCurrentPage();
      this._updatePaginationControls();
    });
  }

  _showLoading(isLoading) {
    this._isLoading = isLoading;
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
      loader.style.display = isLoading ? 'flex' : 'none';
    }
    document.getElementById('storiesContainer').style.opacity = isLoading ? '0.5' : '1';
  }

  _showError(message) {
    const container = document.getElementById('storiesContainer');
    container.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        ${message}
      </div>
    `;
  }

  _initMap() {
    this._map = L.map('storyMap').setView([-2.5489, 118.0149], 5);

    // MapTiler API Key
    const apiKey = 'LWXYHfZ6vqc0OB0xURAz';

    // Define base layers
    this._baseLayers['Street'] = L.tileLayer(
      `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${apiKey}`,
      {
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> ' +
                     '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>'
      }
    );

    this._baseLayers['Satellite'] = L.tileLayer(
      `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${apiKey}`,
      {
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> ' +
                     '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>'
      }
    );

    // Add default layer
    this._baseLayers['Street'].addTo(this._map);

    // Add layer control
    L.control.layers(this._baseLayers, null, {
      position: 'topright'
    }).addTo(this._map);
  }

  _plotMarkers() {
    // Clear existing markers
    this._markers.forEach(marker => this._map.removeLayer(marker));
    this._markers = [];

    // Add new markers
    this._currentStories.forEach(story => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon])
          .addTo(this._map)
          .bindPopup(`
            <b>${story.name}</b>
            <p>${story.description.substring(0, 100)}${story.description.length > 100 ? '...' : ''}</p>
            <img src="${story.photoUrl}" style="max-width: 150px; max-height: 100px;">
          `);
        this._markers.push(marker);
      }
    });

    // Auto-zoom if there are markers
    if (this._markers.length > 0) {
      const group = new L.featureGroup(this._markers);
      this._map.fitBounds(group.getBounds());
    }
  }
}

export default HomePage;