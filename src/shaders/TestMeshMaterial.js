
import glsl from 'babel-plugin-glsl/macro'
import * as THREE from 'three'
import { extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'


const TestMeshMaterialImpl = shaderMaterial(
  {
    uTime: 0.0,
    uAmplitude: 0.5,
    uFrequency: 1.0,
    uRefractPower: 0.3,
    uRefractNormal: 0.85,
    uSceneTex: null,
    uTransparent: 0.5,
    uNoise: 0.03,
    uSat: 0.0,
    uHue: 0.0,
    uIntensity: 1.0,
    winResolution: new THREE.Vector2()
  },

  glsl`attribute vec3 a_position;
  attribute vec2 a_texCoord;
  
  uniform mat4 u_modelViewMatrix;
  uniform mat4 u_projectionMatrix;
  
  varying vec2 v_texCoord;
  
  void main() {
  gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_position, 1.0);
  v_texCoord = a_texCoord;
  }`,

  glsl`
    // Fragment Shader
precision mediump float;

uniform sampler2D u_sampler;

varying vec2 v_texCoord;

void main() {
vec4 color = texture2D(u_sampler, v_texCoord);

// Add transparency to give bubble effect
color.a *= 0.8;

// Add slight distortion to give bubble distortion effect
float dist = distance(v_texCoord, vec2(0.5, 0.5));
color.rgb += (1.0 - dist) * 0.2;

// Add highlight to center of bubble
vec2 center = vec2(0.5, 0.5);
float highlight = smoothstep(0.45, 0.5, dist);
color.rgb += highlight * 0.2;

// Add gradient to edges of bubble
float gradient = smoothstep(0.4, 0.45, dist);
color.rgb += gradient * vec3(0.3, 0.5, 0.7);

gl_FragColor = color;
}`
)


export function TestMeshMaterial(props) {
    extend({ TestMeshMaterial: TestMeshMaterialImpl })
    const size = useThree((state) => state.size)
    const dpr = useThree((state) => state.viewport.dpr)
    return <testMeshMaterial winResolution={[size.width * dpr, size.height * dpr]} {...props} />
}


