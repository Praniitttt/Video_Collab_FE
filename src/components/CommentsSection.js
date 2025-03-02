import React, { useState } from "react";
import CommentItem from "./CommentItem";

function CommentsSection({
  comments,
  onSubmitComment,
  onReplySubmit,
  timestamp,
  fps,
  timestampFormat,
  onFormatChange,
  onDeleteComment,
  onToggleDrawingMode,
  isDrawingMode,
  currentDrawingData,
}) {
  const [comment, setComment] = useState("");
  const [drawingTool, setDrawingTool] = useState("freehand");
  const [drawingColor, setDrawingColor] = useState("#FF0000");

  if (typeof window !== "undefined") {
    window.drawingTool = drawingTool;
    window.drawingColor = drawingColor;
  }

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isDrawingMode && currentDrawingData) {
      onSubmitComment(comment, currentDrawingData);
    } else {
      onSubmitComment(comment);
    }

    setComment("");
  };

  const handleDrawingToolChange = (e) => {
    setDrawingTool(e.target.value);
    if (typeof window !== "undefined") {
      window.drawingTool = e.target.value;
    }
  };

  const handleColorChange = (e) => {
    setDrawingColor(e.target.value);
    if (typeof window !== "undefined") {
      window.drawingColor = e.target.value;
    }
  };

  const formatTimestamp = (seconds, fps, format) => {
    if (!fps) return "00:00:00";

    const totalFrames = Math.floor(seconds * fps);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const frames = totalFrames % fps;

    switch (format) {
      case "frames":
        return `${totalFrames}`;
      case "seconds":
        return `${Math.floor(seconds)}`;
      case "timecode":
        return `${String(minutes).padStart(2, "0")}:${String(
          remainingSeconds
        ).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
      default:
        return `${Math.floor(seconds)}`;
    }
  };

  const formattedTimestamp = formatTimestamp(timestamp, fps, timestampFormat);

  return (
    <div className="comments-section">
      <h3>Comments</h3>
      <div className="format-selector">
        <label>Timestamp Format: </label>
        <select
          value={timestampFormat}
          onChange={(e) => onFormatChange(e.target.value)}
        >
          <option value="seconds">Seconds</option>
          <option value="frames">Frames</option>
          <option value="timecode">Timecode</option>
        </select>
      </div>
      <div className="comments-list">
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <CommentItem
              key={index}
              comment={comment}
              onReplySubmit={onReplySubmit}
              fps={fps}
              timestampFormat={timestampFormat}
              onDeleteComment={onDeleteComment}
            />
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>

      <div className="timestamp-card">
        <strong>{formattedTimestamp}</strong>
      </div>

      {isDrawingMode && (
        <div className="drawing-tools">
          <div>
            <label>Drawing Tool: </label>
            <select value={drawingTool} onChange={handleDrawingToolChange}>
              <option value="freehand">Freehand</option>
              <option value="rectangle">Rectangle</option>
              <option value="circle">Circle</option>
            </select>

            <label style={{ marginLeft: "10px" }}>Color: </label>
            <input
              type="color"
              value={drawingColor}
              onChange={handleColorChange}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={comment}
          onChange={handleCommentChange}
          placeholder={
            isDrawingMode
              ? "Add a comment for your drawing..."
              : "Leave your comment..."
          }
        />
        <div className="button-group">
          <button type="submit">
            {isDrawingMode ? "Submit Drawing + Comment" : "Submit Comment"}
          </button>
          <button type="button" onClick={onToggleDrawingMode}>
            {isDrawingMode ? "Cancel Drawing" : "Draw"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CommentsSection;
