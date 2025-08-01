import { useEffect, useRef, useState } from 'react';

export default function VantaDots() {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!vantaEffect && window.VANTA && window.THREE && vantaRef.current) {
        const effect = window.VANTA.DOTS({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0x7a20ff,
          backgroundColor: 0x000000,
          size: 2.9,
          spacing: 14.0,
          showLines: false,
          THREE: window.THREE,
        });
        setVantaEffect(effect);
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, [vantaEffect]);

  return (
    <div
      ref={vantaRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1
      }}
      id="vanta-background"
    />
  );
}