import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import * as THREE from "three";
import Light from "../Light";

const Scene = () => {


  return (
    <>
      <Canvas className="canvas" camera={{ position: [0, 100, 195] }}>
        
        <Light />
        <OrbitControls dampingFactor={0.5} enableDamping="true" />
        <Sky
          azimuth={0.1}
          turbidity={10}
          rayleigh={0.5}
          inclination={0.6}
          distance={1000}
        />
      </Canvas>
    </>
  );
};

export default Scene;
