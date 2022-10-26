import React, { Suspense, useState } from "react";
import {
  OrbitControls,
  Stars,
  Sparkles,
  Environment,
  PerspectiveCamera,
  ContactShadows,
} from "@react-three/drei";
import { Effects } from "../Effects";
import { a } from "@react-spring/three";
import Light from "../Light";
import TvModel from "../TV";
import Bubble from "../Bubble.js";

const Scene = ({ setBg }) => {
  const [mode, setMode] = useState(false);

  return (
    <>
      <Light />
      <OrbitControls dampingFactor={0.5} enableDamping="true" />
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      <PerspectiveCamera
        makeDefault
        position={[0, 0, 15]}
        fov={75}
      ></PerspectiveCamera>
      <Suspense fallback={null}>
        <Effects />
        <TvModel />

        <Bubble setBg={setBg} />

        <Environment preset="lobby" />
        <ContactShadows
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, -1.6, 0]}
          opacity={mode ? 1.8 : 0.4}
          width={15}
          height={15}
          blur={2.5}
          far={1.6}
        />
      </Suspense>
      {/* </Canvas> */}
    </>
  );
};

export default Scene;
