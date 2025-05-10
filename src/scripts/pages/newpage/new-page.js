import CONFIG from '../../config';
import StoryMap from '../../utils/map';
import api from '../../data/api';

class NewPage {
  constructor() {
    this._description = '';
    this._photoFile = null;
    this._photoPreviewUrl = '';
    this._location = null;
    this._map = null;
    this._marker = null;
    this._stream = null;
    this._videoElement = null;
    this._isCameraActive = false;
    this._eventListeners = [];
  }

  async render() {
    return `
      <section class="content-container">
        <h1 class="page-title">Tambah Cerita Baru</h1>
        
        <div class="form-container">
          <div class="form-group">
            <label for="description">Deskripsi Cerita (Wajib):</label>
            <textarea id="description" class="form-control" rows="5" 
              placeholder="Tulis deskripsi ceritamu di sini..." required></textarea>
          </div>
          
          <div class="form-group">
            <label>Foto Cerita (Wajib, maks 1MB):</label>
            <div class="photo-options">
              <button type="button" id="useCamera" class="btn btn-secondary">
                <i class="fas fa-camera"></i> Gunakan Kamera
              </button>
              <button type="button" id="uploadFile" class="btn btn-secondary">
                <i class="fas fa-upload"></i> Unggah File
              </button>
              <input type="file" id="photoInput" accept="image/*" style="display: none;">
            </div>
            
            <div id="cameraContainer" style="display: none;">
              <video id="cameraPreview" autoplay playsinline style="width: 100%; max-height: 300px;"></video>
              <button type="button" id="capturePhoto" class="btn btn-primary">
                <i class="fas fa-camera"></i> Ambil Foto
              </button>
              <button type="button" id="cancelCamera" class="btn btn-danger">
                <i class="fas fa-times"></i> Batal
              </button>
            </div>
            
            <div id="photoPreviewContainer" style="display: none;">
              <img id="photoPreview" src="" alt="Preview" style="max-width: 100%; max-height: 300px;">
              <button type="button" id="removePhoto" class="btn btn-danger">
                <i class="fas fa-trash"></i> Hapus Foto
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label>Lokasi Cerita (Opsional):</label>
            <p>Klik di peta, geser marker, atau gunakan lokasi saat ini.</p>
            <button type="button" id="useCurrentLocation" class="btn btn-secondary">
              <i class="fas fa-location-arrow"></i> Gunakan Lokasi Saya
            </button>
            
            <div id="mapContainer" style="height: 300px; margin-top: 15px;"></div>
            <p class="map-instruction">Klik peta/geser marker untuk pilih lokasi</p>
          </div>
          
          <div class="form-actions">
            <button type="button" id="submitStory" class="btn btn-primary">
              <i class="fas fa-paper-plane"></i> Kirim Cerita
            </button>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._initMap();
    this._setupEventListeners();
    this._setupNavigationListener();
  }

  _initMap() {
    try {
      this._map = new StoryMap('mapContainer');
      this._map.map.on('click', (e) => {
        this._setLocation(e.latlng.lat, e.latlng.lng);
      });
    } catch (error) {
      console.error('Failed to initialize map:', error);
      document.getElementById('mapContainer').innerHTML = 
        '<p class="error-message">Peta tidak dapat dimuat</p>';
    }
  }

  _setupEventListeners() {
    const addListener = (element, event, handler) => {
      element.addEventListener(event, handler);
      this._eventListeners.push({ element, event, handler });
    };

    // Description input
    addListener(
      document.getElementById('description'),
      'input',
      (e) => { this._description = e.target.value; }
    );

    // Camera buttons
    addListener(
      document.getElementById('useCamera'),
      'click',
      () => this._startCamera()
    );
    addListener(
      document.getElementById('cancelCamera'),
      'click',
      () => this._stopCamera()
    );
    addListener(
      document.getElementById('capturePhoto'),
      'click',
      () => this._capturePhoto()
    );

    // File upload
    addListener(
      document.getElementById('uploadFile'),
      'click',
      () => document.getElementById('photoInput').click()
    );
    addListener(
      document.getElementById('photoInput'),
      'change',
      (e) => this._handleFileUpload(e)
    );

    // Photo removal
    addListener(
      document.getElementById('removePhoto'),
      'click',
      () => this._removePhoto()
    );

    // Location buttons
    addListener(
      document.getElementById('useCurrentLocation'),
      'click',
      () => this._getCurrentLocation()
    );

    // Form submission
    addListener(
      document.getElementById('submitStory'),
      'click',
      () => this._submitStory()
    );
  }

  _setupNavigationListener() {
    const handler = () => {
      if (window.location.hash !== '#/new') {
        this.destroy();
      }
    };
    window.addEventListener('hashchange', handler);
    this._eventListeners.push({
      element: window,
      event: 'hashchange',
      handler
    });
  }

  async _startCamera() {
    try {
      this._stopCamera();
      
      this._videoElement = document.getElementById('cameraPreview');
      this._stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      
      this._videoElement.srcObject = this._stream;
      this._isCameraActive = true;
      
      document.getElementById('cameraContainer').style.display = 'block';
      document.getElementById('photoPreviewContainer').style.display = 'none';
    } catch (error) {
      console.error('Camera error:', error);
      alert('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
    }
  }

  _stopCamera() {
    if (this._stream) {
      this._stream.getTracks().forEach(track => track.stop());
      this._stream = null;
    }
    
    if (this._videoElement) {
      this._videoElement.srcObject = null;
    }
    
    this._isCameraActive = false;
    const cameraContainer = document.getElementById('cameraContainer');
    if (cameraContainer) {
      cameraContainer.style.display = 'none';
    }
  }

  _capturePhoto() {
    if (!this._isCameraActive || !this._videoElement) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = this._videoElement.videoWidth;
    canvas.height = this._videoElement.videoHeight;
    canvas.getContext('2d').drawImage(this._videoElement, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      this._photoFile = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      this._photoPreviewUrl = URL.createObjectURL(blob);
      
      document.getElementById('photoPreview').src = this._photoPreviewUrl;
      document.getElementById('photoPreviewContainer').style.display = 'block';
      this._stopCamera();
    }, 'image/jpeg', 0.9);
  }

  _handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 1MB.');
      return;
    }
    
    this._photoFile = file;
    this._photoPreviewUrl = URL.createObjectURL(file);
    
    document.getElementById('photoPreview').src = this._photoPreviewUrl;
    document.getElementById('photoPreviewContainer').style.display = 'block';
    document.getElementById('cameraContainer').style.display = 'none';
    this._stopCamera();
  }

  _removePhoto() {
    this._photoFile = null;
    if (this._photoPreviewUrl) {
      URL.revokeObjectURL(this._photoPreviewUrl);
      this._photoPreviewUrl = '';
    }
    
    document.getElementById('photoPreview').src = '';
    document.getElementById('photoPreviewContainer').style.display = 'none';
    document.getElementById('photoInput').value = '';
  }

  async _getCurrentLocation() {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      
      this._setLocation(
        position.coords.latitude,
        position.coords.longitude
      );
    } catch (error) {
      console.error('Geolocation error:', error);
      alert('Tidak dapat mendapatkan lokasi saat ini. Pastikan izin lokasi telah diberikan.');
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
        .on('dragend', (e) => {
          const newPos = e.target.getLatLng();
          this._location = { lat: newPos.lat, lng: newPos.lng };
        });
      
      this._map.map.setView([lat, lng], 15);
    }
  }

  async _submitStory() {
    if (!this._description) {
      alert('Deskripsi cerita wajib diisi');
      return;
    }
    
    if (!this._photoFile) {
      alert('Foto cerita wajib diunggah');
      return;
    }
    
    const formData = new FormData();
    formData.append('description', this._description);
    formData.append('photo', this._photoFile);
    
    if (this._location) {
      formData.append('lat', this._location.lat);
      formData.append('lon', this._location.lng);
    }
    
    try {
      const token = localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
      const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengunggah cerita');
      }
      
      alert('Cerita berhasil ditambahkan!');
      window.location.hash = '#/';
    } catch (error) {
      console.error('Submission error:', error);
      alert(error.message || 'Terjadi kesalahan saat mengunggah cerita');
    }
  }

  destroy() {
    // Clean up camera
    this._stopCamera();
    
    // Clean up photo preview URL
    if (this._photoPreviewUrl) {
      URL.revokeObjectURL(this._photoPreviewUrl);
    }
    
    // Remove all event listeners
    this._eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this._eventListeners = [];
    
    // Clean up map if exists
    if (this._map) {
      this._map.clearMarkers();
    }
  }
}

export default NewPage;