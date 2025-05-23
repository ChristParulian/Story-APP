import CameraHandler from "../../utils/camera";
import StoryMap from "../../utils/map";
import api from "../../data/api";
import Swal from "sweetalert2";

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
  }

  async initialize() {
    try {
      this._initMap();
      this._setupEventListeners();
    } catch (error) {
      console.error("Initialization error:", error);
      this._view.showError("Failed to initialize page");
    }
  }

  _initMap() {
    try {
      this._map = new StoryMap(this._view.getMapContainer());
      this._map.map.on("click", (e) => {
        this._setLocation(e.latlng.lat, e.latlng.lng);
      });
    } catch (error) {
      console.error("Map initialization failed:", error);
      this._view.showMapError();
    }
  }

  _setupEventListeners() {
    this._view.bindDescriptionChange((e) => {
      this._description = e.target.value;
    });

    this._view.bindUseCamera(() => this._handleCameraStart());
    this._view.bindCancelCamera(() => this._stopCamera());
    this._view.bindCapturePhoto(() => this._capturePhoto());
    this._view.bindUploadFile(() => this._triggerFileInput());
    this._view.bindPhotoInputChange((e) => this._handleFileUpload(e));
    this._view.bindRemovePhoto(() => this._removePhoto());
    this._view.bindUseCurrentLocation(() => this._getCurrentLocation());
    this._view.bindSubmitStory(() => this._submitStory());
  }

  async _handleCameraStart() {
    try {
      await this._camera.start(this._view.getCameraPreview());
      this._view.showCameraView();
    } catch (error) {
      console.error("Camera start error:", error);
      Swal.fire({
        icon: "error",
        title: "Kamera Gagal Dibuka",
        text:
          error.message ||
          "Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.",
        confirmButtonColor: "#493628",
      });
      this._stopCamera();
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
      Swal.fire({
        icon: "error",
        title: "Gagal Mengambil Foto",
        text: error.message,
        confirmButtonColor: "#493628",
      });
    }
  }

  _triggerFileInput() {
    this._view.getPhotoInput().click();
  }

  _handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Ukuran Foto Terlalu Besar",
        text: "Ukuran maksimum yang diperbolehkan adalah 1MB.",
        confirmButtonColor: "#493628",
      });
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
      Swal.fire({
        icon: "error",
        title: "Gagal Mendapatkan Lokasi",
        text: "Tidak dapat mengakses lokasi Anda. Pastikan izin lokasi sudah diberikan.",
        confirmButtonColor: "#493628",
      });
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
      Swal.fire({
        icon: "error",
        title: "Deskripsi Kosong",
        text: "Mohon isi deskripsi sebelum mengirim.",
        confirmButtonColor: "#493628",
      });
      return;
    }

    if (!this._photoFile) {
      Swal.fire({
        icon: "error",
        title: "Foto Tidak Ada",
        text: "Mohon tambahkan foto sebelum mengirim.",
        confirmButtonColor: "#493628",
      });
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

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Cerita berhasil ditambahkan!",
        confirmButtonColor: "#493628",
      }).then(() => {
        this._view.navigateToHome();
      });
    } catch (error) {
      console.error("Story submission failed:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Menambahkan Cerita",
        text: error.message || "Terjadi kesalahan saat mengirim cerita.",
        confirmButtonColor: "#493628",
      });
    }
  }

  destroy() {
    this._camera.stop();
    if (this._photoPreviewUrl) {
      URL.revokeObjectURL(this._photoPreviewUrl);
    }
    if (this._map) {
      this._map.clearMarkers();
    }
  }
}

export default NewPresenter;
