import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, Stars, Sparkles, Stage } from "@react-three/drei";
import { Effects } from "../Effects";
import * as THREE from "three";
import Light from "../Light";
import TvModel from "../TV";

const Scene = () => {
  return (
    <>
      <Canvas className="canvas" camera={{ position: [0, 100, 195] }}>
        <Light />
        <OrbitControls dampingFactor={0.5} enableDamping="true" />
        {/* <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        /> */}
        <Suspense>
          <Effects />
          <TvModel />
        </Suspense>
      </Canvas>
    </>
  );
};

export default Scene;
