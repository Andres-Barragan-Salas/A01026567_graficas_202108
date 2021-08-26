import { bar } from './bar.js';
import { ball } from './ball.js';

function update(contexto, barraIzq, barraDer, bola) {
    requestAnimationFrame(() => {
        update(contexto, barraIzq, barraDer, bola);
    });

    contexto.clearRect(0, 0, 500, 300);

    barraIzq.update();
    barraDer.update();
    bola.update(barraIzq, barraDer);

    barraIzq.draw(contexto);
    barraDer.draw(contexto);
    bola.draw(contexto);
}

function main() {
    const canvas = document.getElementById('pongCanvas');
    const contexto = canvas.getContext('2d');

    let barraIzq = new bar(20, 20, 20, 60, 'white', 'w', 's');
    let barraDer = new bar(460, 150, 20, 60, 'white', 'o', 'l');
    let bola = new ball(250, 150, 10, 'white');

    update(contexto, barraIzq, barraDer, bola);
}

main();