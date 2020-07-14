import Coords from "./Coords";
const {ccclass, property} = cc._decorator;

@ccclass
export default class Cell extends cc.Component {

    @property(cc.SpriteFrame) whiteSpriteFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) greySpriteFrame: cc.SpriteFrame = null;

    private _sprite: cc.Sprite;
    private _typeID: number;

    private _coords: Coords = new Coords();

    private changeSpriteFrame(typeID: number): void {
        switch (typeID) {
            case 0:
                this._sprite.spriteFrame = this.whiteSpriteFrame;
                break;
            case 1:
                this._sprite.spriteFrame = this.greySpriteFrame;
                break;
        }
    }

    private getPositionOfCoords(coords: Coords): cc.Vec2 {
        //TODO
        return cc.v2(62 * (coords.col - 4), 62 * (4 - coords.row));
    }

    public changePosition(): void {
        let pos = this.getPositionOfCoords(this._coords);
        this.node.setPosition(pos);
    }

    public getCoords(): Coords {
        return this._coords;
    }

    public setCoords(col: Coords | number, row?: number ) {
        if (typeof(col) !== 'number') this._coords = col;
        else this._coords = new Coords(col, row);
    }

    public setType(typeID: number): void {
        this._typeID = typeID;
        this.changeSpriteFrame(this._typeID);
    }

    get typeID(): number {
        return this._typeID;
    }

    protected onLoad(): void {
        this._sprite = this.node.addComponent(cc.Sprite);
    }
}
