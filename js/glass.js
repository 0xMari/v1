import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';



import vertexPars from '../public/src/Shader_noiseSphere/vertex_pars.glsl.js'
import vertexMain from '../public/src/Shader_noiseSphere/vertex_main.glsl.js'
import fragmentPars from '../public/src/Shader_noiseSphere/fragment_pars.glsl.js'
import fragmentMain from '../public/src/Shader_noiseSphere/fragment_main.glsl.js'


import { Water } from './old/Water.js';

import { addPass, useCamera, useGui, useRenderSize, useRenderer, useScene, useTick } from './init.js'


const startApp = () => {

const scene = useScene();
const container = document.getElementById('scene');
//const camera = new THREE.PerspectiveCamera(50, (container.offsetWidth / container.offsetHeight), 0.1, 15);
const camera = useCamera();
const renderer = useRenderer();

const { width, height } = useRenderSize()

const sphereGeometry = new THREE.IcosahedronGeometry(0.5, 200);
const sphere = createSphere();



const waterGeometry = new THREE.PlaneGeometry(25, 20, 50, 50);
const water = createWater();

const testGeo = new THREE.PlaneGeometry(25,15);
const testMat = new THREE.MeshPhysicalMaterial( {
    color: 0xB091F2,
    side: THREE.DoubleSide,
    roughness: 0,
    ior: 2.33,
    envMap: setupTexture()
} );
const testPlane = new THREE.Mesh( testGeo, testMat );
testPlane.position.z = -10;
testPlane.position.y = 0;


const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = true;


function setupLights(){
    // Add light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xFFDBFF, 0.5);
    scene.add(directionalLight);
};



function handleResize(){
    camera.aspect = container.innerWidth / container.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.innerWidth, container.innerHeight);
};


function animate() {
    requestAnimationFrame(() => animate());
    // Update water material
    water.material.uniforms['time'].value += 1.0/(60.0*10.0);
    //sphere rotation
    const time = Date.now() * 0.0007;
    sphere.rotation.y = time;
    sphere.rotation.z = 0.5* ( 1 +  Math.sin( time ) );


    
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

    return textureEquirec;
};



function createSphere(){
    
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
        envMap: setupTexture() ,
        
    } );

    const sphere = new THREE.Mesh(sphereGeometry, material);

    
    sphere.position.y = 0.3;
    return sphere;

};

function createWater(){
    const water = new Water(waterGeometry, {
        waterColor: 0x0040ff,
        sunColor: 0xffffff,
        scale: 1,
        flowDirection: new THREE.Vector2(0, -10),
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load( './imgs/water_0342normal.jpg', function(texture){
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        } ),
        distortionScale: 20,
        alpha: 0.15,
        envMap: setupTexture(),
        
    });
    water.rotation.x = -Math.PI / 2;
    water.position.y = -1;

    return water;
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
    sphere.material.userData.shader.uniforms.uTime.value = time
  })


function init(){
    setupLights();

    scene.add(testPlane);
    scene.add(sphere);
    scene.add(water);

    animate();
}

init();


container.appendChild(renderer.domElement);

}

export default startApp;