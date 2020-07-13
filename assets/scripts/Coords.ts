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
}
