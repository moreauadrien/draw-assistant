import { useEffect, useRef, useState } from "react";
import { DrawingToolbar } from "./DrawingToolbar";
import DrawingManager from "../lib/DrawingManager.js"
import { AIPromptBar } from "./AIPromptBar.js";

export default function DrawingCanvas() {
  const canvasRef: React.Ref<HTMLCanvasElement | null> = useRef(null);
  const [manager] = useState(() => new DrawingManager());


  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) {
      throw new Error('Parameter "canvas" should be a HTMLCanvasElement');
    }

    manager.setCanvas(canvas)
  }, [])

  return (
    <>
      <div className="relative w-screen h-screen overflow-hidden">
        <canvas id="draw_canvas" ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
          <DrawingToolbar dm={manager} />
        </div>

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <AIPromptBar dm={manager} />
        </div>
      </div>
    </>
  )
}
