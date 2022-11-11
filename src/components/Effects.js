import { ChromaticAberration, Bloom, Glitch, EffectComposer, Noise, DepthOfField } from "@react-three/postprocessing";
import { useControls } from "leva";

function Effects() {
    const {
      args,
      glitch,
      bloom,
      noise,
      chromaticAberration,
      depthOfField
    } = useControls({
      args: [1, 1, 1],
      glitch: false,
      bloom: false,
      noise: false,
      chromaticAberration: false,
      depthOfField: { target: [0, 0, 10], focalLength: 0.8, height: 700 }
    });

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
        {depthOfField && (
          <DepthOfField target={[0, 0, 10]} focalLength={0.8} bokehScale={8} height={700} />
        )}
      </EffectComposer>
    );
  }
  
  export { Effects };
  