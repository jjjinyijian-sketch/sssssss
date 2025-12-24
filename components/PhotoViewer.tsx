
import React from 'react';

interface PhotoViewerProps {
  src: string;
}

const PhotoViewer: React.FC<PhotoViewerProps> = ({ src }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-500 p-4 md:p-12">
      <div className="relative w-full h-full flex items-center justify-center max-w-7xl mx-auto">
        {/* Main Image Container */}
        <div className="relative group flex items-center justify-center w-full h-full">
          <img 
            src={src} 
            alt="Captured Moment" 
            className="rounded-xl shadow-[0_0_80px_rgba(234,179,8,0.4)] border-2 border-yellow-500/30 object-contain w-full h-full max-h-[85vh]"
          />
          
          {/* Ornamental Frame Corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-yellow-500/50 rounded-tl-xl -translate-x-2 -translate-y-2"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-yellow-500/50 rounded-tr-xl translate-x-2 -translate-y-2"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-yellow-500/50 rounded-bl-xl -translate-x-2 translate-y-2"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-yellow-500/50 rounded-br-xl translate-x-2 translate-y-2"></div>

          {/* Sparkles around the frame */}
          <div className="absolute -top-6 left-1/4 w-4 h-4 text-yellow-500 animate-bounce delay-75">✨</div>
          <div className="absolute -bottom-6 right-1/4 w-4 h-4 text-yellow-500 animate-bounce delay-150">✨</div>
        </div>
        
        {/* Caption Overlay */}
        <div className="absolute bottom-0 left-0 right-0 text-center pb-4 md:pb-8 pointer-events-none">
            <h2 className="text-xl md:text-3xl font-serif text-yellow-400 italic drop-shadow-md merry-christmas-font">
              "A Golden Christmas Memory"
            </h2>
            <p className="text-yellow-100/40 text-[10px] md:text-xs mt-2 uppercase tracking-[0.3em]">
              Release pinch to return to the tree
            </p>
        </div>

        {/* Floating background particles (CSS only) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoViewer;
