import HomePresenter from './home-presenter';

class HomePage {
  constructor() {
    this._presenter = new HomePresenter(this);
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
        
        <div class="map-container" id="mapContainer">
          <h2>Lokasi Cerita</h2>
          <div id="storyMap" style="height: 400px;"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this._presenter.initialize();
  }

  renderStories(stories) {
    const container = document.getElementById('storiesContainer');
    container.innerHTML = stories.map(story => `
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
  }

  setupPaginationControls({ totalPages, currentPage, onPrev, onNext }) {
    const paginationContainer = document.getElementById('paginationControls');
    
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    paginationContainer.innerHTML = `
      <button class="pagination-btn prev-btn" id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i> Sebelumnya
      </button>
      <span class="page-info">Halaman ${currentPage} dari ${totalPages}</span>
      <button class="pagination-btn next-btn" id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>
        Selanjutnya <i class="fas fa-chevron-right"></i>
      </button>
    `;

    document.getElementById('prevPage')?.addEventListener('click', onPrev);
    document.getElementById('nextPage')?.addEventListener('click', onNext);
  }

  updatePaginationControls({ totalPages, currentPage }) {
    this.setupPaginationControls({
      totalPages,
      currentPage,
      onPrev: () => this._presenter._goToPrevPage(),
      onNext: () => this._presenter._goToNextPage()
    });
  }

  showLoading(isLoading) {
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
      loader.style.display = isLoading ? 'flex' : 'none';
    }
    document.getElementById('storiesContainer').style.opacity = isLoading ? '0.5' : '1';
  }

  showError(message) {
    const container = document.getElementById('storiesContainer');
    container.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        ${message}
      </div>
    `;
  }

  hideMapContainer() {
    const mapContainer = document.getElementById('mapContainer');
    if (mapContainer) {
      mapContainer.style.display = 'none';
    }
  }
}

export default HomePage;