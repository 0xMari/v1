import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';



import { addPass, useCamera, useGui, useRenderSize, useRenderer, useScene, useTick } from './init.js'


const startApp = () => {

    const scene = useScene();
    const container = document.getElementById('test');
    const camera = useCamera();
    const renderer = useRenderer();
    const controls = new OrbitControls(camera, renderer.domElement);
    // controls.enabled = true;
    controls.enabled = false;

    const { width, height } = useRenderSize()

    const testGeo = new THREE.PlaneGeometry(25,15);
    const testMat = new THREE.MeshPhysicalMaterial( {
        color: 0xB091F2,
        side: THREE.DoubleSide,
        roughness: 0,
        ior: 2.33,
        envMap: setupTexturePlane()
    } );
    const testPlane = new THREE.Mesh( testGeo, testMat );
    testPlane.position.z = -2;
    testPlane.position.y = 0;


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
                
        const hdr = new RGBELoader().load( '../imgs/sepulchral_chapel_rotunda_2k.hdr' , function(){
            hdr.mapping = THREE.EquirectangularReflectionMapping;
        });

        return hdr;
    };

    function setupTexturePlane(){
        const textureLoader = new THREE.TextureLoader();
        let textureEquirec;
        textureEquirec = textureLoader.load( '../imgs/holo2.jpg' );
        textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
        textureEquirec.colorSpace = THREE.SRGBColorSpace;

        return textureEquirec;
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

    const group = new THREE.Group();

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( './js/draco/' );
    loader.setDRACOLoader( dracoLoader );

    loader.load("../public/src/output.glb", (gltf) => {
        const demon = gltf.scene;
        
        demon.scale.x = demon.scale.y = demon.scale.z = 3;
        demon.position.y= - 3;
        demon.rotation.y = 3 * Math.PI / 4  ;
        demon.position.x = 0;
        demon.position.z = 0;

        demon.traverse( ( child ) => {
            if ( child instanceof THREE.Mesh ) {
                child.material = material
                //console.log(child.material)
                child.castShadow = true;
                child.receiveShadow = true
            }
        })
        group.add(demon); },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        }     
    );

    function animate() {
        requestAnimationFrame(() => animate());
        
        scrollRotObj();   
    };

    let currentTimeline = window.scrollY / 300; 
    let aimTimeline = window.scrollY / 300;

    function scrollRotObj (){
        
        currentTimeline += (aimTimeline - currentTimeline) * 0.01;

        const ry = (currentTimeline)* Math.PI;
        const pos = currentTimeline * 2;

        group.rotation.set(0, -ry, 0);
        group.position.set(-0.5, pos, 0);

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
        
    })


    function init(){
        setupLights();
        scene.add(testPlane);
        scene.add(group);
        
        animate();
        window.addEventListener('scroll', function(){
            aimTimeline = window.scrollY / 3000;
        })
        
    }

    init();


    container.appendChild(renderer.domElement);

}

export default startApp;