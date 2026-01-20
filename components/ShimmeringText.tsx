import React from 'react';

interface ShimmeringTextProps {
  text: string;
  duration?: number;
  wave?: boolean;
  className?: string;
  color?: string;
  shimmeringColor?: string;
}

const ShimmeringText: React.FC<ShimmeringTextProps> = ({
  text,
  duration = 1.2,
  wave = false,
  className = '',
  color = 'rgba(255,255,255,0.7)',
  shimmeringColor = 'rgba(255,255,255,1)',
}) => {
  const chars = text.split('');
  return (
    <span
      className={`relative inline-block ${className}`}
      style={{
        ['--color' as any]: color,
        ['--shimmering-color' as any]: shimmeringColor,
      }}
    >
      {chars.map((char, i) => (
        <span
          key={i}
          className="inline-block whitespace-pre"
          style={{
            animation: `shimmerChar ${duration}s ease-in-out ${((i * duration) / chars.length).toFixed(2)}s infinite`,
            color: 'var(--color)',
          }}
        >
          {char}
        </span>
      ))}
      <style>{`
        @keyframes shimmerChar {
          0% { color: var(--color); transform: ${wave ? 'translateY(0) rotateY(0)' : 'none'}; }
          50% { color: var(--shimmering-color); transform: ${wave ? 'translateY(-2px) rotateY(8deg)' : 'none'}; }
          100% { color: var(--color); transform: ${wave ? 'translateY(0) rotateY(0)' : 'none'}; }
        }
      `}</style>
    </span>
  );
};

export default ShimmeringText;
