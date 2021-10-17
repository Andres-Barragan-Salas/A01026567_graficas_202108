/* Tarea: Sistema Solar
 * Andrés Barragán Salas - A01026567
 */

import { OrbitControls } from '../libs/three.js/r125/controls/OrbitControls.js';
import * as THREE from '../libs/three.js/r125/three.module.js';
import { OBJLoader } from '../libs/three.js/r125/loaders/OBJLoader.js';
import { MTLLoader } from '../libs/three.js/r125/loaders/MTLLoader.js';

const canvas = document.getElementById("webglcanvas");
const planets = [];
let camera, scene, renderer, controls, sun, asteroidGroup;
let timestamp = 0;

function main() {
    createScene();
    update();
}

function getTexturePath(planetName, type) {
    // Obtener path de una textura
    return `../textures/${planetName}${type}.jpeg`;
}

function getRandomPosition(min, max) {
    // Generar una posicion aleatoria para una luna utilizando un rango máximo y minimo
    let axis = new Array(3).fill(0);
    return axis.map(() => {
        const multiplier = Math.random() < 0.5 ? 1 : -1;
        return (Math.random() * (max - min) + min) * multiplier;
    });
}

function update()
{
    timestamp = Date.now() * 0.0001;
    requestAnimationFrame(update);

    // Movimiento de los planetas
    planets.forEach((planet) => {
        const orbit = planet.userData.orbit;
        const speed = planet.userData.speed;
        const sphere = planet.userData.sphere;
        const planetMoons = planet.userData.planetMoons;
        // Cambiar la posicion alrededor de la orbita
        planet.position.x = Math.cos(timestamp * speed) * orbit;
        planet.position.z = Math.sin(timestamp * speed) * orbit;
        // Rotar planeta al rededor de su eje
        sphere.rotation.y = timestamp * speed / 2;
        // Rotación de las lunas
        planetMoons.rotation.z = timestamp * speed * 2;
        planetMoons.rotation.y = timestamp * speed * 3;
        planetMoons.children.forEach((moon) => {
            moon.rotation.y = timestamp * speed * 2;
        });
    });

    // Movimiento del anillo de asteroides
    asteroidGroup.rotation.y = timestamp / 3;
    asteroidGroup.children.forEach((asteroid) => {
        const speed = asteroid.userData.speed;
        let verticalSpeed = asteroid.userData.verticalSpeed;
        const asteroidYPos = asteroid.position.y;
        asteroid.rotation.z = timestamp * speed;
        asteroid.rotation.y = timestamp * speed;
        verticalSpeed = Math.abs(asteroidYPos) > 1 ? -verticalSpeed : verticalSpeed;
        asteroid.position.y = asteroidYPos + verticalSpeed;
        asteroid.userData.verticalSpeed = verticalSpeed;
    });

    // Movimiento del sol
    sun.rotation.y = -timestamp;

    renderer.render(scene, camera);
}

async function loadAsteroid()
{
    // Cargar el modelo de asteroide
    try {
        const asteroidModelUrl = { obj: '../models/asteroid/10464_Asteroid_v1_Iterations-2.obj', mtl: '../models/asteroid/10464_Asteroid_v1_Iterations-2.mtl' };
        const mtlLoader = new MTLLoader();
        const materials = await mtlLoader.loadAsync(asteroidModelUrl.mtl);
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        const object = await objLoader.loadAsync(asteroidModelUrl.obj);
        object.scale.set(0.0005, 0.0005, 0.0005);
        return object;
    } catch (err){
        console.error(err);
    }
}

function createAsteroid(asteroidGroup, model, lowerX, lowerY)
{
    // Clonar y posicionar modelo de asteroide
    const X = Math.random() * 3 + lowerX;
    const Y = Math.random() * 3 + lowerY;
    const Z = Math.random() * 2 - 1;
    const asteroid = model.clone();
    asteroid.position.set(X, Z, Y)
    asteroid.userData.speed = Math.random() * 20 - 10;
    asteroid.userData.verticalSpeed = Math.random() * 0.02 - 0.01;
    asteroidGroup.add(asteroid);
}

async function createAsteroidRing(innerOrbit, outerOrbit)
{
    // Generar un anillo de asteroides utilizando un rango de orbitas
    asteroidGroup = new THREE.Object3D;
    const asteroidModel = await loadAsteroid();
    for (let x = -outerOrbit; x < outerOrbit; x+=5) {
        for (let y = -outerOrbit; y < outerOrbit; y+=5) {
            const radius = Math.hypot(x, y);
            if (radius > innerOrbit && radius < outerOrbit) {
                createAsteroid(asteroidGroup, asteroidModel, x, y);
            }
        }
    }
    scene.add(asteroidGroup);
}

function createPlanetRing(planet) {
    // Generar el anillo de para saturno
    const texture = new THREE.TextureLoader().load('https://i.postimg.cc/zz7Gr430/saturn-rings-top.png');
    const geometry = new THREE.RingBufferGeometry(3, 5, 64);
    var pos = geometry.attributes.position;
    var v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++){
        v3.fromBufferAttribute(pos, i);
        geometry.attributes.uv.setXY(i, v3.length() < 4 ? 0 : 1, 1);
    }
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = 20;
    planet.add(mesh);
};

function createMoon(moonGroup, radius)
{
    // Generar luna
    const moonGeometry = new THREE.SphereGeometry(0.2, 32, 16);
    const map = new THREE.TextureLoader().load(getTexturePath('moon', 'Texture'));
    const material = new THREE.MeshPhongMaterial({ map });
    const moon = new THREE.Mesh(moonGeometry, material);
    const position = getRandomPosition(radius + 0.1, radius + 0.3);
    moon.position.set(...position);
    moonGroup.add(moon);
}

function createPlanet (radius, orbit, speed, moons, texture, bump, ring) 
{
    // Generar el planeta
    const planetGroup = new THREE.Object3D;
    const planetGeometry = new THREE.SphereGeometry(radius, 32, 16);
    const map = new THREE.TextureLoader().load(getTexturePath(texture, 'Texture'));
    const bumpMap = bump ? new THREE.TextureLoader().load(getTexturePath(texture, 'Bump')) : null;
    const material = new THREE.MeshPhongMaterial({ map, bumpMap, bumpScale: 0.7 });
    const planet = new THREE.Mesh(planetGeometry, material);

    // Generar las lunas
    const planetMoons = new THREE.Object3D;
    for (let i = 0; i < moons; ++i) {
        createMoon(planetMoons, radius);
    }

    // Generar anillo si es necesario
    if (ring) {
        createPlanetRing(planet);
    }

    // Agregar el conjunto del planeta a la escena
    planetGroup.userData.orbit = orbit;
    planetGroup.userData.speed = speed;
    planetGroup.userData.sphere = planet;
    planetGroup.userData.planetMoons = planetMoons;
    planetGroup.add(planet);
    planetGroup.add(planetMoons);
    planets.push(planetGroup);
    scene.add(planetGroup);

    // Generar la orbita
    const shape = new THREE.Shape();
    shape.moveTo(orbit, 0);
    shape.absarc(0, 0, orbit, 0, 2 * Math.PI, false);
    const spacedPoints = shape.getSpacedPoints(128);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(spacedPoints); 
    orbitGeometry.rotateX(THREE.Math.degToRad(90));
    const orbitLine = new THREE.Line(orbitGeometry, new THREE.LineBasicMaterial({ color: 0xFFFFFF }));
    scene.add(orbitLine);
};

function createSun()
{
    // Generar el sol
    const light = new THREE.PointLight( 0xffffff, 1.0);
    const map = new THREE.TextureLoader().load(getTexturePath('sun', 'Texture'));
    sun = new THREE.Mesh(new THREE.SphereGeometry(25, 32, 16), new THREE.MeshBasicMaterial({ map }));
    sun.add(light)
    scene.add(sun);
}

function createScene()
{
    // Configurar la escena de Three.js
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    renderer.setSize(canvas.width, canvas.height);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(110, 30, 150);
    controls = new OrbitControls(camera, renderer.domElement);

    // Añadir background a la excena
    const galaxy = new THREE.TextureLoader().load('../textures/starsBackground.jpeg');
    scene.background = galaxy;

    // Crear el sol
    createSun();
    
    // Crear los planetas interiores
    createPlanet(1, 40, 5, 0, 'mercury'); // Mercurio
    createPlanet(1.5, 50, 3, 0, 'venus'); // Venus
    createPlanet(2, 60, 4, 1, 'earth', true); // Tierra
    createPlanet(1.8, 70, 2, 2, 'mars'); // Marte

    // Crear el anillo de asteroides
    createAsteroidRing(85, 100);

    // Crear los planetas exteriores
    createPlanet(3, 115, 0.8, 8, 'jupiter'); // Jupiter
    createPlanet(2.5, 125, 0.5, 6, 'saturn', false, true); // Saturno
    createPlanet(1.75, 135, 0.4, 5, 'uranus'); // Urano
    createPlanet(0.8, 145, 0.2, 3, 'neptune'); // Neptuno
    createPlanet(0.6, 155, 0.1, 0, 'pluto'); // Pluton
}

main();