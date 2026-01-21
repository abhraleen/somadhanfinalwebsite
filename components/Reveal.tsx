import React, { useEffect, useRef, useState } from 'react';

type RevealProps = {
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
  /** Delay in seconds before activating once visible */
  delay?: number;
  /** Intersection threshold */
  threshold?: number;
  /** Translate Y in px for initial offset (CSS handles it; here for clarity) */
  y?: number;
  /** If true, applies stagger animation to children */
  staggerChildren?: boolean;
  /** Trigger only once */
  once?: boolean;
};

const Reveal: React.FC<RevealProps> = ({
  as = 'div',
  className = '',
  children,
  delay = 0,
  threshold = 0.15,
  y = 20,
  staggerChildren = false,
  once = true,
}) => {
  const Tag = as as any;
  const ref = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setActive(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Small delay to allow for staged reveals
            const id = window.setTimeout(() => setActive(true), Math.max(0, delay * 1000));
            if (once) {
              observer.unobserve(entry.target);
            }
            return () => window.clearTimeout(id);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold, once]);

  // Optionally inject stagger index into children
  const content = staggerChildren
    ? React.Children.map(children, (child, idx) => {
        if (!React.isValidElement(child)) return child;
        const prevStyle = (child.props as any).style || {};
        return React.cloneElement(child as React.ReactElement<any>, {
          style: { ...prevStyle, ['--stagger-index' as any]: idx },
        });
      })
    : children;

  const cls = [
    'reveal',
    staggerChildren ? 'stagger' : '',
    active ? 'active' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag ref={ref} className={cls} data-reveal-y={y}>
      {content}
    </Tag>
  );
};

export default Reveal;
