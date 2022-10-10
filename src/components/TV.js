import { useGLTF } from "@react-three/drei";
import React from "react"

export default function TvModel() {
    const { nodes } = useGLTF("/tv-v1.glb")
    return <primitive object={nodes} />
}