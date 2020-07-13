import Coords from "./Coords";
const {ccclass, property} = cc._decorator;

@ccclass
export default class Cell extends cc.Component {

    @property(cc.SpriteFrame) whiteSpriteFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) greySpriteFrame: cc.SpriteFrame = null;

    private _coords: Coords = new Coords();

    public getCoords(): Coords {
        return this._coords;
    }

    public setCoords(x: Coords | number, y?: number ) {
        if (typeof(x) !== 'number') this._coords = x;
        else this._coords = new Coords(x, y);
    }

}
