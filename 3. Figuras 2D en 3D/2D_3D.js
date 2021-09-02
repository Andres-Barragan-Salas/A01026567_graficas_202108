import * as shaderUtils from './shaderUtils.js'
const mat4 = glMatrix.mat4;

let projectionMatrix, modelViewMatrix;

let shaderVertexPositionAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

const vertexShaderSource = `#version 300 es

        in vec3 vertexPos; // Vertex from the buffer
        uniform mat4 modelViewMatrix; // Object's position
        uniform mat4 projectionMatrix; // Camera's position

        void main(void) {
    		// Return the transformed and projected vertex value
            gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);
        }`;

const fragmentShaderSource = `#version 300 es

        precision mediump float;
        out vec4 fragColor;

        void main(void) {
        // Return the pixel color: always output white
        fragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }`;

function main() 
{
    let canvas = document.getElementById("webglcanvas");
    
    let gl = initWebGL(canvas);
    initGL(gl, canvas);
    initViewport(gl, canvas);

    const shaderProgram = shaderUtils.initShader(gl, vertexShaderSource, fragmentShaderSource);

    let square = createSquare(gl);
    let triangle = createTriangle(gl);
    let diamond = createDiamond(gl);
    let pacman = createPacman(gl);

    mat4.identity(modelViewMatrix);
    
    mat4.translate(modelViewMatrix, modelViewMatrix, [-1.0, 0.7, -3.333]);

    bindShaderAttributes(gl, shaderProgram);
    draw(gl, shaderProgram, square);
    
    mat4.identity(modelViewMatrix);
    
    mat4.translate(modelViewMatrix, modelViewMatrix, [1, 0.7, -3.333]);

    bindShaderAttributes(gl, shaderProgram);
    draw(gl, shaderProgram, triangle);

    mat4.identity(modelViewMatrix);
    
    mat4.translate(modelViewMatrix, modelViewMatrix, [-1.0, -0.7, -3.333]);

    bindShaderAttributes(gl, shaderProgram);
    draw(gl, shaderProgram, diamond);
    
    mat4.identity(modelViewMatrix);
    
    mat4.translate(modelViewMatrix, modelViewMatrix, [1, -0.7, -3.333]);

    bindShaderAttributes(gl, shaderProgram);
    draw(gl, shaderProgram, pacman);
}

function initWebGL(canvas) 
{
    let gl = null;
    let msg = "Your browser does not support WebGL, or it is not enabled by default.";

    try 
    {
        gl = canvas.getContext("webgl2");
    } 
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        throw new Error(msg);
    }

    return gl;        
}

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(gl, canvas)
{
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    modelViewMatrix = mat4.create();
    mat4.identity(modelViewMatrix);
    
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 10000);
}

function bindShaderAttributes(gl, shaderProgram)
{
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);
    
    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");
}

function draw(gl, shaderProgram, obj) 
{
    gl.useProgram(shaderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);

    gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
    gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, modelViewMatrix);
    
    gl.drawArrays(obj.primtype, 0, obj.nVerts);
}

function createSquare(gl) 
{
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Se utilizan 4 vertices para el cuadrado
    let verts = [
        .5,  .5,  0.0,
        -.5, .5,  0.0,
        .5,  -.5,  0.0,
        -.5, -.5,  0.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Se utiliza la primitiva TRIANGLE_STRIP para dibujar dos triangulos a partir de los cuatro vertices (formando un cuadrilatero)
    let square = {buffer:vertexBuffer, vertSize:3, nVerts:4, primtype:gl.TRIANGLE_STRIP};

    return square;
}

function createTriangle(gl)
{
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Se utilizan 3 vertices para el triangulo
    let verts = [
        0.0, 0.5, 0.0,
        .5, -.5,  0.0,
        -.5, -.5,  0.0
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    
    // Se utiliza la primitiva TRIANGLES para cerrar los vertices y rellenarlos
    let triangle = {buffer:vertexBuffer, vertSize:3, nVerts:3, primtype:gl.TRIANGLES};
    return triangle;
}  

function createDiamond(gl)
{
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Se utilizan 4 vertices para el rombo
    let verts = [
        0.0,  .5,  0.0,
        -.5, 0.0,  0.0,
        .5,  0.0,  0.0,
        0.0, -.5,  0.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Se utiliza la primitiva TRIANGLE_STRIP para dibujar dos triangulos a partir de los cuatro vertices (formando un cuadrilatero)
    let diamond = {buffer:vertexBuffer, vertSize:3, nVerts:4, primtype:gl.TRIANGLE_STRIP};

    return diamond;
}

function createPacman(gl)
{
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Se inicializan los vertices superiores e inferiores con un inicio en el centro del circulo
    let upperVerts = [0, 0, 0];
    let lowerVerts = [0, 0, 0];
    // Arreglo que guardará los vertices superiores y los inferiores
    let verts = [];
    // Tamaño del radio del circulo (sobre 100: ej. 50/100)
    let r = 50;

    // Se itera sobre todo la distancia que cubre el circulo en el eje x
    for (let x = -r; x <= r; x++) {
        // Se obtienen los puntos en el eje y con el teorema de pitagoras
        let y = Math.sqrt(Math.pow(r, 2) - Math.pow(x, 2));
        if (!(x > 0 && y < r/2)) upperVerts.push(x/100, y/100, 0.0);
        if (!(x > 0 && y < r/2)) lowerVerts.push(x/100, -y/100, 0.0);
    }

    // Se unen ambos arreglos de vertices
    verts.push(...upperVerts, ...lowerVerts);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Se utiliza la primitva TRIANGLE_FAN para divijar los tiriangulos resultantes de todos los vertices
    let pacman = {buffer:vertexBuffer, vertSize:3, nVerts:verts.length/3, primtype:gl.TRIANGLE_FAN};

    return pacman;
}

main();