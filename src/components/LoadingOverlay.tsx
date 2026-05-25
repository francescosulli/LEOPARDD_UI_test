import { motion } from 'framer-motion';
import { Radar } from 'lucide-react';

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
};

export default function LoadingOverlay({
  visible,
  message = 'Acquiring orbital catalog...',
}: LoadingOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-astro-950/86 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mission-panel scanlines relative grid w-[min(420px,calc(100vw-32px))] place-items-center overflow-hidden rounded p-8 text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          className="mb-5 grid h-16 w-16 place-items-center rounded-full border border-astro-orange/30 bg-astro-orange/10 text-astro-orange shadow-glow"
        >
          <Radar size={30} />
        </motion.div>
        <p className="text-sm uppercase tracking-[0.2em] text-white/72">{message}</p>
        <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-white/8">
          <motion.div
            animate={{ x: ['-25%', '120%'] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
            className="h-full w-1/3 rounded-full bg-astro-orange"
          />
        </div>
      </motion.div>
    </div>
  );
}
