import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Navbar from "../../components/Navbar/Navbar.jsx";
import Scene from "../../components/Scene.js/Scene.jsx";
import { useSpring } from "@react-spring/core";
import { a } from "@react-spring/web";

const LandingPage = ({ user, handleLogout }) => {
  const [{ background, fill }, set] = useSpring(
    { background: "#f0f0f0", fill: "#202020" },
    []
  );

  return (
    <>
      <Navbar user={user} handleLogout={handleLogout} />
      <Canvas className="canvas" dpr={[1, 2]}>
        <Scene setBg={set} />
        <OrbitControls
          // enablePan={false}
          // enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </>
  );
};

export default LandingPage;

     
