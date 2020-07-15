import Coords from "./Coords";
import Tile from "./Tile";
const { ccclass, property } = cc._decorator;

@ccclass
export default class Cell extends cc.Component {

    @property(cc.SpriteFrame) whiteSpriteFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) greySpriteFrame: cc.SpriteFrame = null;
    @property(cc.Sprite) background: cc.Sprite = null;

    public tile: Tile;
    public isDisabled: boolean = true;

    get isDark(): boolean { return this._isDark }
    set isDark(isDark: boolean) {
        this._isDark = isDark;
        this.updateSpriteFrame();
    }

    get coords(): Coords { return this._coords }
    set coords(coords: Coords) {
        this._coords = coords;
        //this.updatePosition();
    }

    private _coords: Coords = new Coords();
    private _isDark: boolean;

    public updatePosition(): void {
        //TODO
        let pos = this.getPositionOfCoords(this._coords);
        this.node.setPosition(pos);
    }

    public getPositionOfCoords(coords: Coords): cc.Vec2 {
        //TODO
        return cc.v2(62 * (coords.col - 4), 62 * (4 - coords.row));
    }

    public setSize(size: number): void {
        this.node.width = size;
        this.node.height = size;
    }

    private updateSpriteFrame(): void {
        if (!this.isDisabled) {
            this.background.spriteFrame = this._isDark ? this.greySpriteFrame : this.whiteSpriteFrame;
        }
    }
}
