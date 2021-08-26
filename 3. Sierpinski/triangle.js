class triangle {
    // Constructor del triangulo, da lugar a los valores iniciales
    constructor(x, y, base, color, subdivisions) {
        this.x = x;
        this.y = y;
        this.base = base;
        this.color = color;
        this.height = base * (Math.sqrt(3)/2);
        this.subdivisions = subdivisions;
    }

    // Función para dinujar el triangulo
    draw(context) {
        // Se obtienen los valores del triangulo (por facilidad)
        const { x, y, base, color, height, subdivisions } = this;
        if (subdivisions == 0) {
            // Caso base no es necesario subdividir el triangulo presente (se dibuja un triangulo completo)
            context.fillStyle = color;
            context.beginPath();
            context.moveTo(x, y + height);
            context.lineTo(x + base, y + height);
            context.lineTo(x + base/2, y);
            context.closePath();
            context.fill();
        } else {
            // Se generan los tres sub-triangulos que conforman al triangulo presente y se dibujan
            let t1 = new triangle(x, y + height/2, base/2, color, subdivisions - 1);
            let t2 = new triangle(x + base/2, y + height/2, base/2, color, subdivisions - 1);
            let t3 = new triangle(x + base/4, y, base/2, color, subdivisions - 1);
            t1.draw(context);
            t2.draw(context);
            t3.draw(context);
        }
    }
}

export { triangle };