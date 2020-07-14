import Coords from "./Coords";
const { ccclass, property } = cc._decorator;

@ccclass
export default class Cell extends cc.Component {

    @property(cc.SpriteFrame) whiteSpriteFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) greySpriteFrame: cc.SpriteFrame = null;
    @property(cc.Sprite) background: cc.Sprite = null;

    public isDisabled: boolean = true;

    set isDark(isDark: boolean) {
        this._isDark = isDark;
        this.updateSpriteFrame();
    }

    get isDark(): boolean { return this._isDark }

    private _coords: Coords = new Coords();
    private _isDark: boolean;

    public updatePosition(): void {
        let pos = this.getPositionOfCoords(this._coords);
        this.node.setPosition(pos);
    }

    public getCoords(): Coords {
        return this._coords;
    }

    public setCoords(coords: Coords) {
        this._coords = coords;
        this.updatePosition();
    }

    private updateSpriteFrame(): void {
        if (!this.isDisabled) {
            this.background.spriteFrame = this.isDark ? this.greySpriteFrame : this.whiteSpriteFrame;
        }
    }

    private getPositionOfCoords(coords: Coords): cc.Vec2 {
        //TODO
        return cc.v2(62 * (coords.col - 4), 62 * (4 - coords.row));
    }
}
