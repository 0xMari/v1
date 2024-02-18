import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';



import vertexPars from '../public/src/Shader/vertex_pars.glsl.js'
import vertexMain from '../public/src/Shader/vertex_main.glsl.js'
import fragmentPars from '../public/src/Shader/fragment_pars.glsl.js'
import fragmentMain from '../public/src/Shader/fragment_main.glsl.js'


import { Water } from './old/Water.js';

import { addPass, useCamera, useGui, useRenderSize, useRenderer, useScene, useTick } from './init.js'


const startApp = () => {

const scene = useScene();
const container = document.getElementById('test');
//const camera = new THREE.PerspectiveCamera(50, (container.offsetWidth / container.offsetHeight), 0.1, 15);
const camera = useCamera();
const renderer = useRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
// controls.enabled = true;
controls.enabled = false;

const { width, height } = useRenderSize()


function setupLights(){
    // Add light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    console.log(directionalLight.position);
    scene.add(directionalLight);
    const directionalLight2 = new THREE.DirectionalLight(0x63D8F2, 1);
    directionalLight2.position.set(1.0, 2.0, 0.5);

    console.log(directionalLight2.position);
    scene.add(directionalLight2);
};






function setupTexture(){
    const textureLoader = new THREE.TextureLoader();
    let textureEquirec;
    textureEquirec = textureLoader.load( '../imgs/holo2.jpg' );
    textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
    textureEquirec.colorSpace = THREE.SRGBColorSpace;
    
    
    const hdr = new RGBELoader().load( '../imgs/sepulchral_chapel_rotunda_2k.hdr' , function(){
        hdr.mapping = THREE.EquirectangularReflectionMapping;
    });

    return hdr;
};

const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    emissive: 0xCFB6F2,
    emissiveIntensity: 0.8,
    roughness: 0,
    metalness: 0,
    ior: 2.33,
    iridescence: 1,
    iridescenceIOR: 1.8,
    clearcoat: 1,
    clearcoatRoughness: 0,
    envMap: setupTexture(),
    envMapIntensity: 0.4,
});

const loader = new GLTFLoader();
loader.load("../public/src/demon.gltf", (gltf) => {
    const demon = gltf.scene;
    
    demon.scale.x = demon.scale.y = demon.scale.z = 3;
    demon.position.y= - 3;
    demon.rotation.y = Math.PI / 2 ;

    demon.traverse( ( child ) => {
        if ( child instanceof THREE.Mesh ) {
            child.material = material
            //console.log(child.material)
            child.castShadow = true;
            child.receiveShadow = true
        }
    })
    
    
    
    scene.add(demon);
    
});

function animate() {
    requestAnimationFrame(() => animate());
    //sphere rotation
    // const time = Date.now() * 0.0007;
    // sphere.rotation.y = time;
    // sphere.rotation.z = 0.5* ( 1 +  Math.sin( time ) ); 
    scrollRotObj();   
};

let currentTimeline = window.scrollY / 3000; 
let aimTimeline = window.scrollY / 3000;

function scrollRotObj (){
    // if(scene){ 
    //     addEventListener('wheel', e => {
    //         const delta = e.deltaY;
    //         //console.log(delta);
    //         scene.rotation.y = (- delta / 100) * 2 * Math.PI ;
    //         console.log(scene.rotation.y);
            
    //     })
    // }
    currentTimeline += (aimTimeline - currentTimeline) * 0.01;

    const ry = (currentTimeline)* Math.PI * 2;
    const pos = currentTimeline * 2;

    scene.rotation.set(0, -ry, 0);
    scene.position.set(0, pos, 0);

};


const renderTargetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    stencilBuffer: false,
}

// postprocessing
//addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.7, 0.4, 0.4))

useTick(({ timestamp, timeDiff }) => {
    const time = timestamp / 5000
    // sphere.material.userData.shader.uniforms.uTime.value = time
  })


function init(){
    setupLights();
    // scene.add(testPlane);
    // scene.add(sphere);


    animate();
    window.addEventListener('scroll', function(){
        aimTimeline = window.scrollY / 3000;
    })
}

init();


container.appendChild(renderer.domElement);

}

export default startApp;