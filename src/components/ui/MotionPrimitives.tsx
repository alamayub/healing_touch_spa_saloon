import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { ArrowUp } from 'lucide-react';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_LUXURY: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: EASE_LUXURY }}
    >
      {children}
    </motion.div>
  );
};

export const ScrollProgressBar: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  });

  if (reduceMotion) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-[#C4A36A]"
    />
  );
};

export const BackToTopButton: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 520);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          type="button"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: reduceMotion ? 'auto' : 'smooth',
            })
          }
          aria-label="Scroll back to top"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 10 }}
          transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
          className="fixed bottom-5 left-5 z-30 inline-flex h-11 w-11 items-center justify-center border border-[#183D35]/20 bg-[#FBF9F5]/95 text-[#183D35] shadow-sm backdrop-blur-xs transition-colors hover:border-[#183D35] hover:bg-[#183D35] hover:text-[#FBF9F5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183D35]"
        >
          <ArrowUp className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export const CalmReveal: React.FC<RevealProps> = ({ children, delay = 0, className = '' }) => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.45, delay, ease: EASE_OUT_EXPO }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerSequence: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.06 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: EASE_OUT_EXPO },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
