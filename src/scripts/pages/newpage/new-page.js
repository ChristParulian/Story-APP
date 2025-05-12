import NewPresenter from "./new-presenter";

class NewPage {
  constructor() {
    this._presenter = new NewPresenter(this);
  }

  async render() {
    return `
      <section class="content-container new-story-page page-transition ${document.startViewTransition ? '' : 'active'}">
        <h1 class="page-title">Add New Story</h1>
        
        <div class="form-container">
          <div class="form-group">
            <label for="description">Story Description (Required):</label>
            <textarea id="description" class="form-control" rows="5" 
              placeholder="Write your story here..." required></textarea>
          </div>
          
          <div class="form-group">
            <label>Story Photo (Required, max 1MB):</label>
            <div class="photo-options">
              <button type="button" id="useCamera" class="btn btn-secondary">
                <i class="fas fa-camera"></i> Use Camera
              </button>
              <button type="button" id="uploadFile" class="btn btn-secondary">
                <i class="fas fa-upload"></i> Upload File
              </button>
              <input type="file" id="photoInput" accept="image/*" style="display: none;">
            </div>
            
            <div id="cameraContainer" class="camera-container">
              <video id="cameraPreview" autoplay playsinline></video>
              <div class="camera-controls">
                <button type="button" id="capturePhoto" class="btn btn-primary">
                  <i class="fas fa-camera"></i> Capture Photo
                </button>
                <button type="button" id="cancelCamera" class="btn btn-danger">
                  <i class="fas fa-times"></i> Cancel
                </button>
              </div>
            </div>
            
            <div id="photoPreviewContainer" class="photo-preview-container">
              <img id="photoPreview" src="" alt="Preview">
              <button type="button" id="removePhoto" class="btn btn-danger">
                <i class="fas fa-trash"></i> Remove Photo
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label>Story Location (Optional):</label>
            <p>Click on map, drag marker, or use current location</p>
            <button type="button" id="useCurrentLocation" class="btn btn-secondary">
              <i class="fas fa-location-arrow"></i> Use My Location
            </button>
            
            <div id="mapContainer" class="storymap-container" style="position: relative; z-index: 1;></div>
            <p class="map-instruction">Click map/drag marker to select location</p>
          </div>
          
          <div class="form-actions">
            <button type="button" id="submitStory" class="btn btn-primary">
              <i class="fas fa-paper-plane"></i> Submit Story
            </button>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this._presenter.initialize();
  }

  showCameraView() {
    document.getElementById("cameraContainer").style.display = "block";
    document.getElementById("photoPreviewContainer").style.display = "none";
  }

  hideCameraView() {
    document.getElementById("cameraContainer").style.display = "none";
  }

  showPhotoPreview(url) {
    const preview = document.getElementById("photoPreview");
    preview.src = url;
    document.getElementById("photoPreviewContainer").style.display = "block";
  }

  hidePhotoPreview() {
    document.getElementById("photoPreview").src = "";
    document.getElementById("photoPreviewContainer").style.display = "none";
    document.getElementById("photoInput").value = "";
  }

  showMapError() {
    const mapContainer = document.getElementById("mapContainer");
    mapContainer.innerHTML = '<p class="error-message">Failed to load map</p>';
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