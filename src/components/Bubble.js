import React, { useEffect, useRef, useState, useMemo } from "react";
import { MeshRefractionMaterial } from "../shaders/MeshRefractionMaterial.js";
import { useFBO, useDetectGPU, useScroll } from "@react-three/drei";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useSpring } from "@react-spring/core";
import { a } from "@react-spring/three";
import { useControls } from "leva";

const Bubble = ({ setBg }) => {

    const { size, viewport } = useThree()
    const [rEuler, rQuaternion] = useMemo(() => [new THREE.Euler(), new THREE.Quaternion()], [])

    const { dark, color, environment, ...config } = useControls({
        uRefractPower: { value: 0.1, min: 0, max: 1 },
        uTransparent: { value: 0.09, min: 0, max: 1 },
        uNoise: { value: 0.03, min: 0, max: 1, step: 0.01 },
        uHue: { value: 0.0, min: 0, max: Math.PI * 2, step: 0.01 },
        uSat: { value: 1.0, min: 1, max: 1.25, step: 0.01 },
        uFrequency: { value: 0.2 },
        uAmplitude: { value: 0.4 },
        uResolution: [1, 1],
        uTime: { value: 0 }
    })

    const sphere = useRef();
    const fbo = useFBO(1024)
    const GPU = useDetectGPU();
    const [mode, setMode] = useState(false);
    const [down, setDown] = useState(false);
    const [hovered, setHovered] = useState(false);

    //Calculate GPU / resolution
    const resolution = useMemo(() => {
        switch (GPU.tier) {
            case 3: {
                return GPU.isMobile ? 300 : 450;
            }
            case 2: {
                return GPU.isMobile ? 200 : 300;
            }
            case 1: {
                return GPU.isMobile ? 150 : 256;
            }
            default: {
                return GPU.isMobile ? 100 : 128;
            }
        }
    }, [GPU]);

    // Change cursor on hovered state


    // Make the bubble float and follow the mouse
    // This is frame-based animation, useFrame subscribes the component to the render-loop
    useFrame((state) => {

        const { clock, mouse } = state;
        sphere.current.material.uniforms.uTime.value = clock.getElapsedTime();
        sphere.current.position.x = 0
        sphere.current.position.y = 0
        sphere.current.position.z = 0
        sphere.current.visible = false
        state.gl.setRenderTarget(fbo)
        state.gl.render(state.scene, state.camera)
        state.scene.background = null
        state.gl.setRenderTarget(null)
        sphere.current.visible = true

        // Move camera on mouse move
        rEuler.set((mouse.y * viewport.height) / 100, (mouse.x * viewport.width) / 100, 0)
        sphere.current.quaternion.slerp(rQuaternion.setFromEuler(rEuler), 0.1)

        // Make sphere hover slightly up and down
        if (sphere.current) {
            sphere.current.position.x = THREE.MathUtils.lerp(
                sphere.current.position.x,
                hovered ? state.mouse.x / 2 : 0,
                0.2
            );
            sphere.current.position.y = THREE.MathUtils.lerp(
                sphere.current.position.y,
                Math.sin(state.clock.elapsedTime / 1.5) / 6 +
                (hovered ? state.mouse.y / 2 : 0),
                0.2
            );
        }
    });

    const [{ wobble }] = useSpring(
        {
            wobble: down ? 1.2 : hovered ? 1.05 : 1,
            config: (n) =>
                n === "wobble" && hovered && { mass: 2, tension: 10, friction: 0.2 },
        },
        [mode, hovered, down]
    );

    return (
        <>
            <a.mesh
                ref={sphere}
                scale={wobble}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onPointerDown={() => setDown(true)}
                onPointerUp={() => {
                    setDown(false);
                    // Toggle mode between dark and bright
                    setMode(!mode);
                    setBg({
                        background: !mode ? "#202020" : "#e8e8e8",
                        fill: !mode ? "#e8e8e8" : "#202020",
                    });
                }}
            >
                <sphereBufferGeometry args={[15, 64, 64]} />
                <MeshRefractionMaterial
                    uSceneTex={fbo.texture}
                    uRefractPower={1.0}
                    uRefractNormal={0.85}
                    uTransparent={0.35}
                    uSat={1.03}
                    uIntensity={2}
                    uResolution={[resolution, resolution]}
                    uTime={10.0}
                    {...config}
                    //wireframe={true}
                />
            </a.mesh>

        </>
    );
};

export default Bubble;
