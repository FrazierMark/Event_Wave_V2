import { ChromaticAberration, Bloom, Glitch, EffectComposer, Noise } from "@react-three/postprocessing";
import { useControls } from "leva";

function Effects() {
    const {
      args,
      glitch,
      bloom,
      noise,
      chromaticAberration,
    } = useControls({
      args: [1, 1, 1],
      glitch: false,
      bloom: false,
      noise: false,
      chromaticAberration: false,
    });

    return (
      <EffectComposer>
        {glitch && (
          <Glitch
            delay={[args[0] * 1.5, args[0] * 3.5]}
            duration={[args[1] * 0.6, args[1]]}
            strength={[args[2] * 0.3, args[2]]}
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
        
      </EffectComposer>
    );
  }
  
  export { Effects };
  