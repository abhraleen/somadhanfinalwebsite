import * as React from 'react';
import { motion, useInView, type Transition } from 'framer-motion';

export type WritingTextProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  transition?: Transition;
  inView?: boolean;
  inViewMargin?: string;
  inViewOnce?: boolean;
  spacing?: number | string;
  text: string;
};

function WritingText({
  ref,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  spacing = 5,
  text,
  transition = { type: 'spring', bounce: 0, duration: 2, delay: 0.5 },
  ...props
}: WritingTextProps) {
  const localRef = React.useRef<HTMLSpanElement>(null);
  React.useImperativeHandle(ref as any, () => localRef.current as HTMLSpanElement);

  const isObserved = useInView(localRef, {
    once: inViewOnce,
    // Cast to any to accommodate differing MarginType signatures across versions
    margin: inViewMargin as any,
  });
  const isInView = !inView || isObserved;

  const words = React.useMemo(() => text.split(' '), [text]);

  return (
    <span data-slot="writing-text" ref={localRef} {...(props as any)}>
      {words.map((word, index) => (
        <motion.span
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          className="inline-block will-change-transform will-change-opacity"
          initial={{ opacity: 0, y: 10 }}
          key={index}
          style={{ marginRight: spacing }}
          transition={{
            ...transition,
            delay: index * (transition?.delay ?? 0),
          }}
        >
          {word}{' '}
        </motion.span>
      ))}
    </span>
  );
}

export { WritingText };
export default WritingText;
