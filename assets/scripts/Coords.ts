export default class Coords {
    private _x: number = 0;
    private _y: number = 0;

    constructor(x: number = 0, y: number = 0) {
        this._x = x;
        this._y = y;
    }

    public set x(value: number) {
        this._x = value;
    }

    public get x(): number {
        return this._x;
    }

    public set y(value: number) {
        this._y = value;
    }

    public get y(): number {
        return this._y;
    }

    public addSelf(coords: Coords | number, y?: number): Coords {
        if (typeof(coords) !== 'number') {
            this._x += coords.x;
            this._y += coords.y;
        } else {
            this._x += coords;
            this._y += y;
        }
        return this;
    }

    public add(coords: Coords | number, y?: number): Coords {
        if (typeof(coords) !== 'number') return new Coords(this.x + coords.x, this.y + coords.y);
        else return new Coords(this.x + coords, this.y + y);
    }

    public subSelf(coords: Coords | number, y?: number): Coords {
        if (typeof(coords) !== 'number') {
            this._x -= coords.x;
            this._y -= coords.y;
        } else {
            this._x -= coords;
            this._y -= y;
        }
        return this;
    }

    public sub(coords: Coords | number, y?: number): Coords {
        if (typeof(coords) !== 'number') return new Coords(this.x - coords.x, this.y - coords.y);
        else return new Coords(this.x - coords, this.y - y);
    }
}
