import NewPresenter from "./new-presenter";

class NewPage {
  constructor() {
    this._presenter = new NewPresenter(this);
    this._elements = {};
  }

  async render() {
    return `
      <section class="content-container new-story-page page-transition ${document.startViewTransition ? "" : "active"}">
        <h1 class="page-title">Berbagi Cerita Baru</h1>
        
        <div class="form-container">
          <div class="form-group">
            <label for="description">Deskripsi (Wajib):</label>
            <textarea id="description" class="form-control" rows="5" 
              placeholder="Tulis cerita anda disini..." required></textarea>
          </div>
          
          <div class="form-group">
            <label>Foto (Wajib, max 1MB):</label>
            <div class="photo-options">
              <button type="button" id="useCamera" class="btn btn-secondary">
                <i class="fas fa-camera"></i> Camera
              </button>
              <button type="button" id="uploadFile" class="btn btn-secondary">
                <i class="fas fa-upload"></i> Upload File
              </button>
              <input type="file" id="photoInput" accept="image/*" style="display: none;">
            </div>
            
            <div id="cameraContainer" class="camera-container" style="display: none;">
              <video id="cameraPreview" autoplay playsinline></video>
              <div class="camera-controls">
                <button type="button" id="capturePhoto" class="btn btn-primary">
                  <i class="fas fa-camera"></i> Ambil Foto
                </button>
                <button type="button" id="cancelCamera" class="btn btn-danger">
                  <i class="fas fa-times"></i> Batal
                </button>
              </div>
            </div>
            
            <div id="photoPreviewContainer" class="photo-preview-container" style="display: none;">
              <img id="photoPreview" src="" alt="Preview">
              <button type="button" id="removePhoto" class="btn btn-danger">
                <i class="fas fa-trash"></i> Hapus Foto
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label>Lokasi (Opsional):</label>
            <p>Klik di peta, pindahkan marker, atau gunakan lokasi saat ini.</p>
            <button type="button" id="useCurrentLocation" class="btn btn-secondary">
              <i class="fas fa-location-arrow"></i> Lokasi Saya
            </button>
            
            <div id="mapContainer" class="storymap-container" style="position: relative; z-index: 1;"></div>
            <p class="map-instruction">Klik di peta/pindahkan marker</p>
          </div>
          
          <div class="form-actions">
            <button type="button" id="submitStory" class="btn btn-primary">
              <i class="fas fa-paper-plane"></i> Bagikan Cerita
            </button>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._cacheElements();
    await this._presenter.initialize();
  }

  _cacheElements() {
    this._elements = {
      description: document.getElementById("description"),
      useCamera: document.getElementById("useCamera"),
      cancelCamera: document.getElementById("cancelCamera"),
      capturePhoto: document.getElementById("capturePhoto"),
      uploadFile: document.getElementById("uploadFile"),
      photoInput: document.getElementById("photoInput"),
      removePhoto: document.getElementById("removePhoto"),
      useCurrentLocation: document.getElementById("useCurrentLocation"),
      submitStory: document.getElementById("submitStory"),
      cameraContainer: document.getElementById("cameraContainer"),
      cameraPreview: document.getElementById("cameraPreview"),
      photoPreviewContainer: document.getElementById("photoPreviewContainer"),
      photoPreview: document.getElementById("photoPreview"),
      mapContainer: document.getElementById("mapContainer"),
    };
  }

  bindDescriptionChange(handler) {
    this._elements.description.addEventListener("input", handler);
  }

  bindUseCamera(handler) {
    this._elements.useCamera.addEventListener("click", handler);
  }

  bindCancelCamera(handler) {
    this._elements.cancelCamera.addEventListener("click", handler);
  }

  bindCapturePhoto(handler) {
    this._elements.capturePhoto.addEventListener("click", handler);
  }

  bindUploadFile(handler) {
    this._elements.uploadFile.addEventListener("click", handler);
  }

  bindPhotoInputChange(handler) {
    this._elements.photoInput.addEventListener("change", handler);
  }

  bindRemovePhoto(handler) {
    this._elements.removePhoto.addEventListener("click", handler);
  }

  bindUseCurrentLocation(handler) {
    this._elements.useCurrentLocation.addEventListener("click", handler);
  }

  bindSubmitStory(handler) {
    this._elements.submitStory.addEventListener("click", handler);
  }

  showCameraView() {
    this._elements.cameraContainer.style.display = "block";
    this._elements.photoPreviewContainer.style.display = "none";
  }

  hideCameraView() {
    this._elements.cameraContainer.style.display = "none";
  }

  showPhotoPreview(url) {
    this._elements.photoPreview.src = url;
    this._elements.photoPreviewContainer.style.display = "block";
  }

  hidePhotoPreview() {
    this._elements.photoPreview.src = "";
    this._elements.photoPreviewContainer.style.display = "none";
    this._elements.photoInput.value = "";
  }

  getPhotoInput() {
    return this._elements.photoInput;
  }

  getCameraPreview() {
    return this._elements.cameraPreview;
  }

  getMapContainer() {
    return this._elements.mapContainer;
  }

  showMapError() {
    this._elements.mapContainer.innerHTML =
      '<p class="error-message">Failed to load map</p>';
  }

  showError(message) {
    alert(message);
  }

  showSuccess(message) {
    alert(message);
  }

  navigateToHome() {
    window.location.hash = "#/";
  }

  destroy() {
    this._presenter.destroy();
  }
}

export default NewPage;
