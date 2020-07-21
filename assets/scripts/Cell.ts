import Coords from "./Coords";
import Tile from "./Tile";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Cell extends cc.Component {

    @property(cc.SpriteFrame) whiteSpriteFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) greySpriteFrame: cc.SpriteFrame = null;
    @property(cc.Sprite) background: cc.Sprite = null;

    public isDisabled: boolean = true;
    public isDark: boolean = true;
    public coords: Coords;

    get tile(): Tile { return this._tile }

    set tile(tile: Tile) {
        this._tile = tile;
        this._tile.coords = this.coords;

        let cellAbsolutePos: cc.Vec2 = this.getAbsolutePosition();
        let tileRelativePos: cc.Vec2 = this._tile.convertToRelativePosition(cellAbsolutePos);
        this._tile.node.setPosition(tileRelativePos);
    }

    private _tile: Tile;

    public removeTile(): void {
        this._tile.node.destroy();
        this._tile = null;
    }

    public convertToRelativePosition(absolutePosition: cc.Vec2): cc.Vec2 {
        return this.node.parent.convertToNodeSpaceAR(absolutePosition);
    }

    public getAbsolutePosition(): cc.Vec2 {
        return this.node.convertToWorldSpaceAR(cc.v2());
    }

    protected start(): void {
        this.updateSpriteFrame();
    }

    private updateSpriteFrame(): void {
        if (!this.isDisabled) {
            this.background.spriteFrame = this.isDark ? this.greySpriteFrame : this.whiteSpriteFrame;
        }
    }
}
