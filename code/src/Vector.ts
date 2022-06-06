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

    distanceTo(other: Vector): number {
        return Math.sqrt(
            (this.x - other.x) ** 2 +
                (this.y - other.y) ** 2
        );
    }

    normalized(): Vector {
        const len = this.length();
        if(len !== 0)
            return new Vector(this.x / len, this.y / len);
        else
            return new Vector(0, 0);
    }

    toDirectionIndex(): number {
        let result: number = 0;
        if (Math.abs(this.x) > Math.abs(this.y)) {
            // horizontal axis is stronger
            if (this.x > 0) result = 1;
            else result = 3;

        } else {
            // vertical axis is stronger
            if (this.y > 0) result = 2;
            else result = 0;
        }
        return result;
    }
}
