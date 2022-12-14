import glsl from 'babel-plugin-glsl/macro'
import * as THREE from 'three'
import { extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'


// Mostly from ->>> @0xca0a (twitter) pmdn.rs - https://codesandbox.io/s/relaxed-edison-46jpyh
// Inspired from nemutas -  ha-labo-effect - https://github.com/nemutas/ha-labo-effect
// Inspired from John Beresford - https://www.lab.john-beresford.com/experiments/chaossphere


const MeshRefractionMaterialImpl = shaderMaterial(
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

  glsl`
  precision mediump float;
  
  #define PI 3.1415926535897932384626433832795;
  #define FBM_INIT_AMP 0.5;
  #define FBM_INIT_FREQ 1.0;
  #define FBM_GAIN 0.675;
  #define FBM_LACUNARITY 4.0;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vWorldPos;
  varying float vWave;
  varying vec3 v_normal;
  varying vec3 v_eye;
  uniform float uTime;
  uniform float uFrequency;
  uniform float uAmplitude;
  uniform vec2 uResolution;
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
  #pragma glslify: noise = require(glsl-noise/classic/3d.glsl) 
  vec3 orthogonal(vec3 v) {
    return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y));
  }
  vec3 displace(vec3 v) {
    vec3 result = v;
    float n = noise(result * 3.0 + uTime * 0.8);
    result += normal * n * 0.25;
    return result;
  }
  vec3 recalcNormal(vec3 newPos) {
    float offset = 0.001;
    vec3 tangent = orthogonal(normal);
    vec3 bitangent = normalize(cross(normal, tangent));
    vec3 neighbour1 = position + tangent * offset;
    vec3 neighbour2 = position + bitangent * offset;
    vec3 displacedNeighbour1 = displace(neighbour1);
    vec3 displacedNeighbour2 = displace(neighbour2);
    vec3 displacedTangent = displacedNeighbour1 - newPos;
    vec3 displacedBitangent = displacedNeighbour2 - newPos;
    return normalize(cross(displacedTangent, displacedBitangent));
  }
  void main() {
    vec3 pos = displace(position);
    vec3 correctedNormal = recalcNormal(pos);
    v_normal = normalize(normalMatrix * correctedNormal);
    v_eye = normalize(modelViewMatrix * vec4( pos, 1.0 )).xyz;
  
    vec4 worldPos = modelMatrix * vec4( pos, 1.0 );
    vec4 mvPosition = viewMatrix * worldPos;
    gl_Position = projectionMatrix * mvPosition;
    vec3 transformedNormal = normalMatrix * normal;
    // vec3 normal = normalize( transformedNormal );
    vec3 normal = v_normal;
    vUv = uv;
    vNormal = normal;
    vViewPos = -mvPosition.xyz;
    vWorldPos = worldPos.xyz;
  }`,
  glsl`
    
  precision mediump float;
  uniform float uTransparent;
  uniform vec2 winResolution;
  uniform float uRefractPower;
  uniform float uRefractNormal;
  uniform float uNoise;  
  uniform float uSat;
  uniform float uIntensity;
  uniform float uHue;
  uniform float uTime;
  
  // uniform samplerCube uEnvMap;
  uniform sampler2D uSceneTex;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vWorldPos;
  varying float vWave;
  varying vec3 v_normal;
  varying vec3 v_eye;
  
  float random(vec2 p) {
    return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }
  vec3 sat(vec3 rgb, float adjustment) {
    // Algorithm from Chapter 16 of OpenGL Shading Language    
    const vec3 W = vec3(0.2125, 0.7154, 0.0721);
    vec3 intensity = vec3(dot(rgb, W));
    return mix(intensity, rgb, adjustment);
  }
  vec3 hue( vec3 color, float hueAdjust ){
    const vec3  kRGBToYPrime = vec3 (0.299, 0.587, 0.114);
    const vec3  kRGBToI      = vec3 (0.596, -0.275, -0.321);
    const vec3  kRGBToQ      = vec3 (0.212, -0.523, 0.311);
    const vec3  kYIQToR     = vec3 (1.0, 0.956, 0.621);
    const vec3  kYIQToG     = vec3 (1.0, -0.272, -0.647);
    const vec3  kYIQToB     = vec3 (1.0, -1.107, 1.704);
    float   YPrime  = dot (color, kRGBToYPrime);
    float   I       = dot (color, kRGBToI);
    float   Q       = dot (color, kRGBToQ);
    float   hue     = atan (Q, I);
    float   chroma  = sqrt (I * I + Q * Q);
    hue += hueAdjust;
    Q = chroma * sin (hue);
    I = chroma * cos (hue);
    vec3    yIQ   = vec3 (YPrime, I, Q);
    return vec3( dot (yIQ, kYIQToR), dot (yIQ, kYIQToG), dot (yIQ, kYIQToB) );
}
  struct Geometry {
    vec3 pos;
    vec3 posWorld;
    vec3 viewDir;
    vec3 viewDirWorld;
    vec3 normal;
    vec3 normalWorld;
    float uTime;
  };
  void main() {
  
    vec2 uv = gl_FragCoord.xy / winResolution.xy;
    vec2 refractNormal = v_normal.xy * (1.0 - v_normal.z * uRefractNormal );
    vec3 refractCol = vec3( 0.0 );
    float slide;
    vec2 refractUvR;
    vec2 refractUvG;
    vec2 refractUvB;
    #pragma unroll_loop_start
    for ( int i = 0; i < 8; i ++ ) {
      slide = float(UNROLLED_LOOP_INDEX) / float(8) * 0.1 + random(uv) * uNoise;
      refractUvR = uv - refractNormal * ( uRefractPower + slide * 1.0 ) * uTransparent;
      refractUvG = uv - refractNormal * ( uRefractPower + slide * 2.0 ) * uTransparent;
      refractUvB = uv - refractNormal * ( uRefractPower + slide * 3.0 ) * uTransparent;
      refractCol.r += texture2D( uSceneTex, refractUvR ).r;
      refractCol.g += texture2D( uSceneTex, refractUvG ).g;
      refractCol.b += texture2D( uSceneTex, refractUvB ).b;
      refractCol = sat(refractCol, uSat);
    }
    #pragma unroll_loop_end
    refractCol /= float( 8 );
    gl_FragColor = vec4(hue(refractCol * uIntensity, uHue ), 1.0);
    #include <tonemapping_fragment>
    #include <encodings_fragment>
  }`
)


export function MeshRefractionMaterial(props) {
    extend({ MeshRefractionMaterial: MeshRefractionMaterialImpl })
    const size = useThree((state) => state.size)
    const dpr = useThree((state) => state.viewport.dpr)
    return <meshRefractionMaterial winResolution={[size.width * dpr, size.height * dpr]} {...props} />
}
