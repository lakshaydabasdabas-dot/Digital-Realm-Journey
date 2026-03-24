import { useEffect } from 'react';
import { useLenis } from './hooks/useLenis';
import { useCustomCursor } from './hooks/useCustomCursor';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { StorySection } from './components/StorySection';
import { FeaturesSection } from './components/FeaturesSection';
import { MarqueeSection } from './components/MarqueeSection';
import { CalloutSection } from './components/CalloutSection';
import { Footer } from './components/Footer';

function App() {
  useLenis();
  useCustomCursor();

  return (
    <div style={{ background: 'var(--clr-bg)', minHeight: '100vh' }}>
      {/* Noise grain overlay */}
      <div className="noise" />

      {/* Custom cursor */}
      <div className="cursor">
        <div className="cursor__dot" />
        <div className="cursor__ring" />
      </div>

      {/* Fixed nav */}
      <Nav />

      {/* Main content */}
      <main>
        <Hero />
        <StorySection />
        <FeaturesSection />
        <MarqueeSection />
        <CalloutSection />
      </main>

      <Footer />
    </div>
  );
}

export default App;
