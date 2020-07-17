import Coords from "./Coords";
import Tile from "./Tile";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Cell extends cc.Component {

    @property(cc.SpriteFrame) whiteSpriteFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) greySpriteFrame: cc.SpriteFrame = null;
    @property(cc.Sprite) background: cc.Sprite = null;

    public isDisabled: boolean = true;
    public coords: Coords;

    get tile(): Tile { return this._tile }

    set tile(tile: Tile) {
        this._tile = tile;
        this._tile.setParent(this.node);
        this._tile.coords = this.coords;
        this._tile.setPosition(cc.v2(0, 0));
    }

    get isDark(): boolean { return this._isDark }

    set isDark(isDark: boolean) {
        this._isDark = isDark;
        this.updateSpriteFrame();
    }

    private _tile: Tile;
    private _coords: Coords = new Coords();
    private _isDark: boolean;

    public setParent(parent: cc.Node): void {
        this.node.parent = parent;
    }

    public removeTile(): void {
        this._tile = null;
    }

    public setAbsolutePosition(absolutePosition: cc.Vec2): void {
        let pos: cc.Vec2 = this.node.parent.convertToNodeSpaceAR(absolutePosition);
        this.node.setPosition(pos);
    }

    private updateSpriteFrame(): void {
        if (!this.isDisabled) {
            this.background.spriteFrame = this._isDark ? this.greySpriteFrame : this.whiteSpriteFrame;
        }
    }
}
