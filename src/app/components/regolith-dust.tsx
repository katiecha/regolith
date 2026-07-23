"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Particles, ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container, Engine, ISourceOptions } from "@tsparticles/engine";

// Extra click-hit radius (in the canvas's own pixel space) so a 1-4px dot
// is actually clickable — a target that small is otherwise unhittable.
const HIT_PADDING = 14;

async function initEngine(engine: Engine): Promise<void> {
  await loadSlim(engine);
}

const OPTIONS: ISourceOptions = {
  fullScreen: { enable: false },
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  particles: {
    number: { value: 5 },
    paint: { color: { value: "#1A1A1A" } },
    opacity: { value: { min: 0.2, max: 0.6 } },
    size: { value: { min: 1, max: 4 } },
    move: {
      enable: true,
      speed: 0.3,
      direction: "none",
      random: true,
      straight: false,
      outModes: "out",
    },
    links: { enable: false },
  },
  interactivity: {
    events: {
      resize: { enable: true },
    },
  },
  detectRetina: true,
};

export function RegolithDust() {
  const containerRef = useRef<Container | null>(null);
  const router = useRouter();

  const handleLoaded = useCallback(async (container?: Container) => {
    containerRef.current = container ?? null;
  }, []);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      const canvas = container?.canvas.domElement;
      if (!container || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clickX = (event.clientX - rect.left) * scaleX;
      const clickY = (event.clientY - rect.top) * scaleY;
      const padding = HIT_PADDING * scaleX;

      const hit = container.particles.find((particle) => {
        const dx = particle.position.x - clickX;
        const dy = particle.position.y - clickY;
        const radius = particle.size.value + padding;
        return dx * dx + dy * dy <= radius * radius;
      });

      if (hit) {
        router.push("/simulator");
      }
    },
    [router]
  );

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" onClick={handleClick}>
      <ParticlesProvider init={initEngine}>
        <Particles
          id="regolith-dust"
          options={OPTIONS}
          particlesLoaded={handleLoaded}
          className="w-full h-full"
        />
      </ParticlesProvider>
    </div>
  );
}
