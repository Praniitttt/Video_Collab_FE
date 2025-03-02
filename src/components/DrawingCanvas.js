import React, { useRef, useState, useEffect } from "react";

const DrawingCanvas = ({ videoElement, onSaveDrawing, onCancel }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingData, setDrawingData] = useState([]);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && videoElement) {
      canvas.width = videoElement.clientWidth;
      canvas.height = videoElement.clientHeight;
    }
  }, [videoElement]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);

    if (window.drawingTool === "freehand") {
      setDrawingData([{ x: offsetX, y: offsetY }]);
    } else {
      setStartPoint({ x: offsetX, y: offsetY });
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { offsetX, offsetY } = e.nativeEvent;

    setEndPoint({ x: offsetX, y: offsetY });

    if (window.drawingTool === "freehand") {
      ctx.strokeStyle = window.drawingColor;
      ctx.lineWidth = 2;
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();

      setDrawingData((prevPoints) => [
        ...prevPoints,
        { x: offsetX, y: offsetY },
      ]);
    } else if (
      window.drawingTool === "rectangle" ||
      window.drawingTool === "circle"
    ) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();

      if (window.drawingTool === "rectangle") {
        ctx.rect(
          startPoint.x,
          startPoint.y,
          offsetX - startPoint.x,
          offsetY - startPoint.y
        );
      } else if (window.drawingTool === "circle") {
        const radius = Math.sqrt(
          Math.pow(offsetX - startPoint.x, 2) +
            Math.pow(offsetY - startPoint.y, 2)
        );
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
      }

      ctx.strokeStyle = window.drawingColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL();

    const drawingPayload = {
      type: window.drawingTool,
      color: window.drawingColor,
      image: dataUrl,
      points: [],
    };

    if (window.drawingTool === "freehand") {
      drawingPayload.points = drawingData.flatMap((point) => [
        point.x,
        point.y,
      ]);
    } else if (
      window.drawingTool === "rectangle" ||
      window.drawingTool === "circle"
    ) {
      drawingPayload.startPoint = [startPoint.x, startPoint.y];
      drawingPayload.endPoint = [endPoint.x, endPoint.y];

      drawingPayload.points = [
        startPoint.x,
        startPoint.y,
        endPoint.x,
        endPoint.y,
      ];
    }

    onSaveDrawing(drawingPayload);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseOut={stopDrawing}
      style={{ position: "absolute", top: 0, left: 0, cursor: "crosshair" }}
    />
  );
};

export default DrawingCanvas;
