import { ChromaticAberration, Bloom, Glitch, EffectComposer, Noise, DepthOfField } from "@react-three/postprocessing";
import { useControls } from "leva";

function Effects() {
    const {
      args,
      glitch,
      bloom,
      noise,
      chromaticAberration
    } = useControls({
      args: [1, 1, 1],
      glitch: false,
      bloom: false,
      noise: false,
      chromaticAberration: false,
    });

  const { target, focalLength, height, bokehScale } = useControls('dof', {
    target: {
      value: 10,
      step: 10.0,
      min: 0,
      max: 1000
    },
    focalLength: {
      value: 0.8,
      step: 0.01,
      min: 0,
      max: 10
    },
    bokehScale: {
      value: 8,
      step: 0.2,
      min: 0,
      max: 20
    },
    height: {
      value: 700,
      step: 10,
      min: 0,
      max: 1000
    },
  })

    return (
      <EffectComposer>
        {glitch && (
          <Glitch
            delay={[args[0] * 0.5, args[0] * 1.5]}
            duration={[args[1] * 3.6, args[1]]}
            strength={[args[2] * 0.05, args[2]]}
          />
        )}
        {bloom && (
          <Bloom
            intensity={15 * args[0]}
            luminanceSmoothing={0.9 * args[1]}
            luminanceThreshold={0.6 * args[2]}
          />
        )}
        {noise && <Noise />}
        {chromaticAberration && (
          <ChromaticAberration offset={[0.02 * args[0], 0.002 * args[1]]} />
        )}

        <DepthOfField target={[0, 0, target]} focalLength={focalLength} bokehScale={bokehScale} height={height} />

      </EffectComposer>
    );
  }
  
  export { Effects };
  