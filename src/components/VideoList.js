import React from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

function VideoList({ videos, selectedVideoId, onVideoSelect, onDeleteVideo }) {
  return (
    <div className="sidebar">
      <h2>Uploaded Videos</h2>
      <ul>
        {videos.map((video) => (
          <li
            key={video.videoId}
            className={selectedVideoId === video.videoId ? "selected" : ""}
          >
            <span onClick={() => onVideoSelect(video)}>
              {video.title || "Untitled Video"}
            </span>
            <i
              className="fa-solid fa-trash delete-icon"
              onClick={() => onDeleteVideo(video.videoId)}
            ></i>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VideoList;
