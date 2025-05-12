class CameraHandler {
  constructor() {
    this._stream = null;
    this._videoElement = null;
    this._isCameraActive = false;
  }

  async start(videoElementId) {
    this.stop();
    
    this._videoElement = document.getElementById(videoElementId);
    if (!this._videoElement) {
      throw new Error("Video element not found");
    }

    try {
      this._stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      this._videoElement.srcObject = this._stream;
      this._isCameraActive = true;
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
    }
    
    this._isCameraActive = false;
  }

  async capture() {
    if (!this._isCameraActive || !this._videoElement) {
      throw new Error("Camera is not active");
    }

    const canvas = document.createElement("canvas");
    canvas.width = this._videoElement.videoWidth;
    canvas.height = this._videoElement.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(this._videoElement, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error("Failed to capture image");
          }
          resolve(new File([blob], "photo.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.9
      );
    });
  }

  get isActive() {
    return this._isCameraActive;
  }
}

export default CameraHandler;