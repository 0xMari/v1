import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';



import vertexPars from '../public/src/Shader/vertex_pars.glsl.js'
import vertexMain from '../public/src/Shader/vertex_main.glsl.js'
import fragmentPars from '../public/src/Shader/fragment_pars.glsl.js'
import fragmentMain from '../public/src/Shader/fragment_main.glsl.js'


import { Water } from './old/Water.js';

import { addPass, useCamera, useGui, useRenderSize, useRenderer, useScene, useTick } from './init.js'


const startApp = () => {

//const scene = createScene();
const scene = useScene();
const container = document.getElementById('prova');
//const camera = new THREE.PerspectiveCamera(50, (container.offsetWidth / container.offsetHeight), 0.1, 15);
const camera = useCamera();
//const time = new Time();
//const renderer = new THREE.WebGLRenderer({ alpha: true });
const renderer = useRenderer();
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enabled = true;

//const gui = useGui()
const { width, height } = useRenderSize()

const sphereGeometry = new THREE.IcosahedronGeometry(0.5, 200);
const sphere = createSphere();
//sphere.renderOrder = 10;


const waterGeometry = new THREE.PlaneGeometry(60, 60, 20, 20);
const water = createWater();

const testGeo = new THREE.PlaneGeometry(25,10);
const testMat = new THREE.MeshBasicMaterial( {color: 0xFFDBff, side: THREE.DoubleSide} );
const testPlane = new THREE.Mesh( testGeo, testMat );
testPlane.position.z = -10;
testPlane.position.y = 0;







function setupLights(){
    // Add light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
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


    // Render the scene
    //renderer.render(scene, camera);
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

// Water

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
        
    });
    water.rotation.x = -Math.PI / 2;
    //water.rotation.x = - ((80 * Math.PI)/180);
    water.position.y = -1;
    // scene.add(water);

    return water;
};

function createScene(){
    const scene = new THREE.Scene();
    scene.background= new THREE.Color(0xFFDBFF);
    //scene.background= new THREE.Color(0x000000);

    // scene.background = setupTexture();
    //scene.background = null;
    //scene.fog = new THREE.Fog( 0x74ccf4, 7, 25 );

    return scene;
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
    // setupRenderer();
    // setupCamera();
    setupLights();
    // setupControls();
    // setupEventListeners();
    scene.add(testPlane);
    scene.add(sphere);
    scene.add(water);

    animate();
}

init();


container.appendChild(renderer.domElement);

}

export default startApp;