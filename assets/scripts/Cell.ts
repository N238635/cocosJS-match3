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
    public tile: Tile;

    public createTile(type: tileType, colorID?: tileColorID): Tile {
        let tileNode: cc.Node = cc.instantiate(this.tilePrefab);
        let tile: Tile = tileNode.getComponent(Tile);

        tile.type = type;
        tile.coords = this.coords;

        if (colorID || colorID === 0) tile.colorID = colorID;

        return tile;
    }

    public removeTile(): void {
        if (!this.tile || this.isBusy) return;

        // cc.log(`Removed: [${this.tile.coords.col}, ${this.tile.coords.row}] : ${this.tile.colorID}`);

        this.isBusy = true;

        this.tile.delete(() => { this.isBusy = false });

        this.tile = null;
    }

    public attractTile(tile: Tile): void {
        cc.log('FALLING:', this.coords, tile.coords);
        this.isBusy = true;

        this.tile = tile;

        this.tile.moveTo(this.coords, () => { this.isBusy = false });
    }

    public swapTiles(targetCell: Cell): void {
        let targetTile: Tile = targetCell.tile;
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
