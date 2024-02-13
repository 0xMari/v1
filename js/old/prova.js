import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';


import vertShader from '../../public/src/Shader/vertex.js';
import fragShader from '../../public/src/Shader/fragment.js';

import vertexPars from '../../public/src/Shader/vertex_pars.glsl.js'
import vertexMain from '../../public/src/Shader/vertex_main.glsl.js'
import fragmentPars from '../../public/src/Shader/fragment_pars.glsl.js'
import fragmentMain from '../../public/src/Shader/fragment_main.glsl.js'

import Time from './Time.js'
import Microphone from './Mic.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';


// set up
const scene = new THREE.Scene();
scene.background = null;

const container = document.getElementById('prova');


const camera = new THREE.PerspectiveCamera(50, (container.offsetWidth / container.offsetHeight), 0.1, 15);
camera.position.z = 7;
camera.lookAt(0,0,0);

const axesHelper = new THREE.AxesHelper( 5 );
//axesHelper.setColors(THREE.Color('#ff0000'), THREE.Color('#00ff00'), THREE.Color('#0000ff'));
scene.add( axesHelper );


const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(container.clientWidth, container.clientHeight);


const controls = new OrbitControls(camera, renderer.domElement);

// const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5);
// ambientLight.position.set(0,2,0);
// scene.add( ambientLight );

// const directionalLight = new THREE.DirectionalLight( 0xffffff, 1);
// directionalLight.position.set(1,0,5);
// scene.add(directionalLight);

const time = new Time();
let offset;

// const mic = new Microphone();

// const variations = {};
// variations.volume = {};
// variations.volume.target = 0;
// variations.volume.current = 0;
// variations.volume.inEase = 0.1;
// variations.volume.outEase = 0.01;

//geometries
const geometry = new THREE.SphereGeometry(1 , 256, 256);

geometry.computeTangents();


const ico = new THREE.IcosahedronGeometry(1, 200);

const params = {
    color: 0xffffff,
    transmission: 1,
    opacity: 1,
    metalness: 0,
    roughness: 0,
    ior: 1.52,
    thickness: 0.1,
    specularIntensity: 1,
    specularColor: 0xffffff,
    lightIntensity: 1,
    exposure: 1
};

const textureLoader = new THREE.TextureLoader();
let textureEquirec;
textureEquirec = textureLoader.load( '../imgs/holo.jpg' );
textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
textureEquirec.colorSpace = THREE.SRGBColorSpace;


const hdr = new RGBELoader().load( '../imgs/sepulchral_chapel_rotunda_2k.hdr' , function(){
    hdr.mapping = THREE.EquirectangularReflectionMapping;
});


const material = new THREE.MeshPhysicalMaterial( {
    onBeforeCompile: (shader) => {
        material.userData.shader = shader;
        shader.uniforms.uTime = {value : 0};


        const parsVertexString = /* glsl */ `#include <displacementmap_pars_vertex>` ;
        shader.vertexShader = shader.vertexShader.replace(
            parsVertexString,
            parsVertexString + vertexPars
        );

        const mainVertexString = /* glsl */ `#include <displacementmap_vertex>`;
        shader.vertexShader = shader.vertexShader.replace(
            mainVertexString,
            mainVertexString + vertexMain
        );

        const mainFragmentString = /* glsl */ `#include <normal_fragment_maps>`;
        const parsFragmentString = /* glsl */ `#include <bumpmap_pars_fragment>`;
        shader.fragmentShader = shader.fragmentShader.replace(
            parsFragmentString,
            parsFragmentString + fragmentPars
        );
        shader.fragmentShader = shader.fragmentShader.replace(
            mainFragmentString,
            mainFragmentString + fragmentMain
        );
    },
    color: params.color,
    metalness: params.metalness,
    roughness: params.roughness,
    ior: params.ior,
    transmission: params.transmission,
    specularIntensity: params.specularIntensity,
    specularColor: params.specularColor,
    opacity: params.opacity,
    side: THREE.DoubleSide,
    envMap: hdr,
} );



scene.background = hdr;

// scene.background = new THREE.Color(0x000000);

const sf = new THREE.Mesh(ico, material);

scene.add(sf);


offset = {};
offset.spherical = new THREE.Spherical( 1, Math.random() * Math.PI , Math.random() * Math.PI * 2 );
offset.direction = new THREE.Vector3();
offset.direction.setFromSpherical(offset.spherical);


const mat = new THREE.ShaderMaterial({
    uniforms: 
    {
        uTime : {value : 0 },
        uDistortionFrequency : {value : 1.5 },
        uDistortionStrenght : {value : 0.6 },
        uDisplacementFrequency : {value : 2 },
        uDisplacementStrenght : {value : 0.033 },
        uLightAColor: {value : new THREE.Color('#f8a3f8') },
        uLightAPosition: {value : new THREE.Vector3(1, 1, 0)},
        uLightAIntensity : {value : 1 },
        uLightBColor : {value : new THREE.Color('#60aad6')},
        uLightBPosition: {value : new THREE.Vector3(-1, -1, 0)},
        uLightBIntensity : {value : 1},
        uSubdivision : { value : new THREE.Vector2(geometry.parameters.widthSegments , geometry.parameters.heightSegments)},
        uFresnelOffset: {value : 0 },
        uFresnelMultiplier: {value : 1.2},
        uFresnelPower: {value : 3.5 },
        uOffset: {value : new THREE.Vector3() },

        
    },
    defines : 
    {
        USE_TANGENT: '',
    },
    vertexShader: vertShader ,
    fragmentShader: fragShader
});




const mesh = new THREE.Mesh(geometry, mat);
mesh.position.set(0,0,0);

//scene.add(mesh);

// post-process


const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
// resolution, strength, radius, threshold
const bloom = new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 0.3 , 0.2 , 0);
bloom.enabled = true;

bloom.tintColor = {};
bloom.tintColor.value = '#4100ff';
bloom.tintColor.instance = new THREE.Color(bloom.tintColor.value);

bloom.compositeMaterial.uniforms.uTintColor = {value : bloom.tintColor.instance};
bloom.compositeMaterial.uniforms.uTintStrenght = {value : 0.0};

bloom.compositeMaterial.fragmentShader = `
varying vec2 vUv;
uniform sampler2D blurTexture1;
uniform sampler2D blurTexture2;
uniform sampler2D blurTexture3;
uniform sampler2D blurTexture4;
uniform sampler2D blurTexture5;
uniform float bloomStrength;
uniform float bloomRadius;
uniform float bloomFactors[NUM_MIPS];
uniform vec3 bloomTintColors[NUM_MIPS];
uniform vec3 uTintColor; //vec3(1.0, 0.2, 0.8)
uniform float uTintStrenght; //0.2

float lerpBloomFactor(const in float factor) {
    float mirrorFactor = 1.2 - factor;
    return mix(factor, mirrorFactor, bloomRadius);
}

void main() {
    vec4 color = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
        lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
        lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
        lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
        lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );

    color.rgb = mix(color.rgb, uTintColor , uTintStrenght ); //tint all over the scene
    gl_FragColor = vec4(color.rgb, 0.0);
}`


//composer.addPass(bloom);

const outputPass = new OutputPass();

composer.addPass(outputPass);

function update(){

    // audio variation on distortion strenght
    // variations.volume.target = mic.volume;
    
    // const easing = variations.volume.target > variations.volume.current ? variations.volume.inEase : variations.volume.outEase;
    // variations.volume.current += (variations.volume.target - variations.volume.current) * easing;

    // mat.uniforms.uDisplacementStrenght.value = Math.max(0.03, variations.volume.current); 



    // const offsetTime = time.elapsed * 0.3;
    // offset.spherical.phi = (( (Math.sin(offsetTime * 0.001)) * (Math.sin(offsetTime * 0.00321)) )* 0.5 + 0.5 ) * Math.PI;
    // offset.spherical.theta = (( (Math.sin(offsetTime * 0.0001)) * (Math.sin(offsetTime * 0.000321)) )* 0.5 + 0.5 ) * Math.PI * 2;
    // offset.direction.setFromSpherical(offset.spherical);
    // offset.direction.multiplyScalar(0.01);

    // mat.uniforms.uOffset.value.add(offset.direction);
    // mat.uniforms.uTime.value += time.delta * 0.0002;
    
    //mate.userData.shader.uniforms.uTime.value += time.delta * 0.0002;

}

// animation

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Call the update function
    //mic.update();

    //update();
    
    
    renderer.render(scene, camera);
    //composer.render();    
}

animate();


container.appendChild(renderer.domElement);