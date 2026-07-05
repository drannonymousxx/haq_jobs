'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from './ScrollProgressContext';
import styles from '@/styles/ScrollImageSequence.module.css';

interface ScrollImageSequenceProps {
  frameCount: number;
  frameUrlTemplate: (index: number) => string;
}

export default function ScrollImageSequence({
  frameCount,
  frameUrlTemplate,
}: ScrollImageSequenceProps) {
  const progress = useScrollProgress();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(-1);
  const [isMobile, setIsMobile] = useState(false);

  // Helper to resolve nearest loaded image frame
  const getNearestLoadedImage = (targetIndex: number) => {
    const images = imagesRef.current;
    if (!images) return null;

    // Search backward
    for (let i = targetIndex; i >= 0; i--) {
      if (images[i] && images[i].complete && images[i].naturalWidth > 0) {
        return images[i];
      }
    }

    // Search forward
    for (let i = targetIndex + 1; i < frameCount; i++) {
      if (images[i] && images[i].complete && images[i].naturalWidth > 0) {
        return images[i];
      }
    }

    return null;
  };

  // Perform canvas cover draw
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = getNearestLoadedImage(index);
    if (!image) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    // High-DPI canvas scaling
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const imgRatio = image.width / image.height;
    const canvasRatio = width / height;

    let drawWidth = width;
    let drawHeight = height;
    let drawX = 0;
    let drawY = 0;

    if (canvasRatio > imgRatio) {
      drawHeight = width / imgRatio;
      drawY = (height - drawHeight) / 2;
    } else {
      drawWidth = height * imgRatio;
      drawX = (width - drawWidth) / 2;
    }

    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset scale transform
  };

  // Viewport resize and mobile check
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      drawFrame(currentFrameRef.current >= 0 ? currentFrameRef.current : 0);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Frame progressive preloading effect
  useEffect(() => {
    let isMounted = true;
    const urls = Array.from({ length: frameCount }, (_, i) => frameUrlTemplate(i + 1));
    const loadedImages: HTMLImageElement[] = [];

    // Load first frame immediately
    const firstImg = new Image();
    firstImg.src = urls[0];
    firstImg.onload = () => {
      if (!isMounted) return;
      loadedImages[0] = firstImg;
      drawFrame(0);

      // Load rest of frames in background
      urls.forEach((url, index) => {
        if (index === 0) return;
        
        // Skip every other frame on mobile to save memory & bandwidth
        if (isMobile && index % 2 !== 0) return;

        const img = new Image();
        img.src = url;
        img.onload = () => {
          if (!isMounted) return;
          loadedImages[index] = img;

          // Redraw immediately if user is on this frame
          if (currentFrameRef.current === index) {
            drawFrame(index);
          }
        };
      });
    };

    imagesRef.current = loadedImages;

    return () => {
      isMounted = false;
      loadedImages.forEach(img => {
        if (img) {
          img.onload = null;
          img.onerror = null;
        }
      });
      imagesRef.current = [];
    };
  }, [frameCount, isMobile]);

  // Redraw when scroll progress triggers new frames
  useEffect(() => {
    const frameIndex = Math.min(
      frameCount - 1,
      Math.max(0, Math.floor(progress * frameCount))
    );

    if (currentFrameRef.current !== frameIndex) {
      currentFrameRef.current = frameIndex;
      requestAnimationFrame(() => {
        drawFrame(frameIndex);
      });
    }
  }, [progress, frameCount]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
