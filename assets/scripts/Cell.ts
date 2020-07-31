import Coords from "./Coords";
import Tile, { tileType, tileColorID } from "./Tile";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Cell extends cc.Component {

    @property(cc.SpriteFrame) lightSpriteFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) darkSpriteFrame: cc.SpriteFrame = null;
    @property(cc.Sprite) background: cc.Sprite = null;

    @property(cc.Prefab) tilePrefab: cc.Prefab = null;

    public isBusy: boolean = false;
    public isDisabled: boolean = true;
    public isDark: boolean = true;

    public coords: Coords = null;
    public tile: Tile = null;

    public isTileAvailable(): boolean {
        return !this.isDisabled && !this.isBusy && !!this.tile;
    }

    public createTile(type: tileType, colorID?: tileColorID): Tile {
        let tileNode: cc.Node = cc.instantiate(this.tilePrefab);
        let newTile: Tile = tileNode.getComponent(Tile);

        newTile.type = type;
        newTile.coords = this.coords;

        if (colorID || colorID === 0) newTile.colorID = colorID;

        this.tile = newTile;

        return newTile;
    }

    public removeTile(callback?: Function): void {
        if (!this.tile) return;

        // cc.log(`Removed: [${this.tile.coords.col}, ${this.tile.coords.row}] : ${this.tile.colorID}`);

        this.isBusy = true;

        this.tile.delete(() => {
            this.isBusy = false;
            this.tile = null;

            if (callback) callback();
        });
    }

    public attractTile(tile?: Tile, callback?: Function): void {
        this.isBusy = true;

        if (tile) this.tile = tile;

        this.tile.moveTo(this.coords, () => {
            this.isBusy = false;
            if (callback) callback();
        });
    }

    public forceMoveContents(placeTo?: Coords): void {
        this.tile.coords = placeTo || this.coords;

        const currentPosition: cc.Vec2 = Coords.getAbsolutePositionFromCoords(this.tile.coords);
        const relCurrentPosition: cc.Vec2 = this.tile.convertToRelativePosition(currentPosition);

        this.tile.node.setPosition(relCurrentPosition);
    }

    public convertToRelativePosition(absolutePosition: cc.Vec2): cc.Vec2 {
        return this.node.parent.convertToNodeSpaceAR(absolutePosition);
    }

    public getAbsolutePosition(): cc.Vec2 {
        return this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
    }

    protected start(): void {
        this.updateSpriteFrame();
    }

    private updateSpriteFrame(): void {
        if (this.isDisabled) return;

        this.background.spriteFrame = this.isDark ? this.darkSpriteFrame : this.lightSpriteFrame;
    }
}
