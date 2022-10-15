import * as THREE from 'three'
import { extend } from '@react-three/fiber'
import glsl from 'babel-plugin-glsl/macro'

class SimulationMaterial extends THREE.ShaderMaterial {
  constructor() {
    

    super({
      vertexShader: `varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
      fragmentShader: glsl`uniform sampler2D positions;
      uniform float uTime;
      uniform float uCurlFreq;
      varying vec2 vUv;
      #pragma glslify: curl = require(glsl-curl-noise2)
      #pragma glslify: noise = require(glsl-noise/classic/3d.glsl)      
      void main() {
        float t = uTime * 0.015;
        vec3 pos = texture2D(positions, vUv).rgb; // basic simulation: displays the particles in place.
        vec3 curlPos = texture2D(positions, vUv).rgb;
        pos = curl(pos * uCurlFreq + t);
        curlPos = curl(curlPos * uCurlFreq + t);
        curlPos += curl(curlPos * uCurlFreq * 2.0) * 0.5;
        curlPos += curl(curlPos * uCurlFreq * 4.0) * 0.25;
        curlPos += curl(curlPos * uCurlFreq * 8.0) * 0.125;
        curlPos += curl(pos * uCurlFreq * 16.0) * 0.0625;
        gl_FragColor = vec4(mix(pos, curlPos, noise(pos + t)), 1.0);
      }`,
      uniforms: {
        uTime: { value: 0 },
        uCurlFreq: { value: 0.25 }
      }
    })
  }
}

extend({ SimulationMaterial })
