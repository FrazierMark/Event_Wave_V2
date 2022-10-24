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


//	Classic Perlin 3D Noise 
//	by Stefan Gustavson
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise31(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}


vec3 orthogonal(vec3 v) {
  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y));
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


  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vWorldPos;
  varying vec3 v_normal;
  varying vec3 v_eye;
  uniform float uTime;
  uniform float uFrequency;
  uniform float uAmplitude;
  uniform vec2 uResolution;


  vec3 displace(vec3 v) {
    vec3 result = v;
    float n = cnoise31(result * 1.0 + uTime * 0.3);
    result += normal * n * 0.05;
    return result;
  }


  void main() {

    vec3 pos = displace(position);
    vec3 correctedNormal = recalcNormal(pos);

    //float displacement = vec4(pos * uFrequency, uTime) * uAmplitude;

    //pos += displacement * position;

    v_normal = normalize(normalMatrix * correctedNormal);
    v_eye = normalize(modelViewMatrix * vec4( pos, 1.0 )).xyz;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );

    vec4 worldPos = modelMatrix * vec4( pos, 1.0 );

    // worldPos.y += sin(worldPos.x * uFrequency.x + uTime) * uAmplitude.x;
    // worldPos.x += cos(worldPos.y * uFrequency.y + uTime) * uAmplitude.y;

    vec4 mvPosition = viewMatrix * worldPos;

    //gl_Position = projectionMatrix * mvPosition;
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


