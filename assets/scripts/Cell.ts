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
        this._tile.setParent(this.node);
        this._tile.coords = this.coords;
    }

    private _tile: Tile;

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

    protected start(): void {
        this.updateSpriteFrame();
    }

    private updateSpriteFrame(): void {
        if (!this.isDisabled) {
            this.background.spriteFrame = this.isDark ? this.greySpriteFrame : this.whiteSpriteFrame;
        }
    }
}
