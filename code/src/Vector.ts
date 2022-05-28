export default class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    length(): number {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    add(other: Vector): Vector {
        return new Vector(
            this.x + other.x,
            this.y + other.y
        );
    }

    distanceTo(other: Vector) {
        return Math.sqrt(
            (this.x - other.x) ** 2 +
                (this.y - other.y) ** 2
        );
    }

    normalized() {
        const len = this.length();
        if(len !== 0)
            return new Vector(this.x / len, this.y / len);
        else
            return new Vector(0, 0);
    }
}
