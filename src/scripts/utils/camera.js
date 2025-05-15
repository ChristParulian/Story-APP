class CameraHandler {
  constructor() {
    this._stream = null;
    this._videoElement = null;
    this._isCameraActive = false;
    this._idealResolution = { width: 1280, height: 960 }; // 4:3 HD
  }

  async start(videoElement) {
    this.stop();

    if (!(videoElement instanceof HTMLVideoElement)) {
      throw new Error("Invalid video element provided");
    }

    this._videoElement = videoElement;

    try {
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: this._idealResolution.width },
          height: { ideal: this._idealResolution.height },
        },
        audio: false,
      };

      this._stream = await navigator.mediaDevices.getUserMedia(constraints)
        .catch(async (error) => {
          console.warn("Ideal resolution failed, trying fallback...", error);
          // Fallback ke constraints lebih sederhana
          return await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "environment"
            },
            audio: false
          });
        });

      this._videoElement.srcObject = this._stream;

      await new Promise((resolve, reject) => {
        this._videoElement.onloadedmetadata = () => {
          this._videoElement.play()
            .then(() => {
              this._isCameraActive = true;
              resolve(true);
            })
            .catch(reject);
        };
        
        setTimeout(() => {
          reject(new Error("Camera metadata loading timed out"));
        }, 5000);
      });

      return true;
    } catch (error) {
      console.error("Camera error:", error);
      this.stop();
      throw new Error(
        `Gagal mengakses kamera: ${error.message || 'Pastikan izin kamera sudah diberikan'}`
      );
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

    const maxSize = 1024 * 1024; // 1MB
    let quality = 0.9;

    const tryCompress = () => {
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Failed to capture image"));
            resolve(blob);
          },
          "image/jpeg",
          quality,
        );
      });
    };

    let blob = await tryCompress();

    while (blob.size > maxSize && quality > 0.3) {
      quality -= 0.05;
      blob = await tryCompress();
    }

    if (blob.size > maxSize) {
      throw new Error("Unable to compress image below 1MB");
    }

    return new File([blob], "photo.jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  }

  switchCamera() {
    if (!this._stream) return;

    const videoTrack = this._stream.getVideoTracks()[0];
    if (!videoTrack) return;

    const currentFacingMode = videoTrack.getSettings().facingMode;
    const newFacingMode = currentFacingMode === "user" ? "environment" : "user";

    videoTrack.applyConstraints({
      facingMode: newFacingMode,
    });
  }

  get isActive() {
    return this._isCameraActive;
  }
}

export default CameraHandler;
