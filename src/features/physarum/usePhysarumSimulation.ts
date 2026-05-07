import { useEffect, useMemo, useRef, useState } from "react";

import type { CityArtifact } from "../city-data/schema";
import { PhysarumEngine } from "./physarumEngine";
import type { FoodSource, SimulationFrame } from "./types";

export function usePhysarumSimulation(
  city: CityArtifact | undefined,
  foods: FoodSource[],
  running: boolean,
) {
  const [frame, setFrame] = useState<SimulationFrame | undefined>();
  const [ready, setReady] = useState(false);
  const engineRef = useRef<PhysarumEngine | undefined>(undefined);
  const foodKey = useMemo(
    () => foods.map((food) => `${food.id}:${food.x}:${food.y}`).join("|"),
    [foods],
  );

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setFrame(undefined);

    if (!city) {
      engineRef.current = undefined;
      return;
    }

    const engine = new PhysarumEngine(city);
    engineRef.current = engine;
    engine
      .initialize()
      .then(() => {
        if (!cancelled) {
          setReady(true);
          setFrame({
            trail: engine.snapshot(),
            stats: {
              engine: "cpu",
              agents: 2400,
              fps: 0,
              ticks: 0,
              webgpuAvailable: Boolean(navigator.gpu),
            },
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [city]);

  useEffect(() => {
    engineRef.current?.setFoods(foods);
  }, [foodKey, foods]);

  useEffect(() => {
    if (!running || !ready) {
      return;
    }

    let cancelled = false;
    let animationFrame = 0;
    let busy = false;

    const tick = () => {
      if (cancelled) {
        return;
      }
      if (!busy && engineRef.current) {
        busy = true;
        engineRef.current
          .step()
          .then((nextFrame) => {
            if (!cancelled) {
              setFrame(nextFrame);
            }
          })
          .finally(() => {
            busy = false;
          });
      }
      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
    };
  }, [ready, running]);

  return { frame, ready };
}
