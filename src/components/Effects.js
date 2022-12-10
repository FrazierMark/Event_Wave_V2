import { ChromaticAberration, Bloom, Glitch, EffectComposer, Noise, DepthOfField, GodRays } from "@react-three/postprocessing";
import { useControls } from "leva";
import { BlendFunction, GlitchMode } from 'postprocessing';
import Bubble from "./Bubble";
import { useState } from "react";
import Sun from "./Sun";


function Effects({ setBg }) {

  const [sunRef, setSunRef] = useState();

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


  const { exposure, decay, blur } = useControls('PostProcessing - GodRays', {
    exposure: {
      value: 0.34,
      min: 0,
      max: 1,
    },
    decay: {
      value: 0.9,
      min: 0,
      max: 1,
      step: 0.1,
    },
    blur: {
      value: false,
    },
  })


  return (
    <>
      <Sun ref={setSunRef} />

      {sunRef && (
      <EffectComposer>

          <GodRays
            sun={sunRef}
            exposure={exposure}
            decay={decay}
            blur={blur}
            blendFunction={BlendFunction.Screen} // The blend function of this effect.
            samples={64} // The number of samples per pixel.
            density={0.97} // The density of the light rays.
            // decay={0.9} // An illumination decay factor.
            weight={0.86} // A light ray weight factor.
            // exposure={0.2} // A constant attenuation coefficient.
            clampMax={1} // An upper bound for the saturation of the overall effect.
          // width={Resizer.AUTO_SIZE} // Render width.
          // height={Resizer.AUTO_SIZE} // Render height.
          // kernelSize={KernelSize.SMALL} // The blur kernel size. Has no effect if blur is disabled.
          // blur={true} // Whether the god rays should be blurred to reduce artifacts.
          />

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

      )}

    </>
    );
  }
  
  export { Effects };
  