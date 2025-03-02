import React, { useRef } from "react";
import DrawingCanvas from "./DrawingCanvas";

function VideoPlayer({
  videoUrl,
  onFileChange,
  onVideoPause,
  isDrawingMode,
  onSaveDrawing,
}) {
  const videoRef = useRef(null);

  const handlePause = () => {
    const videoElement = videoRef.current;
    const currentTime = videoElement.currentTime;
    onVideoPause(currentTime);
  };

  return (
    <div className="video-section">
      <div className="upload-card">
        <h2>Upload Video</h2>
        <input type="file" accept="video/*" onChange={onFileChange} />
      </div>
      {videoUrl && (
        <div className="video-player" style={{ position: "relative" }}>
          <h3>Selected Video:</h3>
          <video
            ref={videoRef}
            key={videoUrl}
            controls
            onPause={handlePause}
            autoPlay
          >
            <source src={videoUrl} type="video/mp4" />
          </video>

          {isDrawingMode && (
            <DrawingCanvas
              videoElement={videoRef.current}
              onSaveDrawing={onSaveDrawing}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
