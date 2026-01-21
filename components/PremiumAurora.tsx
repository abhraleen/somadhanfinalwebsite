import React from 'react';
import './PremiumAurora.css';

export interface PremiumAuroraProps {
  primaryColor?: string;
  secondaryColor?: string;
  intensity?: number; // 0..1 controls overall opacity
  speed?: number; // seconds per cycle
  angle?: number; // degrees rotation of bands
  mixBlendMode?: React.CSSProperties['mixBlendMode'];
  className?: string;
}

const PremiumAurora: React.FC<PremiumAuroraProps> = ({
  primaryColor = '#d4d1d1',
  secondaryColor = '#d44912',
  intensity = 0.4,
  speed = 10,
  angle = -24,
  mixBlendMode = 'screen',
  className = '',
}) => {
  return (
    <div
      className={`aurora-container ${className}`}
      style={{
        ['--aurora-color-1' as any]: primaryColor,
        ['--aurora-color-2' as any]: secondaryColor,
        ['--aurora-intensity' as any]: intensity.toString(),
        ['--aurora-speed' as any]: `${speed}s`,
        ['--aurora-angle' as any]: `${angle}deg`,
        mixBlendMode,
      }}
      aria-hidden="true"
    >
      <div className="aurora-layer band band-one"></div>
      <div className="aurora-layer band band-two"></div>
      <div className="aurora-layer glow"></div>
      <div className="aurora-layer grain"></div>
    </div>
  );
};

export default PremiumAurora;
