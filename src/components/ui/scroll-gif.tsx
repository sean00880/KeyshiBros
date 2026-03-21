"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { parseGIF, decompressFrames } from "gifuct-js";

interface ScrollGifProps {
  src: string;
  className?: string;
  /** Height of the scroll container (controls how "long" the scroll animation feels) */
  scrollHeight?: string;
  /** Whether the canvas should be sticky while scrolling */
  sticky?: boolean;
  /** Scroll offset config for useScroll */
  scrollOffset?: [string, string];
}

/**
 * ScrollGif — GIF frame responds to scroll position.
 *
 * Decomposes GIF into frames via gifuct-js, then maps scroll progress
 * to frame index rendered on a <canvas>. Smooth, GPU-friendly, 60fps.
 */
export function ScrollGif({
  src,
  className = "",
  scrollHeight = "200vh",
  sticky = true,
  scrollOffset = ["start center", "end center"],
}: ScrollGifProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frames, setFrames] = useState<ImageData[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const currentFrameRef = useRef(0);

  // Track scroll progress within the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: scrollOffset as any,
  });

  // Extract GIF frames on mount
  useEffect(() => {
    let cancelled = false;

    async function loadGif() {
      try {
        const response = await fetch(src);
        const buffer = await response.arrayBuffer();
        const gif = parseGIF(buffer);
        const decompressed = decompressFrames(gif, true);

        if (cancelled || decompressed.length === 0) return;

        const first = decompressed[0]!;
        const w = first.dims.width;
        const h = first.dims.height;
        setDimensions({ width: w, height: h });

        // Build full-frame ImageData array (handle GIF dispose methods)
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext("2d")!;

        const extractedFrames: ImageData[] = [];

        for (const frame of decompressed) {
          // Create ImageData from frame patch
          const frameImageData = new ImageData(
            new Uint8ClampedArray(frame.patch),
            frame.dims.width,
            frame.dims.height
          );

          // Composite onto temp canvas at correct position
          const patchCanvas = document.createElement("canvas");
          patchCanvas.width = frame.dims.width;
          patchCanvas.height = frame.dims.height;
          const patchCtx = patchCanvas.getContext("2d")!;
          patchCtx.putImageData(frameImageData, 0, 0);

          tempCtx.drawImage(patchCanvas, frame.dims.left, frame.dims.top);

          // Capture full composited frame
          extractedFrames.push(
            tempCtx.getImageData(0, 0, w, h)
          );

          // Handle disposal
          if (frame.disposalType === 2) {
            tempCtx.clearRect(0, 0, w, h);
          }
        }

        if (!cancelled) {
          setFrames(extractedFrames);
          // Render first frame
          if (canvasRef.current && extractedFrames.length > 0) {
            const ctx = canvasRef.current.getContext("2d");
            const f0 = extractedFrames[0];
            if (ctx && f0) ctx.putImageData(f0, 0, 0);
          }
        }
      } catch (err) {
        console.error("ScrollGif: Failed to load GIF", err);
      }
    }

    loadGif();
    return () => { cancelled = true; };
  }, [src]);

  // Render frame on scroll — throttled to rAF
  const renderFrame = useCallback(
    (frameIndex: number) => {
      if (
        !canvasRef.current ||
        frames.length === 0 ||
        frameIndex === currentFrameRef.current
      )
        return;

      currentFrameRef.current = frameIndex;
      const ctx = canvasRef.current.getContext("2d");
      if (ctx && frames[frameIndex]) {
        ctx.putImageData(frames[frameIndex], 0, 0);
      }
    },
    [frames]
  );

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (frames.length === 0) return;
    const index = Math.min(
      Math.floor(progress * (frames.length - 1)),
      frames.length - 1
    );
    requestAnimationFrame(() => renderFrame(Math.max(0, index)));
  });

  // Respect reduced motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  if (reducedMotion) {
    // Static GIF fallback
    return (
      <div className={className}>
        <img src={src} alt="Animated character" className="w-full h-auto" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: scrollHeight }}
    >
      <div
        className={`${sticky ? "sticky top-1/4" : ""} flex items-center justify-center ${className}`}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width || 400}
          height={dimensions.height || 400}
          className="max-w-full h-auto"
          style={{
            imageRendering: "auto",
          }}
        />
      </div>
    </div>
  );
}
