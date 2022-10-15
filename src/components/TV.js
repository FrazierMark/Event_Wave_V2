import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


export default function TvModel() {
    const model = useLoader(GLTFLoader, '/tv-v1.glb')
    return <primitive object={model.scene} scale={[.1, .1, .1]} metalness={0.0} />
}