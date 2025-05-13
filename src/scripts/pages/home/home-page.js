import HomePresenter from "./home-presenter";
import { generateLoadingIndicatorTemplate } from "../../templates";

class HomePage {
  constructor() {
    this._presenter = new HomePresenter(this);
  }

  async render() {
    return `
    <section class="content-container page-transition ${document.startViewTransition ? "" : "active"}">
      <h1 class="page-title">Cerita Terkini</h1>
      
      ${generateLoadingIndicatorTemplate()}
      
      <div class="stories-grid" id="storiesContainer"></div>
      
      <div class="pagination" id="paginationControls"></div>
      
      <div class="map-container" id="mapContainer" style="z-index: 1;">
        <h2>Lokasi Cerita</h2>
        <div id="storyMap" style="height: 400px;"></div>
      </div>
    </section>
  `;
  }

  async afterRender() {
    await this._presenter.initialize();
    this._setupImageErrorHandlers();
  }

  renderStories(stories) {
    const container = document.getElementById("storiesContainer");
    container.innerHTML = stories
      .map(
        (story) => `
      <article class="story-card">
        <img src="${story.photoUrl}" alt="Gagal memuat gambar ${story.name}" class="story-image"
             data-story-id="${story.id}" loading="lazy">
        <div class="story-content">
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <time datetime="${story.createdAt}">
            ${new Date(story.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
          ${
            story.lat && story.lon
              ? `
            <div class="story-location">
              <i class="fas fa-map-marker-alt"></i>
              Lokasi: ${story.lat.toFixed(3)}, ${story.lon.toFixed(3)}
            </div>
          `
              : ""
          }
        </div>
      </article>
    `,
      )
      .join("");
  }

  _setupImageErrorHandlers() {
    const images = document.querySelectorAll(".story-image");
    images.forEach((img) => {
      img.onerror = () => {
        img.src =
          "https://via.placeholder.com/300x200?text=Gambar+Tidak+Tersedia";
        img.style.objectFit = "cover";
        img.style.backgroundColor = "#f5f5f5";
        img.onerror = null; // Prevent infinite loop
      };
    });
  }

  setupPaginationControls({ totalPages, currentPage, onPrev, onNext }) {
    const paginationContainer = document.getElementById("paginationControls");

    if (totalPages <= 1) {
      paginationContainer.innerHTML = "";
      return;
    }

    paginationContainer.innerHTML = `
      <button class="pagination-btn prev-btn" id="prevPage" ${
        currentPage === 1 ? "disabled" : ""
      }>
        <i class="fas fa-chevron-left"></i> Prev
      </button>
      <span class="page-info">${currentPage} dari ${totalPages}</span>
      <button class="pagination-btn next-btn" id="nextPage" ${
        currentPage === totalPages ? "disabled" : ""
      }>
        Next <i class="fas fa-chevron-right"></i>
      </button>
    `;

    document.getElementById("prevPage")?.addEventListener("click", onPrev);
    document.getElementById("nextPage")?.addEventListener("click", onNext);
  }

  updatePaginationControls({ totalPages, currentPage }) {
    this.setupPaginationControls({
      totalPages,
      currentPage,
      onPrev: () => this._presenter._goToPrevPage(),
      onNext: () => this._presenter._goToNextPage(),
    });
  }

  showLoading(isLoading) {
    let loadingElement = document.querySelector(".loading-overlay");

    if (!loadingElement) {
      loadingElement = document.createElement("div");
      loadingElement.innerHTML = generateLoadingIndicatorTemplate();
      document.body.appendChild(loadingElement.firstChild);
      loadingElement = document.querySelector(".loading-overlay");
    }

    if (isLoading) {
      loadingElement.classList.add("active");
    } else {
      loadingElement.classList.remove("active");
      setTimeout(() => {
        loadingElement.remove();
      }, 300);
    }
  }

  showError(message) {
    const container = document.getElementById("storiesContainer");
    container.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        ${message}
      </div>
    `;
  }

  hideMapContainer() {
    const mapContainer = document.getElementById("mapContainer");
    if (mapContainer) {
      mapContainer.style.display = "none";
    }
  }
}

export default HomePage;
