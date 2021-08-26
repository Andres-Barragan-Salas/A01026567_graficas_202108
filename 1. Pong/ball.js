class ball {
    constructor(x, y, radio, color) {
        this.x = x;
        this.y = y;
        this.radio = radio;
        this.color = color;
        this.speedX = Math.random() * 5;
        this.speedY = Math.random() * 5;
    }

    horizontalCollition(leftBar, rightBar) {
        const leftX = (this.x - this.radio);
        const rightX = (this.x + this.radio);

        return leftX < 0 ||
            rightX > 500 ||
            (leftX < (leftBar.x + leftBar.width) && 
                (this.y >= leftBar.y && 
                this.y <= (leftBar.y + leftBar.height))) ||
            (rightX > rightBar.x && 
                (this.y >= rightBar.y && 
                this.y <= (rightBar.y + rightBar.height)));
    }

    verticalCollition(s) {
        const lowerY = (this.y + this.radio);
        const upperY = (this.y - this.radio);

        return upperY < 0 || lowerY > 300;
    }

    update(leftBar, rightBar) {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.horizontalCollition(leftBar, rightBar)) this.speedX *= -1;
        if (this.verticalCollition()) this.speedY *= -1;
    }

    draw(contexto) {
        contexto.fillStyle = this.color;
        contexto.beginPath();
        contexto.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
        contexto.fill();
    }
}

export { ball };