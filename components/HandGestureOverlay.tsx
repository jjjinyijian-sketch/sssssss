
import React, { useRef, useEffect, useState } from 'react';
import { HandGestureData } from '../types';

interface HandGestureOverlayProps {
  onGestureUpdate: (data: HandGestureData) => void;
  onStatusChange?: (status: 'loading' | 'ready' | 'error', message?: string) => void;
  retryCount?: number; // Used to trigger re-renders/retries from parent
}

const HandGestureOverlay: React.FC<HandGestureOverlayProps> = ({ 
  onGestureUpdate, 
  onStatusChange,
  retryCount = 0 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMountedRef = useRef(true);
  
  const onGestureUpdateRef = useRef(onGestureUpdate);
  useEffect(() => {
    onGestureUpdateRef.current = onGestureUpdate;
  }, [onGestureUpdate]);

  useEffect(() => {
    isMountedRef.current = true;
    let handLandmarker: any = null;
    let animationFrameId: number;
    let stream: MediaStream | null = null;

    const loadMediaPipe = async () => {
      if (onStatusChange) onStatusChange('loading');
      try {
        const { FilesetResolver, HandLandmarker } = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0');
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        if (!isMountedRef.current) return;

        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        if (isMountedRef.current) {
          await startCamera();
        }
      } catch (err) {
        console.error("MediaPipe failed to load", err);
        if (isMountedRef.current && onStatusChange) {
          onStatusChange('error', "Failed to load gesture model.");
        }
      }
    };

    const startCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (onStatusChange) onStatusChange('error', "Your browser doesn't support camera access.");
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 320 }, 
              height: { ideal: 240 },
              facingMode: "user"
            },
            audio: false 
        });
        
        if (videoRef.current && isMountedRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (!isMountedRef.current) return;
            videoRef.current?.play().then(() => {
              if (onStatusChange) onStatusChange('ready');
              requestAnimationFrame(predict);
            }).catch(e => {
              console.warn("Video play was interrupted:", e);
            });
          };
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        if (isMountedRef.current && onStatusChange) {
          const msg = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
            ? "Camera permission denied. Please enable it to use hand gestures."
            : "Could not access camera.";
          onStatusChange('error', msg);
        }
      }
    };

    const predict = () => {
      if (!isMountedRef.current) return;

      if (handLandmarker && videoRef.current && videoRef.current.readyState >= 2) {
        try {
          const results = handLandmarker.detectForVideo(videoRef.current, performance.now());
          if (results.landmarks && results.landmarks.length > 0) {
            processGestures(results.landmarks[0]);
          } else {
            onGestureUpdateRef.current({ gesture: 'none', x: 0.5, y: 0.5, rotation: 0 });
          }
        } catch (e) {
          console.error("Prediction error", e);
        }
      }
      animationFrameId = requestAnimationFrame(predict);
    };

    const processGestures = (landmarks: any[]) => {
      const getDist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const middleTip = landmarks[12];
      const ringTip = landmarks[16];
      const pinkyTip = landmarks[20];
      const wrist = landmarks[0];

      const pinchDist = getDist(thumbTip, indexTip);
      const isPinch = pinchDist < 0.05;

      const avgFingerDist = (getDist(indexTip, wrist) + getDist(middleTip, wrist) + getDist(ringTip, wrist) + getDist(pinkyTip, wrist)) / 4;
      const isFist = avgFingerDist < 0.25;
      const isOpen = avgFingerDist > 0.45;

      const centerX = 1 - landmarks[0].x; 
      const rotation = (centerX - 0.5) * 2; 

      let gesture: 'fist' | 'open' | 'pinch' | 'none' = 'none';
      if (isPinch) gesture = 'pinch';
      else if (isFist) gesture = 'fist';
      else if (isOpen) gesture = 'open';

      onGestureUpdateRef.current({
        gesture,
        x: centerX,
        y: landmarks[0].y,
        rotation: rotation
      });
    };

    loadMediaPipe();

    return () => {
      isMountedRef.current = false;
      cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [retryCount]); 

  return (
    <div className="fixed top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none opacity-0 invisible" aria-hidden="true">
      <video ref={videoRef} playsInline muted />
    </div>
  );
};

export default HandGestureOverlay;
