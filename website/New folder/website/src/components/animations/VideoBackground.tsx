import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface VideoBackgroundProps {
  videoSrc?: string;
  fallbackImage?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  overlayOpacity?: number;
  parallaxStrength?: number;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({
  videoSrc,
  fallbackImage = '/assets/images/hero-bg.jpg',
  children,
  overlay = true,
  overlayOpacity = 0.5,
  parallaxStrength = 0.5
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${parallaxStrength * 100}%`]);

  useEffect(() => {
    // Ensure video plays on mount
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Video autoplay prevented:', err);
      });
    }
  }, []);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      <motion.div
        style={{ y }}
        className="absolute inset-0 w-full h-full"
      >
        {videoSrc ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster={fallbackImage}
          >
            <source src={videoSrc} type="video/mp4" />
            <source src={videoSrc.replace('.mp4', '.webm')} type="video/webm" />
            {/* Fallback image if video doesn't load */}
            <img 
              src={fallbackImage} 
              alt="Background" 
              className="w-full h-full object-cover"
            />
          </video>
        ) : (
          <img 
            src={fallbackImage} 
            alt="Background" 
            className="w-full h-full object-cover"
          />
        )}

        {/* Overlay */}
        {overlay && (
          <div 
            className="absolute inset-0 bg-gradient-to-b from-kopma_green-900/80 via-kopma_green-800/70 to-kopma_green-900/90"
            style={{ opacity: overlayOpacity }}
          />
        )}
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default VideoBackground;
