import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { MeshRefractionMaterial } from "../../shaders/MeshRefractionMaterial.js";
import {
  OrbitControls,
  Sky,
  Stars,
  Sparkles,
  Environment,
  PerspectiveCamera,
  MeshDistortMaterial,
  ContactShadows,
  useFBO,
} from "@react-three/drei";
import { Effects } from "../Effects";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useSpring } from "@react-spring/core";
import { a } from "@react-spring/three";
import { useControls } from "leva";
import Light from "../Light";
import TvModel from "../TV";

import Bubble from "../Bubble.js";

// React-spring animates native elements, in this case <mesh/> etc,
// but it can also handle 3rd–party objs, just wrap them in "a".
const AnimatedMaterial = a(MeshDistortMaterial);

const Scene = ({ setBg }) => {
  const sphere = useRef();
  const light = useRef();
  const [mode, setMode] = useState(false);
  const [down, setDown] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Change cursor on hovered state
  useEffect(() => {
    document.body.style.cursor = hovered
      ? "none"
      : `url('data:image/svg+xml;base64,${btoa(
          '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="10" fill="#E8B059"/></svg>'
        )}'), auto`;
  }, [hovered]);

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
        position={[0, 0, 5]}
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
          opacity={mode ? 0.8 : 0.4}
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
