import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AstreoLogo from '../components/AstreoLogo';

function OrbitalBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-radial-space" />
      <div className="grid-mask absolute inset-0 opacity-70" />
      <div className="absolute left-1/2 top-[48%] h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-astro-orange/10 bg-astro-orange/[0.025] shadow-glow" />
      <div className="landing-orbit absolute left-1/2 top-[48%] h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-astro-orange/24" />
      <div className="landing-orbit absolute left-1/2 top-[48%] h-[440px] w-[780px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-astro-orange/18" />
      <div className="landing-orbit absolute left-1/2 top-[48%] h-[720px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12" />
      <div className="absolute left-1/2 top-[48%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff7ed_0%,#ef7d17_30%,#5f2b0a_62%,#050505_100%)] shadow-glow" />
      <div className="scanlines absolute inset-0" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="relative h-screen overflow-hidden bg-astro-950 text-white">
      <OrbitalBackdrop />
      <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-6 py-5 sm:px-8">
        <AstreoLogo />
        <div className="hidden rounded border border-astro-orange/18 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/64 sm:block">
          Demo pubblica non operativa
        </div>
      </header>

      <section className="relative z-10 flex h-full items-center px-6 pb-8 pt-24 sm:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-astro-orange/22 bg-astro-orange/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/72">
              ASTREO / LEOPARDD Demo
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-astro-orange">
              LEOPARDD
            </p>
            <h1 className="mt-3 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-normal text-white sm:text-7xl lg:text-8xl">
              LEOPARDD Demo
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
              Explore a simplified Space Situational Awareness environment: visualize space debris,
              insert a satellite, propagate its orbit, and identify possible close approaches.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/54">
              Low Earth Orbit Prediction and Analysis of Radar-Detected Debris
            </p>
            <Link
              to="/demo"
              className="mt-8 inline-flex h-12 items-center gap-3 rounded bg-astro-orange px-5 text-sm font-semibold text-astro-950 shadow-glow transition hover:translate-y-[-1px] hover:bg-white"
            >
              Fai partire la demo
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
