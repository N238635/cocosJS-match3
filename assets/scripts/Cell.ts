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

        const cellAbsolutePos: cc.Vec2 = this.getAbsolutePosition();
        const tileRelativePos: cc.Vec2 = this._tile.convertToRelativePosition(cellAbsolutePos);
        this._tile.node.setPosition(tileRelativePos);
    }

    private _tile: Tile;

    public removeTile(): void {
        this._tile.node.destroy();
        this._tile = null;
    }

    public attractTile(tile: Tile): void {
        const absolutePos: cc.Vec2 = this.getAbsolutePosition();
        const tilePos: cc.Vec2 = tile.convertToRelativePosition(absolutePos);

        tile.canBeSwapped = false;

        cc.tween(tile.node).to(0.2, { position: tilePos }).call(() => {
            tile.canBeSwapped = true;
            this.tile = tile;
        }).start();
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
