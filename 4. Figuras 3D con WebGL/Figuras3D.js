import * as shaderUtils from './shaderUtils.js'
const mat4 = glMatrix.mat4;

let projectionMatrix;

let shaderVertexPositionAttribute, shaderVertexColorAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

const duration = 10000; // ms

const vertexShaderSource = `#version 300 es

        in vec3 vertexPos; // Vertex from the buffer
        in vec4 vertexColor;

        out vec4 color;

        uniform mat4 modelViewMatrix; // Object's position
        uniform mat4 projectionMatrix; // Camera's position

        void main(void) {
    		// Return the transformed and projected vertex value
            gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);
            color = vertexColor * 0.8;
        }`;

const fragmentShaderSource = `#version 300 es

        precision mediump float;
        in vec4 color;
        out vec4 fragColor;

        void main(void) {
        fragColor = color;
    }`;

function main() 
{
    const canvas = document.getElementById("webglcanvas");
    const gl = initWebGL(canvas);
    initViewport(gl, canvas);
    initGL(canvas);
    
    let scutoid = createScutoid(gl, [-4, 0, -2], [1.0, 1.0, 0.2]);
    let dodecaedro = createDodecaedro(gl, [0 , 0, -2], [-0.4, 1.0, 0.1]);
    let octaedro = createOctaedro(gl, [4, 0, -2],  [0, 1, 0]);
    
    const shaderProgram = shaderUtils.initShader(gl, vertexShaderSource, fragmentShaderSource);
    bindShaderAttributes(gl, shaderProgram);

    update(gl, shaderProgram, [scutoid, dodecaedro, octaedro]);
}

function initWebGL(canvas)
{
    let gl = null;
    let msg = "Your browser does not support WebGL, or it is not enabled by default.";
    try {
        gl = canvas.getContext("webgl2");
    } 
    catch (e) {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl) {
        throw new Error(msg);
    }

    return gl;        
 }

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);
    // mat4.orthoNO(projectionMatrix, -4, 4, -3.5, 3.5, 1, 100)
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

// Create the vertex, color and index data for a multi-color octaedrum
function createOctaedro(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
       // Face 1
        0.0,  0.0,  1.0,
       -0.7, -0.7,  0.0,
       -0.7,  0.7,  0.0,

       // Face 2
        0.0,  0.0,  1.0,
        0.7, -0.7,  0.0,
       -0.7, -0.7,  0.0,

       // Face 3
        0.0,  0.0,  1.0,
        0.7,  0.7,  0.0,
        0.7, -0.7,  0.0,

       // Face 4
        0.0,  0.0,  1.0,
       -0.7,  0.7,  0.0,
        0.7,  0.7,  0.0,

       // Face 5
        0.0,  0.0, -1.0,
       -0.7, -0.7,  0.0,
       -0.7,  0.7,  0.0,

       // Face 6
        0.0,  0.0, -1.0,
        0.7, -0.7,  0.0,
       -0.7, -0.7,  0.0,

       // Face 7
        0.0,  0.0, -1.0,
        0.7,  0.7,  0.0,
        0.7, -0.7,  0.0,

       // Face 8
        0.0,  0.0, -1.0,
       -0.7,  0.7,  0.0,
        0.7,  0.7,  0.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Face 1
        [0.0, 1.0, 0.0, 1.0], // Face 2
        [0.0, 0.0, 1.0, 1.0], // Face 3
        [1.0, 1.0, 0.0, 1.0], // Face 4
        [1.0, 0.0, 1.0, 1.0], // Face 5
        [0.0, 1.0, 1.0, 1.0], // Face 6
        [1.0, 0.0, 0.0, 1.0], // Face 7
        [0.0, 1.0, 0.0, 1.0], // Face 8
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 3 times, one for each vertex of the octaedrums's face.
    let vertexColors = [];
    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let octaedroIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octaedroIndexBuffer);

    let octaedroIndices = [
        0, 1, 2,    // Face 1
        3, 4, 5,    // Face 2
        6, 7, 8,    // Face 3
        9, 10, 11,  // Face 4
        12, 13, 14, // Face 5
        15, 16, 17, // Face 6
        18, 19, 20, // Face 7
        21, 22, 23, // Face 8
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octaedroIndices), gl.STATIC_DRAW);
    
    let octaedro = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:octaedroIndexBuffer,
            vertSize:3, nVerts:verts.length, colorSize:4, nColors: vertexColors.length, nIndices:octaedroIndices.length,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(octaedro.modelViewMatrix, octaedro.modelViewMatrix, translation);

    // Constant to move the octaedrum up and down
    let yChange = 0.01;

    octaedro.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
        
        // Change the y position of the octaedrum
        const yPos = octaedro.modelViewMatrix[13];
        if (yChange > 0 && yPos > 2 || yChange < 0 && yPos < -2) {
            yChange *= -1;
        }
        mat4.translate(octaedro.modelViewMatrix, octaedro.modelViewMatrix, [0, yChange, 0]);
    };
    
    return octaedro;
}

// Create the vertex, color and index data for a multi-colored dodecaedrum
function createDodecaedro(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
       // Face 1
        0.85,  0.0,  1.0,
        0.32, 0.73,  1.0,
       -0.54, 0.45,  1.0,
       -0.54,-0.45,  1.0,
        0.32,-0.73,  1.0,
    
       // Face 2
        0.32,-0.73,  1.0,
        0.85,  0.0,  1.0,
        1.32,  0.0, 0.24,
        1.08,-0.73,-0.23,
        0.46,-1.18, 0.24,

        // Face 3
        0.85,  0.0,  1.0,
        0.32, 0.73,  1.0,
        0.46, 1.18, 0.24,
        1.08, 0.73,-0.23,
        1.32,  0.0, 0.24,

        // Face 4
        0.32, 0.73,  1.0,
       -0.54, 0.45,  1.0,
       -0.92, 0.73, 0.24,
        -0.3, 1.18,-0.23,
        0.46, 1.18, 0.24,

        // Face 5
       -0.54, 0.45,  1.0,
       -0.54,-0.45,  1.0,
       -0.92,-0.73, 0.24,
       -1.16,  0.0,-0.23,
       -0.92, 0.73, 0.24,

        // Face 6
       -0.54,-0.45,  1.0,
        0.32,-0.73,  1.0,
        0.46,-1.18, 0.24,
        -0.3,-1.18,-0.23,
       -0.92,-0.73, 0.24,

       // Face 7
        1.08,-0.73,-0.23,
        1.32,  0.0, 0.24,
        1.08, 0.73,-0.23,
         0.7, 0.45, -1.0,
         0.7,-0.45, -1.0,

       // Face 8
        1.08, 0.73,-0.23,
        0.46, 1.18, 0.24,
        -0.3, 1.18,-0.23,
       -0.16, 0.73, -1.0,
         0.7, 0.45, -1.0,

       // Face 9
        -0.3, 1.18,-0.23,
       -0.92, 0.73, 0.24,
       -1.16,  0.0,-0.23,
       -0.69,  0.0, -1.0,
       -0.16, 0.73, -1.0,

       // Face 10
       -1.16,  0.0,-0.23,
       -0.92,-0.73, 0.24,
        -0.3,-1.18,-0.23,
       -0.16,-0.73, -1.0,
       -0.69,  0.0, -1.0,

       // Face 11
        -0.3,-1.18,-0.23,
        0.46,-1.18, 0.24,
        1.08,-0.73,-0.23,
         0.7,-0.45, -1.0,
       -0.16,-0.73, -1.0,

       // Face 12
         0.7,-0.45, -1.0,
         0.7, 0.45, -1.0,
       -0.16, 0.73, -1.0,
       -0.68,  0.0, -1.0,
       -0.16,-0.73, -1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Face 1
        [0.0, 1.0, 0.0, 1.0], // Face 2
        [0.0, 0.0, 1.0, 1.0], // Face 3
        [1.0, 1.0, 0.0, 1.0], // Face 4
        [1.0, 0.0, 1.0, 1.0], // Face 5
        [0.0, 1.0, 1.0, 1.0], // Face 6
        [1.0, 0.0, 0.0, 1.0], // Face 7
        [0.0, 1.0, 0.0, 1.0], // Face 8
        [0.0, 0.0, 1.0, 1.0], // Face 9
        [1.0, 1.0, 0.0, 1.0], // Face 10
        [1.0, 0.0, 1.0, 1.0], // Face 11
        [0.0, 1.0, 1.0, 1.0]  // Face 12
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 5 times, one for each vertex of the dodecaedrum's face.
    let vertexColors = [];
    faceColors.forEach(color =>{
        for (let j=0; j < 5; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let dodecaedroIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodecaedroIndexBuffer);

    let dodecaedroIndices = [
        0, 1, 2,      2, 3, 0,      3, 4, 0,      // Face 1
        5, 6, 7,      7, 8, 5,      8, 9, 5,      // Face 2
        10, 11, 12,   12, 13, 10,   13, 14, 10,   // Face 3
        15, 16, 17,   17, 18, 15,   18, 19, 15,   // Face 4
        20, 21, 22,   22, 23, 20,   23, 24, 20,   // Face 5
        25, 26, 27,   27, 28, 25,   28, 29, 25,   // Face 6
        30, 31, 32,   32, 33, 30,   33, 34, 30,   // Face 7
        35, 36, 37,   37, 38, 35,   38, 39, 35,   // Face 8
        40, 41, 42,   42, 43, 40,   43, 44, 40,   // Face 9
        45, 46, 47,   47, 48, 45,   48, 49, 45,   // Face 10
        50, 51, 52,   52, 53, 50,   53, 54, 50,   // Face 11
        55, 56, 57,   57, 58, 55,   58, 59, 55,   // Face 12
    ];
    
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodecaedroIndices), gl.STATIC_DRAW);
    
    let dodecaedro = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:dodecaedroIndexBuffer,
            vertSize:3, nVerts:verts.length, colorSize:4, nColors: vertexColors.length, nIndices:dodecaedroIndices.length,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(dodecaedro.modelViewMatrix, dodecaedro.modelViewMatrix, translation);

    dodecaedro.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
        
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return dodecaedro;
}

// Create the vertex, color and index data for a multi-colored scutoid
function createScutoid(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
       // Hexagon
       -1.0,  0.0,  1.5,
       -0.5,-0.87,  1.5,
        0.5,-0.87,  1.5,
        1.0,  0.0,  1.5,
        0.5, 0.87,  1.5,
       -0.5, 0.87,  1.5,

       // Pentagon
       -1.0,  0.0, -1.5,
      -0.31,-0.95, -1.5,
       0.81,-0.59, -1.5,
       0.81, 0.59, -1.5,
      -0.31, 0.95, -1.5,

       // Face 1
       -1.0,  0.0,  1.5,
       -0.5,-0.87,  1.5,
       -1.0,  0.0, -1.5,
      -0.31,-0.95, -1.5,

       // Face 2
       -0.5,-0.87,  1.5,
        0.5,-0.87,  1.5,
      -0.31,-0.95, -1.5,
       0.81,-0.59, -1.5,

       // Face 3
        0.5,-0.87,  1.5,
        1.0,  0.0,  1.5,
       0.81,-0.59, -1.5,
       0.81, 0.59, -1.5,
       0.81, 0.59,  0.0,

        // Triangle face
        1.0,  0.0,  1.5,
        0.5, 0.87,  1.5,
       0.81, 0.59,  0.0,

        // Face 4
        0.5, 0.87,  1.5,
       -0.5, 0.87,  1.5,
       0.81, 0.59, -1.5,
      -0.31, 0.95, -1.5,
       0.81, 0.59,  0.0,

        // Face 5
       -0.5, 0.87,  1.5,
       -1.0,  0.0,  1.5,
      -0.31, 0.95, -1.5,
       -1.0,  0.0, -1.5,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [0.0, 0.0, 1.0, 1.0], // Hexagon
        [0.0, 0.0, 1.0, 1.0], // Pentagon
        [1.0, 0.0, 0.0, 1.0], // Face 1
        [1.0, 1.0, 0.0, 1.0], // Face 2
        [1.0, 0.0, 1.0, 1.0], // Face 3
        [0.0, 1.0, 1.0, 1.0],  // Triangle face
        [1.0, 0.0, 0.0, 1.0], // Face 4
        [1.0, 1.0, 0.0, 1.0], // Face 5
    ];

    // Each vertex must have the color information, that is why the same color is concatenated n times, depending on the type od the scutpid face
    let vertexColors = [];
    faceColors.forEach((color, i) =>{
        let nVertex = 0;
        if (i == 0) {
            nVertex = 6;
        } else if (i == 1 || i == 4 || i == 6) {
            nVertex = 5;
        } else if  (i == 5) {
            nVertex = 3;
        } else {
            nVertex = 4;
        }

        for (let j=0; j < nVertex; j++) {
            vertexColors.push(...color);
        }
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let scutoidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scutoidIndexBuffer);

    let scutoidIndices = [
        0, 1, 2,        0, 5, 2,        5, 2, 3,        3, 4, 5,    // Hexagon
        6, 7, 8,        6, 8, 10,       8, 9, 10,                   // Pentagon
        11, 12, 13,     14, 13, 12,                                 // Face 1
        15, 16, 17,     18, 17, 16,                                 // Face 2
        19, 20, 21,     22, 21, 20,     20, 22, 23,                 // Face 3
        24, 25, 26,                                                 // Triangle face
        27, 29, 31,     27, 28, 29,     30, 29, 28,                 // Face 4
        32, 33, 34,     35, 34, 33,                                 // Face 5
    ];
    
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(scutoidIndices), gl.STATIC_DRAW);
    
    let scutoid = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:scutoidIndexBuffer,
            vertSize:3, nVerts:verts.length, colorSize:4, nColors: vertexColors.length, nIndices:scutoidIndices.length,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(scutoid.modelViewMatrix, scutoid.modelViewMatrix, translation);

    scutoid.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
        
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return scutoid;
}

function bindShaderAttributes(gl, shaderProgram)
{
    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);
    
    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");
}

function draw(gl, shaderProgram, objs) 
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // set the shader to use
    gl.useProgram(shaderProgram);

    for(let i = 0; i< objs.length; i++)
    {
        let obj = objs[i];
        
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);
        
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function update(gl, shaderProgram, objs) 
{
    requestAnimationFrame(()=> update(gl, shaderProgram, objs));

    draw(gl,shaderProgram, objs);

    objs.forEach(obj =>{
        obj.update();
    })
}

main();