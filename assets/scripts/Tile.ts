import Coords from "./Coords";
const {ccclass, property} = cc._decorator;

export enum tileColor {
    Yellow = 0,
    Red = 1, 
    Blue = 2, 
    Purple = 3, 
    Green = 4, 
    Orange = 5
}

@ccclass
export default class Tile extends cc.Component {
    
    @property(cc.SpriteFrame) whiteCircle: cc.SpriteFrame = null;

    private _coords: Coords = new Coords();

    public getCoords(): Coords {
        return this._coords;
    }

    public setCoords(x: Coords | number, y?: number ) {
        if (typeof(x) !== 'number') this._coords = x;
        else this._coords = new Coords(x, y);
    }
}
