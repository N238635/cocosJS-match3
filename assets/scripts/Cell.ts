import Coords from "./Coords";
import Tile from "./Tile";
const { ccclass, property } = cc._decorator;

@ccclass
export default class Cell extends cc.Component {

    @property(cc.SpriteFrame) whiteSpriteFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) greySpriteFrame: cc.SpriteFrame = null;
    @property(cc.Sprite) background: cc.Sprite = null;

    public isDisabled: boolean = true;

    get getTile(): Tile { return this._tile }

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

    private _tile: Tile;
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

    public setTile(tile: Tile): void {
        this._tile = tile;
        this._tile.node.setPosition(this.node.getPosition());
        this._tile.coords = this._coords;
    }

    public removeTile(): void {
        this._tile = null;
    }

    public setSize(size: number): void {
        this.node.width = size;
        this.node.height = size;
    }

    public setPositionFromAbsolute(absolutePosition: cc.Vec2): void {
        let pos = this.node.parent.convertToNodeSpaceAR(absolutePosition);
        pos.addSelf(this.centerPositionCorrection());
        this.node.setPosition(pos);
    }

    private centerPositionCorrection(): cc.Vec2 {
        return cc.v2(0.5 * this.node.width, -0.5 * this.node.height);
    }

    private updateSpriteFrame(): void {
        if (!this.isDisabled) {
            this.background.spriteFrame = this._isDark ? this.greySpriteFrame : this.whiteSpriteFrame;
        }
    }
}
