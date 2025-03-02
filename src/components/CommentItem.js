import React, { useState, useEffect, useRef } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

function CommentItem({ comment, onReplySubmit, fps, onDeleteComment }) {
  const [replyText, setReplyText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [drawingData, setDrawingData] = useState(null);

  const canvasRef = useRef(null);

  useEffect(() => {
    if (comment.drawingData) {
      try {
        const parsedDrawingData = {
          ...comment.drawingData,
          points: comment.drawingData.points
            ? JSON.parse(comment.drawingData.points)
            : [],
          startPoint: comment.drawingData.startPoint
            ? JSON.parse(comment.drawingData.startPoint)
            : null,
          endPoint: comment.drawingData.endPoint
            ? JSON.parse(comment.drawingData.endPoint)
            : null,
        };
        setDrawingData(parsedDrawingData);
      } catch (e) {
        console.error("Error parsing drawing data:", e);
      }
    }
  }, [comment]);

  const handleReplyChange = (event) => {
    setReplyText(event.target.value);
  };

  const handleReply = () => {
    if (replyText.trim()) {
      onReplySubmit(comment.commentId, replyText);
      setReplyText("");
      setShowReplyBox(false);
    }
  };

  const formatTimestamp = (seconds, fps) => {
    if (!fps) return { seconds: 0, frames: 0, timecode: "00:00:00:000" };

    const totalFrames = Math.floor(seconds * fps);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds - Math.floor(seconds)) * 1000);
    const frames = Math.floor(totalFrames % fps);

    return {
      seconds: Math.floor(seconds),
      frames: totalFrames,
      timecode: `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
      ).padStart(2, "0")}:${String(frames).padStart(2, "0")}:${String(
        milliseconds
      ).padStart(3, "0")}`,
    };
  };

  const formattedTimestamp = formatTimestamp(comment.timestampSeconds, fps);

  const handleDelete = () => {
    onDeleteComment(comment.commentId);
  };

  const renderDrawing = () => {
    if (!drawingData || !drawingData.image) return null;

    return (
      <div className="comment-drawing">
        <img
          src={drawingData.image}
          alt="Drawing"
          style={{ maxWidth: "100%" }}
        />
      </div>
    );
  };

  const getCardDetails = () => {
    console.log(comment);
  };

  return (
    <div className="comment-item" onClick={getCardDetails}>
      <div className="comment-header">
        <strong>{comment.username || "Unknown User"}</strong>
        <i
          className="fa-solid fa-trash delete-icon"
          onClick={handleDelete}
          title="Delete Comment"
        ></i>
      </div>
      <small className="timestamp">
        Seconds: {formattedTimestamp.seconds} | Frames:{" "}
        {formattedTimestamp.frames} | Timecode: {formattedTimestamp.timecode}
      </small>
      {renderDrawing()}
      <p>{comment.comment}</p>
      <button onClick={() => setShowReplyBox(!showReplyBox)}>Reply</button>
      {showReplyBox && (
        <div className="reply-box">
          <textarea
            value={replyText}
            onChange={handleReplyChange}
            placeholder="Write a reply..."
          />
          <button onClick={handleReply}>Submit Reply</button>
        </div>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies">
          <h4>Replies:</h4>
          {comment.replies.map((reply, replyIndex) => (
            <div key={replyIndex} className="reply-item">
              <div className="comment-header">
                <strong>{reply.username || "Unknown User"}</strong>
              </div>
              <small className="timestamp">
                Seconds: {formatTimestamp(reply.timestampSeconds, fps).seconds}{" "}
                | Frames: {formatTimestamp(reply.timestampSeconds, fps).frames}{" "}
                | Timecode:{" "}
                {formatTimestamp(reply.timestampSeconds, fps).timecode}
              </small>
              <p>{reply.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentItem;

// import React, { useState, useEffect, useRef } from "react";

// function CommentItem({ comment, onReplySubmit, fps, onDeleteComment }) {
//   const [replyText, setReplyText] = useState("");
//   const [showReplyBox, setShowReplyBox] = useState(false);
//   const [drawingData, setDrawingData] = useState(null);

//   const canvasRef = useRef(null); // 🔥 Add a ref for the canvas

//   // On component mount or comment change, update the drawingData state
//   useEffect(() => {
//     if (comment.drawingData) {
//       try {
//         const parsedDrawingData = {
//           ...comment.drawingData,
//           points: comment.drawingData.points
//             ? JSON.parse(comment.drawingData.points)
//             : [],
//           startPoint: comment.drawingData.startPoint
//             ? JSON.parse(comment.drawingData.startPoint)
//             : null,
//           endPoint: comment.drawingData.endPoint
//             ? JSON.parse(comment.drawingData.endPoint)
//             : null,
//         };
//         setDrawingData(parsedDrawingData);
//       } catch (e) {
//         console.error("Error parsing drawing data:", e);
//       }
//     }
//   }, [comment]);

//   // Redraw the canvas when a comment is clicked
//   const redrawCanvas = (drawingData) => {
//     console.log(drawingData);
//     const canvas = canvasRef.current;
//     console.log(canvas);
//     if (!canvas || !drawingData) return;

//     const ctx = canvas.getContext("2d");
//     ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

//     ctx.strokeStyle = drawingData.color || "black"; // Default color
//     ctx.lineWidth = 2;

//     if (drawingData.type === "freehand") {
//       ctx.beginPath();
//       drawingData.points.forEach((point, index) => {
//         if (index % 2 === 0) {
//           if (index === 0) {
//             ctx.moveTo(point, drawingData.points[index + 1]);
//           } else {
//             ctx.lineTo(point, drawingData.points[index + 1]);
//           }
//         }
//       });
//       ctx.stroke();
//     } else if (drawingData.type === "rectangle") {
//       const [x1, y1, x2, y2] = drawingData.points;
//       ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
//     } else if (drawingData.type === "circle") {
//       const [x1, y1, x2, y2] = drawingData.points;
//       const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
//       ctx.beginPath();
//       ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
//       ctx.stroke();
//     }
//   };

//   const getCardDetails = () => {
//     if (comment.drawingData) {
//       redrawCanvas(comment.drawingData); // Redraw the canvas based on the stored drawing data
//     }
//   };

//   const handleDelete = () => {
//     onDeleteComment(comment.commentId);
//   };

//   const formatTimestamp = (seconds, fps) => {
//     if (!fps) return { seconds: 0, frames: 0, timecode: "00:00:00:000" };

//     const totalFrames = Math.floor(seconds * fps);
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = Math.floor(seconds % 60);
//     const milliseconds = Math.floor((seconds - Math.floor(seconds)) * 1000);
//     const frames = Math.floor(totalFrames % fps);

//     return {
//       seconds: Math.floor(seconds),
//       frames: totalFrames,
//       timecode: `${String(minutes).padStart(2, "0")}:${String(
//         remainingSeconds
//       ).padStart(2, "0")}:${String(frames).padStart(2, "0")}:${String(
//         milliseconds
//       ).padStart(3, "0")}`,
//     };
//   };
//   const formattedTimestamp = formatTimestamp(comment.timestampSeconds, fps);

//   const handleReplyChange = (event) => {
//     setReplyText(event.target.value);
//   };

//   const handleReply = () => {
//     if (replyText.trim()) {
//       onReplySubmit(comment.commentId, replyText);
//       setReplyText("");
//       setShowReplyBox(false);
//     }
//   };

//   const renderDrawing = () => {
//     if (!drawingData || !drawingData.image) return null;

//     return (
//       <div className="comment-drawing">
//         <img
//           src={drawingData.image}
//           alt="Drawing"
//           style={{ maxWidth: "100%" }}
//         />
//       </div>
//     );
//   };

//   return (
//     <div className="comment-item" onClick={getCardDetails}>
//       <div className="comment-header">
//         <strong>{comment.username || "Unknown User"}</strong>
//         <i
//           className="fa-solid fa-trash delete-icon"
//           onClick={handleDelete}
//           title="Delete Comment"
//         ></i>
//       </div>
//       <small className="timestamp">
//         Seconds: {formattedTimestamp.seconds} | Frames:{" "}
//         {formattedTimestamp.frames} | Timecode: {formattedTimestamp.timecode}
//       </small>
//       {renderDrawing()}
//       <p>{comment.comment}</p>
//       <button onClick={() => setShowReplyBox(!showReplyBox)}>Reply</button>
//       {showReplyBox && (
//         <div className="reply-box">
//           <textarea
//             value={replyText}
//             onChange={handleReplyChange}
//             placeholder="Write a reply..."
//           />
//           <button onClick={handleReply}>Submit Reply</button>
//         </div>
//       )}
//       {comment.replies && comment.replies.length > 0 && (
//         <div className="replies">
//           <h4>Replies:</h4>
//           {comment.replies.map((reply, replyIndex) => (
//             <div key={replyIndex} className="reply-item">
//               <div className="comment-header">
//                 <strong>{reply.username || "Unknown User"}</strong>
//               </div>
//               <small className="timestamp">
//                 Seconds: {formatTimestamp(reply.timestampSeconds, fps).seconds}{" "}
//                 | Frames: {formatTimestamp(reply.timestampSeconds, fps).frames}{" "}
//                 | Timecode:{" "}
//                 {formatTimestamp(reply.timestampSeconds, fps).timecode}
//               </small>
//               <p>{reply.comment}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export default CommentItem;
