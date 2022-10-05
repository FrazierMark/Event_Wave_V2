import React, { useRef } from "react";
import * as THREE from "three";

function Light() {
  const lightProps = {
    color: "white",
    intensity: 100,
    position: [5, 45, 5],
    distance: 35,
    anglePower: 20,
    attenuation: 2,
  };
  const mainLightRef = useRef();
  // useHelper(mainLightRef, THREE.SpotLightHelper, 'red')

  return (
    <>
      <ambientLight color="white" intensity={0.4} />
      <spotLight
        ref={mainLightRef}
        castShadow={true}
        shadow-mapSize-height={512}
        shadow-mapSize-width={512}
        {...lightProps}
      />
    </>
  );
}

export default Light;
