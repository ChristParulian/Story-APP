class CameraHandler {
  constructor() {
    this._stream = null;
    this._videoElement = null;
    this._isCameraActive = false;
    this._idealResolution = { width: 1280, height: 960 }; // 4:3 HD
  }

  async start(videoElementId) {
    this.stop();
    
    this._videoElement = document.getElementById(videoElementId);
    if (!this._videoElement) {
      throw new Error("Video element not found");
    }

    try {
      const constraints = {
        video: { 
          facingMode: "environment",
          width: { ideal: this._idealResolution.width },
          height: { ideal: this._idealResolution.height }
        },
        audio: false,
      };

      this._stream = await navigator.mediaDevices.getUserMedia(constraints);
      this._videoElement.srcObject = this._stream;
      
      await new Promise((resolve) => {
        this._videoElement.onloadedmetadata = () => {
          this._videoElement.play();
          this._isCameraActive = true;
          resolve(true);
        };
      });
      
      return true;
    } catch (error) {
      console.error("Camera error:", error);
      throw new Error("Failed to access camera. Please ensure camera permissions are granted.");
    }
  }

  stop() {
    if (this._stream) {
      this._stream.getTracks().forEach((track) => track.stop());
      this._stream = null;
    }
    
    if (this._videoElement) {
      this._videoElement.srcObject = null;
      this._videoElement.onloadedmetadata = null;
    }
    
    this._isCameraActive = false;
  }

  async capture() {
    if (!this._isCameraActive || !this._videoElement) {
      throw new Error("Camera is not active");
    }

    const videoWidth = this._videoElement.videoWidth;
    const videoHeight = this._videoElement.videoHeight;
    
    const canvas = document.createElement("canvas");
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const ctx = canvas.getContext("2d");
    
    ctx.drawImage(this._videoElement, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error("Failed to capture image");
          resolve(new File([blob], "photo.jpg", { 
            type: "image/jpeg",
            lastModified: Date.now()
          }));
        },
        "image/jpeg",
        0.9 // Kualitas tetap 90% untuk HD
      );
    });
  }

  switchCamera() {
    if (!this._stream) return;

    const videoTrack = this._stream.getVideoTracks()[0];
    if (!videoTrack) return;

    const currentFacingMode = videoTrack.getSettings().facingMode;
    const newFacingMode = currentFacingMode === "user" ? "environment" : "user";

    videoTrack.applyConstraints({
      facingMode: newFacingMode
    });
  }

  get isActive() {
    return this._isCameraActive;
  }
}

export default CameraHandler;