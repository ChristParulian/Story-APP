import CameraHandler from "../../utils/camera";
import StoryMap from "../../utils/map";
import api from "../../data/api";

class NewPresenter {
  constructor(view) {
    this._view = view;
    this._description = "";
    this._photoFile = null;
    this._photoPreviewUrl = "";
    this._location = null;
    this._map = null;
    this._marker = null;
    this._camera = new CameraHandler();
    this._eventListeners = [];
  }

  async initialize() {
    try {
      this._initMap();
      this._setupEventListeners();
      this._setupNavigationListener();
    } catch (error) {
      console.error("Initialization error:", error);
      this._view.showError("Failed to initialize page");
    }
  }

  _initMap() {
    try {
      this._map = new StoryMap("mapContainer");
      this._map.map.on("click", (e) => {
        this._setLocation(e.latlng.lat, e.latlng.lng);
      });
    } catch (error) {
      console.error("Map initialization failed:", error);
      this._view.showMapError();
    }
  }

  _setupEventListeners() {
    this._addListener("description", "input", (e) => {
      this._description = e.target.value;
    });

    this._addListener("useCamera", "click", () => this._handleCameraStart());
    this._addListener("cancelCamera", "click", () => this._stopCamera());
    this._addListener("capturePhoto", "click", () => this._capturePhoto());
    this._addListener("uploadFile", "click", () => this._triggerFileInput());
    this._addListener("photoInput", "change", (e) => this._handleFileUpload(e));
    this._addListener("removePhoto", "click", () => this._removePhoto());
    this._addListener("useCurrentLocation", "click", () => this._getCurrentLocation());
    this._addListener("submitStory", "click", () => this._submitStory());
  }

  _addListener(elementId, event, handler) {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener(event, handler);
      this._eventListeners.push({ element, event, handler });
    }
  }

  _setupNavigationListener() {
    const handler = () => {
      if (window.location.hash !== "#/new") {
        this.destroy();
      }
    };
    window.addEventListener("hashchange", handler);
    this._eventListeners.push({
      element: window,
      event: "hashchange",
      handler,
    });
  }

  async _handleCameraStart() {
    try {
      await this._camera.start("cameraPreview");
      this._view.showCameraView();
    } catch (error) {
      this._view.showError(error.message);
    }
  }

  _stopCamera() {
    this._camera.stop();
    this._view.hideCameraView();
  }

  async _capturePhoto() {
    try {
      this._photoFile = await this._camera.capture();
      this._photoPreviewUrl = URL.createObjectURL(this._photoFile);
      this._view.showPhotoPreview(this._photoPreviewUrl);
      this._stopCamera();
    } catch (error) {
      this._view.showError("Failed to capture photo: " + error.message);
    }
  }

  _triggerFileInput() {
    document.getElementById("photoInput").click();
  }

  _handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      this._view.showError("File size too large. Maximum 1MB allowed.");
      return;
    }

    this._photoFile = file;
    this._photoPreviewUrl = URL.createObjectURL(file);
    this._view.showPhotoPreview(this._photoPreviewUrl);
    this._stopCamera();
  }

  _removePhoto() {
    this._photoFile = null;
    if (this._photoPreviewUrl) {
      URL.revokeObjectURL(this._photoPreviewUrl);
    }
    this._view.hidePhotoPreview();
  }

  async _getCurrentLocation() {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      });
      this._setLocation(position.coords.latitude, position.coords.longitude);
    } catch (error) {
      console.error("Geolocation error:", error);
      this._view.showError("Failed to get current location. Please ensure location permissions are granted.");
    }
  }

  _setLocation(lat, lng) {
    this._location = { lat, lng };
    if (this._map) {
      if (this._marker) {
        this._map.map.removeLayer(this._marker);
      }
      this._marker = L.marker([lat, lng], { draggable: true })
        .addTo(this._map.map)
        .on("dragend", (e) => {
          const newPos = e.target.getLatLng();
          this._location = { lat: newPos.lat, lng: newPos.lng };
        });
      this._map.map.setView([lat, lng], 15);
    }
  }

  async _submitStory() {
    if (!this._description.trim()) {
      this._view.showError("Story description is required");
      return;
    }

    if (!this._photoFile) {
      this._view.showError("Photo is required");
      return;
    }

    const formData = new FormData();
    formData.append("description", this._description);
    formData.append("photo", this._photoFile);

    if (this._location) {
      formData.append("lat", this._location.lat);
      formData.append("lon", this._location.lng);
    }

    try {
      const response = await api.addStory(formData);
      
      if (response.error) {
        throw new Error(response.message);
      }

      this._view.showSuccess("Story added successfully!");
      this._view.navigateToHome();
    } catch (error) {
      console.error("Story submission failed:", error);
      this._view.showError(error.message || "Failed to submit story");
    }
  }

  destroy() {
    this._camera.stop();
    if (this._photoPreviewUrl) {
      URL.revokeObjectURL(this._photoPreviewUrl);
    }
    this._eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    if (this._map) {
      this._map.clearMarkers();
    }
  }
}

export default NewPresenter;