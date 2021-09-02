import { triangle } from './triangle.js';

// Se actualiza el canvas al inicio del programa o al modificar el slider
function update(context, size, subdivisions) {
    context.clearRect(0, 0, size, size);
    // Se genera un triangulo con las subdivisiones deseadas
    let triangulo = new triangle(0, 0, size, 'orange', subdivisions);
    triangulo.draw(context);
}

function main() {
    // Se obtienen todos los elementos dentro del html
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const slider = document.getElementById('range');
    const output = document.getElementById('subs');

    // Se obtienen los valores a ser utilizados para dibujar
    const size = canvas.clientWidth;
    let subdivisions = 0;

    // Se maneja el cambio de valores en el slider
    slider.oninput = function() {
        subdivisions = this.value;
        output.innerHTML = subdivisions;
        update(context, size, subdivisions);
    }
    update(context, size, subdivisions);
}

main();