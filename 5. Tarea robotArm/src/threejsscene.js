import * as THREE from "../libs/three.js/r131/three.module.js"

let renderer = null, scene = null, camera = null, shoulderGroup = null, elbowGroup = null, forearmGroup = null, wristGroup = null, handGroup = null, shoulder = null, arm = null, elbow = null, forearm = null, wrist = null, hand = null;

function main() 
{
    const canvas = document.getElementById("webglcanvas");
    createScene(canvas);
    update();
}

function update()
{
    requestAnimationFrame(function() { update(); });
    
    // Render the scene
    renderer.render( scene, camera );
}

function createScene(canvas)
{
    // Agregar un renderer de Three.js a nuestro canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Establecer el tamaño dle viewport
    renderer.setSize(canvas.width, canvas.height);
    
    // Crear una nueva escena de Three.js
    scene = new THREE.Scene();

    // Establecer el color del background
    scene.background = new THREE.Color( 0.2, 0.2, 0.2 );

    // Agregar una camara a la escena
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.z = 10;
    scene.add(camera);
    
    // Agregar una directional light para poder visualizar los objetos y posicionarla
    const light = new THREE.DirectionalLight( 0xffffff, 1.0);
    light.position.set(-.5, .2, 1);
    light.target.position.set(0,-2,0);
    scene.add(light);
    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    const ambientLight = new THREE.AmbientLight(0xffccaa, 0.2);
    scene.add(ambientLight);

    // Generar un material para las figuras de la escena
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff });

    // Crear una gemoetría para el brazo y antebrazo
    let limbGeometry = new THREE.BoxGeometry(0.75, 2, 0.75);

    // Crear una geometría para las articulaciones
    let jointGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

    // Crear una geometría para la mano
    let handGeometry = new THREE.BoxGeometry(0.75, 1, 0.5);

    // Crear los grupos que daran rotación al brazo
    shoulderGroup = new THREE.Object3D;
    elbowGroup = new THREE.Object3D;
    forearmGroup = new THREE.Object3D;
    wristGroup = new THREE.Object3D;
    handGroup = new THREE.Object3D;

    // Juntar las geometrías con el material a utilizar
    shoulder = new THREE.Mesh(jointGeometry, material);
    arm = new THREE.Mesh(limbGeometry, material);
    elbow = new THREE.Mesh(jointGeometry, material);
    forearm = new THREE.Mesh(limbGeometry, material);
    wrist = new THREE.Mesh(jointGeometry, material);
    hand = new THREE.Mesh(handGeometry, material);

    // Agregar los geometrías a los grupos pertinentes
    handGroup.add( hand );
    wristGroup.add( wrist, handGroup );
    forearmGroup.add( forearm, wristGroup );
    elbowGroup.add( elbow, forearmGroup );
    shoulderGroup.add( shoulder, arm, elbowGroup );

    // Ajustar la posiciones de las figuras
    shoulderGroup.position.set(0, 0, -8);
    arm.position.set(0, -1.25, 0);
    elbowGroup.position.set(0, -2.5, 0);
    forearmGroup.position.set(0, -1.25, 0);
    wristGroup.position.set(0, -1.25, 0);
    hand.position.set(0, -0.75, 0);
    
    // Agregar el grupo principal a la escena
    scene.add( shoulderGroup );

    // Agregar controles de dat.gui para manejar el brazo
    const gui = new dat.GUI();
    const armFolder = gui.addFolder('Robotic Arm');
    armFolder.add(shoulderGroup.rotation, 'x', 0, Math.PI * 2).name('shoulder X');
    armFolder.add(shoulderGroup.rotation, 'z', 0, Math.PI * 2).name('shoulder Z');
    armFolder.add(elbowGroup.rotation, 'x', 0, Math.PI * 2).max(2).name('elbow X');
    armFolder.add(forearmGroup.rotation, 'y', 0, Math.PI * 2).min(-1).max(Math.PI).name('forearm Y');
    armFolder.add(wristGroup.rotation, 'x', 0, Math.PI * 2).max(1).name('wrist X');
    armFolder.add(handGroup.rotation, 'x', 0, Math.PI * 2).max(1).name('hand X');
    armFolder.add(handGroup.rotation, 'z', 0, Math.PI * 2).min(-0.5).max(0.5).name('hand Z');
    armFolder.open();
}

main();