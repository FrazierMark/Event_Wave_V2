import React, { forwardRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { Circle, Sphere } from "@react-three/drei";

// const Sun = forwardRef(function Sun(props, forwardRef) {
//     useFrame(({ clock }) => {
//         forwardRef.current.position.x =
//             Math.sin(clock.getElapsedTime() * 0.3) * -15;
//     });

//     return (
//         <mesh ref={forwardRef} position={[0, 0, -15]}>
//             <sphereGeometry args={[1, 36, 36]} />
//             <meshBasicMaterial color={"#FF0000"} />
//         </mesh>
//     );
// });

const Sun = forwardRef(function Sun(props, forwardRef) {
    const { value: sunColor } = useControls('sun color', { value: '#FF0000' })

    return (
        <Sphere args={[20, 20]} ref={forwardRef} position={[0, 0, -15]} {...props}>
            <meshBasicMaterial color={sunColor} />
        </Sphere>
        // <mesh ref={forwardRef} position={[0, 0, -10]}>
        //     <sphereGeometry args={[3, 36, 36]} />
        //     <meshBasicMaterial color={sunColor} />
        // </mesh>
    )
})

export default Sun
