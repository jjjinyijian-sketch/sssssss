
import React, { useState, useCallback, useRef } from 'react';
import Scene from './components/Scene';
import HandGestureOverlay from './components/HandGestureOverlay';
import PhotoViewer from './components/PhotoViewer';
import { TreeState, HandGestureData } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE);
  const [gestureData, setGestureData] = useState<HandGestureData>({
    gesture: 'none',
    x: 0.5,
    y: 0.5,
    rotation: 0
  });
  const [isPhotoActive, setIsPhotoActive] = useState(false);
  const [currentViewerPhoto, setCurrentViewerPhoto] = useState<string | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  
  // Camera/Gesture Status
  const [cameraStatus, setCameraStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [cameraErrorMessage, setCameraErrorMessage] = useState<string>("");
  const [retryTrigger, setRetryTrigger] = useState(0);
  
  const availablePhotosRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGestureChange = useCallback((data: HandGestureData) => {
    setGestureData(data);
    
    if (data.gesture === 'fist') {
      setTreeState(TreeState.TREE);
    } else if (data.gesture === 'open') {
      setTreeState(TreeState.EXPLODE);
    }

    if (data.gesture === 'pinch') {
      if (!isPhotoActive && uploadedPhotos.length > 0) {
        if (availablePhotosRef.current.length === 0) {
          availablePhotosRef.current = [...uploadedPhotos];
        }
        const randomIndex = Math.floor(Math.random() * availablePhotosRef.current.length);
        const selectedPhoto = availablePhotosRef.current.splice(randomIndex, 1)[0];
        setCurrentViewerPhoto(selectedPhoto);
        setIsPhotoActive(true);
      }
    } else {
      setIsPhotoActive(false);
    }
  }, [isPhotoActive, uploadedPhotos]);

  const handleStatusChange = useCallback((status: 'loading' | 'ready' | 'error', message?: string) => {
    setCameraStatus(status);
    if (message) setCameraErrorMessage(message);
  }, []);

  const handleRetryCamera = () => {
    setRetryTrigger(prev => prev + 1);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files) as File[];
      const readPromises = fileArray.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readPromises).then(newPhotos => {
        setUploadedPhotos(prev => {
          const updated = [...prev, ...newPhotos];
          availablePhotosRef.current = [...updated];
          return updated;
        });
      });
    }
  };

  const clearPhotos = () => {
    setUploadedPhotos([]);
    availablePhotosRef.current = [];
    setCurrentViewerPhoto(null);
    setIsPhotoActive(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMusicUrl(url);
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();
  const triggerMusicUpload = () => musicInputRef.current?.click();

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        .merry-christmas-font {
          font-family: 'Great Vibes', cursive;
        }
        @keyframes subtle-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(234, 179, 8, 0.3); }
          50% { box-shadow: 0 0 30px rgba(234, 179, 8, 0.6); }
        }
        .glow-box { animation: subtle-glow 3s infinite ease-in-out; }
      `}</style>

      {musicUrl && <audio ref={audioRef} src={musicUrl} autoPlay loop className="hidden" />}

      <Scene treeState={treeState} rotationOffset={gestureData.rotation} photos={uploadedPhotos} />

      <HandGestureOverlay 
        onGestureUpdate={handleGestureChange} 
        onStatusChange={handleStatusChange}
        retryCount={retryTrigger}
      />

      {isPhotoActive && currentViewerPhoto && <PhotoViewer src={currentViewerPhoto} />}

      {/* Camera Permission/Error Overlay */}
      {cameraStatus === 'error' && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
          <div className="max-w-md w-full mx-4 p-8 bg-black/80 border-2 border-yellow-500/30 rounded-3xl text-center glow-box">
            <div className="text-5xl mb-6">📷</div>
            <h2 className="text-2xl text-yellow-100 merry-christmas-font mb-4">Magic Gestures Disabled</h2>
            <p className="text-yellow-100/70 text-sm mb-8 leading-relaxed">
              {cameraErrorMessage || "Camera access is needed for hand gesture interaction."}
              <br />
              <span className="text-[10px] mt-2 block italic text-yellow-500/50">
                Processed locally. No video data is ever stored or transmitted.
              </span>
            </p>
            <button 
              onClick={handleRetryCamera}
              className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition-all active:scale-95 shadow-lg"
            >
              Enable Camera Access
            </button>
          </div>
        </div>
      )}

      {/* Loading Model Overlay */}
      {cameraStatus === 'loading' && (
        <div className="absolute top-6 right-6 z-50 flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
          <span className="text-[10px] text-yellow-100 uppercase tracking-widest">Initializing AI...</span>
        </div>
      )}

      <div className="absolute top-10 left-0 right-0 pointer-events-none flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-4 duration-1000 z-10">
        <h1 className="text-4xl md:text-5xl text-yellow-100 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)] merry-christmas-font tracking-[0.25em]">
          Merry Christmas
        </h1>
        {cameraStatus === 'ready' && (
          <p className="text-[10px] text-yellow-200/40 uppercase tracking-[0.4em] mt-2">
            Hand gesture control active
          </p>
        )}
      </div>

      <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-50 flex flex-col gap-3">
        <button 
          onClick={triggerMusicUpload}
          className="px-5 py-3 md:px-6 md:py-3 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/50 rounded-full text-blue-100 text-xs md:text-sm tracking-widest uppercase transition-all backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95 flex items-center gap-2"
        >
          <span className="text-lg">♫</span> {musicUrl ? 'Change Music' : 'Upload Music'}
        </button>
        <input type="file" ref={musicInputRef} className="hidden" accept="audio/*" onChange={handleMusicUpload} />

        <div className="flex gap-2">
          <button 
            onClick={triggerUpload}
            className="flex-1 px-5 py-3 md:px-6 md:py-3 bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/50 rounded-full text-yellow-200 text-xs md:text-sm tracking-widest uppercase transition-all backdrop-blur-md shadow-[0_0_20px_rgba(234,179,8,0.3)] active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span> Upload Photos
          </button>
          
          {uploadedPhotos.length > 0 && (
            <button 
              onClick={clearPhotos}
              className="px-5 py-3 md:px-6 md:py-3 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded-full text-red-200 text-xs md:text-sm transition-all backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-95 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handlePhotoUpload} />
      </div>

      {/* Interaction Legend Overlay - Bottom Right */}
      {cameraStatus === 'ready' && (
        <div className="absolute bottom-8 right-8 hidden md:flex flex-col gap-2 items-end opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3 text-[10px] text-yellow-100 uppercase tracking-widest">
            <span>Fist to Form Tree</span>
            <div className="w-6 h-6 border border-yellow-500/50 rounded flex items-center justify-center text-[8px]">✊</div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-yellow-100 uppercase tracking-widest">
            <span>Open Palm to Explode</span>
            <div className="w-6 h-6 border border-yellow-500/50 rounded flex items-center justify-center text-[8px]">✋</div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-yellow-100 uppercase tracking-widest">
            <span>Pinch to View Photo</span>
            <div className="w-6 h-6 border border-yellow-500/50 rounded flex items-center justify-center text-[8px]">👌</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
