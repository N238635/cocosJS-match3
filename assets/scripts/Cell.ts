import Coords from "./Coords";
import Tile, { tileType, tileColorID } from "./Tile";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Cell extends cc.Component {

    @property(cc.SpriteFrame) whiteSpriteFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) greySpriteFrame: cc.SpriteFrame = null;
    @property(cc.Sprite) background: cc.Sprite = null;

    @property(cc.Prefab) tilePrefab: cc.Prefab = null;

    public isBusy: boolean = false;
    public isDisabled: boolean = true;
    public isDark: boolean = true;

    public coords: Coords;

    get tile(): Tile { return this._tile }

    set tile(tile: Tile) {
        this._tile = tile;

        const cellAbsolutePos: cc.Vec2 = this.getAbsolutePosition();
        const tileRelativePos: cc.Vec2 = this._tile.convertToRelativePosition(cellAbsolutePos);
        this._tile.node.setPosition(tileRelativePos);
    }

    private _tile: Tile;

    public createTile(coords: Coords, type: tileType, colorID?: tileColorID): Tile {
        let tileNode: cc.Node = cc.instantiate(this.tilePrefab);
        let tile: Tile = tileNode.getComponent(Tile);

        tile.type = type;
        tile.coords = coords;

        if (colorID || colorID === 0) tile.colorID = colorID;

        return tile;
    }

    public removeTile(): void {
        if (!this._tile) return;

        let tileNode = this._tile.node;
        this._tile = null;

        this.isBusy = true;

        cc.tween(tileNode).to(0.2, { scale: 0 }).call(() => {
            tileNode.destroy();
            this.isBusy = false;
        }).start();
    }

    public attractTile(tile: Tile): void {
        this._tile = null;

        const absolutePos: cc.Vec2 = this.getAbsolutePosition();
        const tilePos: cc.Vec2 = tile.convertToRelativePosition(absolutePos);

        this.isBusy = true;

        cc.tween(tile.node).to(0.2, { position: tilePos }).call(() => {
            this.tile = tile;
            this.isBusy = false;
        }).start();
    }

    public swapTiles(targetCell: Cell): void {
        if (!targetCell || !this.tile || !targetCell.tile || this.isBusy || targetCell.isBusy) return;

        let targetTile = targetCell.tile;
        targetCell.attractTile(this.tile);
        this.attractTile(targetTile);

        cc.log(`swap: [${this.coords.col}, ${this.coords.row}], [${targetCell.coords.col}, ${targetCell.coords.row}]`);
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
