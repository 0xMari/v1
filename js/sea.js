import * as THREE from 'three';
import { Water } from './Water.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


export default class Sea{
    constructor(options){
        this.scene = this.createScene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.001, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.waterGeometry = new THREE.PlaneGeometry(60, 60, 20, 20);
        this.water = this.createWater();

        this.container = options.dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setSize(this.width, this.height);
        // this.renderer.setClearColor(0x000000, 1);
        // this.renderer.physicallyCorrectLights = true;
        // this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        this.container.appendChild(this.renderer.domElement);


        this.init()
    }

    init(){
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.setupControls();
        this.setupEventListeners();

        this.scene.add(this.water);

        this.animate();
    }


    // Set up scene
    
    
    
    setupRenderer(){
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }
    
    setupCamera(){
        this.camera.position.set(0, 1, 10);

    }

    setupLights(){
        // Add light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.scene.add(directionalLight);
    }

    setupControls(){
        // Add controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enabled = false;
    }



    setupEventListeners(){
        window.addEventListener('resize', () => this.handleResize());
        // document.addEventListener('click', (event) => this.handleMouseClick(event));
    }

    handleResize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // handleMouseClick(event){
    //     const mouse = new THREE.Vector2();
    //     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    //     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //     const raycaster = new THREE.Raycaster();
    //     raycaster.setFromCamera(mouse, this.camera);

    //     const intersects = raycaster.intersectObject(this.water);
    //     if (intersects.length > 0) {
    //         this.createRipples(intersects[0].point);
    //     }
    // }


    // Function to create ripples
    // createRipples = (position) => {
    //     // Modify the water surface vertices based on the click position
    //     console.log('aaaa');
    //     const vertices = this.waterGeometry ? this.waterGeometry.attributes.position.array : [];
    //     const radius = 1.5;

    //     for (let i = 0; i < vertices.length; i+=3) {
    //         // const distance = position.distanceTo(vertices[i]);
    //         const vertex = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
    //         const distance = position.distanceTo(vertex);

    //         if (distance < radius) {
    //             // Adjust the y-coordinate of the vertex based on the distance
    //             const influence = 1 - distance / radius;
    //             vertex.x += influence * 0.5;

    //             this.waterGeometry.attributes.position.setXYZ(i / 3, vertex.x, vertex.y, vertex.z);
    //         }
    //     }

    //     // Update the water geometry
    //     this.waterGeometry.attributes.position.needsUpdate = true;
    // }

    animate() {
        requestAnimationFrame(() => this.animate());
        // Update water material
        this.water.material.uniforms['time'].value += 1.0/(60.0*10.0);
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    };

    // Water
    
    createWater(){
        const water = new Water(this.waterGeometry, {
            waterColor: 0x66aaff,
            scale: 1,
            flowDirection: new THREE.Vector2(0, 0),
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load( './imgs/Water_1_M_Normal.jpg', function(texture){
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            } ),
            distortionScale: 20,
            alpha: 1
        });
        water.rotation.x = - Math.PI / 2;
        this.scene.add(water);

        return water;
    };

    createScene(){
        const scene = new THREE.Scene();
        scene.background= new THREE.Color(0xFFDBFF);
        scene.fog = new THREE.Fog( 0x74ccf4, 7, 25 );

        return scene;
    };   

}


new Sea({
    dom: document.getElementById("sea")
});