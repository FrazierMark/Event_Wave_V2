import glsl from 'babel-plugin-glsl/macro'
import * as THREE from 'three'
import { extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'


// Inspired from pmdn.rs - https://codesandbox.io/s/relaxed-edison-46jpyh
// Inspired from John Beresford - https://www.lab.john-beresford.com/experiments/chaossphere 

const MeshRefractionMaterialImpl = shaderMaterial(
  {
    uTime: 0,
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

  #pragma glslify: cnoise = require(glsl-noise/classic/4d)


  float fbm(vec4 p) {
    float f = 0.0;
  
    float a = FBM_INIT_AMP;
    float fq = FBM_INIT_FREQ;
    for(int i = 0; i < 4; i++) {
      f += a * cnoise(p * fq);
      a *= FBM_GAIN;
      fq *= FBM_LACUNARITY;
    }
    return f;
  }
  
  float domainDistort(vec4 p) {
    float f = cnoise(-p.xwzy * 3.0);
  
    return fbm(p + f);
  }


  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vWorldPos;
  uniform float uTime;
  uniform float uFrequency;
  uniform float uAmplitude;
  uniform vec2 uResolution;

  #pragma glslify: snoise3 = require(glsl-noise/simplex/3d.glsl);
  
  void main() {
    vec3 pos = position;

    float displacement = domainDistort(vec4(pos * uFrequency, uTime)) * uAmplitude;

    pos += displacement * position;


    vec4 worldPos = modelMatrix * vec4( pos, 1.0 );

    // worldPos.y += sin(worldPos.x * uFrequency.x + uTime) * uAmplitude.x;
    // worldPos.x += cos(worldPos.y * uFrequency.y + uTime) * uAmplitude.y;

    vec4 mvPosition = viewMatrix * worldPos;

    gl_Position = projectionMatrix * mvPosition;
    vec3 transformedNormal = normalMatrix * normal;
    vec3 normal = normalize( transformedNormal );
    vUv = uv;
    vNormal = normal;
    vViewPos = -mvPosition.xyz;
    vWorldPos = worldPos.xyz;
  }`,
    glsl`uniform float uTransparent;
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
  };

  void main() {
    vec2 uv = gl_FragCoord.xy / winResolution.xy;
    vec2 refractNormal = vNormal.xy * (1.0 - vNormal.z * uRefractNormal);
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
    //gl_FragColor = vec4(refractCol * uIntensity, 1.0);
    gl_FragColor = vec4(hue(refractCol * uIntensity, uHue), 1.0);
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


