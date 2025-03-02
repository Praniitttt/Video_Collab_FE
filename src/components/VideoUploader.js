import React, { useState, useEffect } from "react";
import axios from "axios";
import VideoList from "./VideoList";
import VideoPlayer from "./VideoPlayer";
import CommentsSection from "./CommentsSection";
import "../styles/VideoUploader.css";

function VideoUploader() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [comments, setComments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [timestampSeconds, setTimestampSeconds] = useState(0);
  const [fps, setFps] = useState(null);
  const [timestampFormat, setTimestampFormat] = useState("seconds");
  const [error, setError] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentDrawingData, setCurrentDrawingData] = useState(null);

  const userId = 1;

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (selectedVideoId) {
      fetchComments(selectedVideoId);
    }
  }, [selectedVideoId]);

  function fetchVideos() {
    axios
      .get("http://localhost:8080/api/videos")
      .then((response) => {
        setVideos(response.data);
      })
      .catch((error) => {
        console.error("Error fetching videos:", error);
        setError("Failed to fetch videos. Please try again.");
      });
  }

  function fetchComments(videoId) {
    axios
      .get(`http://localhost:8080/api/videos/${videoId}/comments`)
      .then((response) => {
        setComments(response.data);
      })
      .catch((error) => {
        console.error("Error fetching comments:", error);
        setError("Failed to fetch comments. Please try again.");
      });
  }

  async function deleteVideo(videoId) {
    try {
      await axios.delete(`http://localhost:8080/api/videos/${videoId}`);
      fetchVideos();
      if (selectedVideoId === videoId) {
        setSelectedVideoId(null);
        setVideoUrl("");
        setComments([]);
        setTimestampSeconds(0);
        setFps(null);
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      setError("Failed to delete video. Please try again.");
    }
  }

  async function deleteComment(commentId) {
    try {
      await axios.delete(
        `http://localhost:8080/api/videos/${selectedVideoId}/comments/${commentId}`
      );
      fetchComments(selectedVideoId);
    } catch (error) {
      console.error("Error deleting comment:", error);
      setError("Failed to delete comment. Please try again.");
    }
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      setVideoFile(file);
      uploadVideo(file);
    }
  }

  async function uploadVideo(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/videos/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const filename = response.data.url.split("/").pop();
      setVideoUrl(`http://localhost:8080/api/videos/play/${filename}`);
      fetchVideos();
      setError(null);
    } catch (error) {
      console.error("Error uploading video:", error);
      setError("Failed to upload video. Please try again.");
    }
  }

  const handleVideoPause = (currentTime) => {
    setTimestampSeconds(currentTime);
  };

  async function handleVideoSelect(video) {
    setSelectedVideoId(video.videoId);
    setVideoUrl(
      `http://localhost:8080/api/videos/play/${video.url.split("/").pop()}`
    );
    setTimestampSeconds(0);

    try {
      const response = await axios.get(
        `http://localhost:8080/api/videos/${video.videoId}`
      );
      setFps(response.data.fps);
    } catch (error) {
      console.error("Error fetching video metadata:", error);
      setError("Failed to fetch video metadata. Please try again.");
    }
  }

  const handleSubmitComment = (commentText, drawingData = null) => {
    if (!commentText && !drawingData) {
      setError("Comment cannot be empty.");
      return;
    }

    let processedDrawingData = null;
    if (drawingData) {
      processedDrawingData = {
        type: drawingData.type,
        color: drawingData.color,
        image: drawingData.image,
        points: drawingData.points.flat(),
        startPoint: drawingData.startPoint
          ? [drawingData.startPoint.x, drawingData.startPoint.y]
          : null,
        endPoint: drawingData.endPoint
          ? [drawingData.endPoint.x, drawingData.endPoint.y]
          : null,
      };
    }

    const commentData = {
      userId: userId,
      comment: commentText || "",
      timestampSeconds: Number(timestampSeconds),
      drawingData: processedDrawingData,
    };

    axios
      .post(
        `http://localhost:8080/api/videos/${selectedVideoId}/comments`,
        commentData,
        { headers: { "Content-Type": "application/json" } }
      )
      .then((response) => {
        setComments([...comments, response.data]);
        setTimestampSeconds(0);
        setError(null);

        setIsDrawingMode(false);
        setCurrentDrawingData(null);
      })
      .catch((error) => {
        console.error("Error posting comment:", error);
        setError("Failed to post comment. Please try again.");
      });
  };

  function handleReplySubmit(parentCommentId, replyText) {
    if (!replyText.trim()) return;

    const parentComment = comments.find(
      (comment) => comment.commentId === parentCommentId
    );
    const parentTimestamp = parentComment ? parentComment.timestampSeconds : 0;

    const replyRequest = {
      userId: userId,
      comment: replyText,
      timestampSeconds: Number(parentTimestamp),
    };

    axios
      .post(
        `http://localhost:8080/api/videos/${selectedVideoId}/comments/${parentCommentId}/reply`,
        replyRequest
      )
      .then((response) => {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.commentId === parentCommentId
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), response.data],
                }
              : comment
          )
        );
        setError(null);
      })
      .catch((error) => {
        console.error("Error posting reply:", error);
        setError("Failed to post reply. Please try again.");
      });
  }

  const handleToggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
    if (isDrawingMode) {
      setCurrentDrawingData(null);
    }
  };

  const handleSaveDrawing = (drawingData) => {
    setCurrentDrawingData(drawingData);
  };

  return (
    <div className="container">
      {error && <div className="error-banner">{error}</div>}
      <VideoList
        videos={videos}
        selectedVideoId={selectedVideoId}
        onVideoSelect={handleVideoSelect}
        onDeleteVideo={deleteVideo}
      />
      <div className="main-content">
        <VideoPlayer
          videoUrl={videoUrl}
          onFileChange={handleFileChange}
          onVideoPause={handleVideoPause}
          isDrawingMode={isDrawingMode}
          onSaveDrawing={handleSaveDrawing}
        />
        <CommentsSection
          comments={comments}
          onSubmitComment={handleSubmitComment}
          onReplySubmit={handleReplySubmit}
          timestamp={timestampSeconds}
          fps={fps}
          timestampFormat={timestampFormat}
          onFormatChange={(format) => setTimestampFormat(format)}
          onDeleteComment={deleteComment}
          onToggleDrawingMode={handleToggleDrawingMode}
          isDrawingMode={isDrawingMode}
          currentDrawingData={currentDrawingData}
        />
      </div>
    </div>
  );
}

export default VideoUploader;
