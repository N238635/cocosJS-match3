import FieldController from "./FieldController";
import Cell from "./Cell";
import Coords from "./Coords";
import Tile, { tileColorID, tileType } from "./Tile";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameController extends cc.Component {

    @property(FieldController) field: FieldController = null;

    public selectedTile: Tile;

    private _clickedTile: Tile;

    public selectTile(tile: Tile): void {
        this.selectedTile = tile;
        this.selectedTile.select();
    }

    public unselectTile(): void {
        if (this.selectedTile) {
            this.selectedTile.unselect();
            this.selectedTile = null;
        }
    }

    protected onLoad(): void {
        this.field.printField();
        this.field.initField();

        this.field.generateRandomTiles();
    }

    protected onEnable(): void {
        this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.node.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    protected onDisable(): void {
        this.node.off(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.node.off(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    private onMouseDown(event: cc.Event.EventMouse): void {
        let mousePosition: cc.Vec2 = event.getLocation();
        let tile: Tile = this.getTileFromPosition(mousePosition);

        this.unselectTile();

        if (tile) {
            let distance: number = this.distanceToClickedTile(tile);

            if (distance === 1) {
                this.swapWithClickedTile(tile);
            } else {
                this.node.on(cc.Node.EventType.MOUSE_MOVE, this.onSwipe, this);
                if (distance === 0) tile = null;
            }

            this._clickedTile = tile;
        }
    }

    private onMouseUp(event: cc.Event.EventMouse): void {
        let mousePosition: cc.Vec2 = event.getLocation();
        let tile: Tile = this.getTileFromPosition(mousePosition);

        this.node.off(cc.Node.EventType.MOUSE_MOVE, this.onSwipe, this);

        if (this.distanceToClickedTile(tile) === 0) {
            this.selectTile(tile);
        }
    }

    private onSwipe(event: cc.Event.EventMouse): void {
        let mousePosition: cc.Vec2 = event.getLocation();
        let tile: Tile = this.getTileFromPosition(mousePosition);

        if (tile) {
            let distance: number = this.distanceToClickedTile(tile);

            if (distance === 1) this.swapWithClickedTile(tile);

            if (distance !== 0) {
                this.node.off(cc.Node.EventType.MOUSE_MOVE, this.onSwipe, this);
                this._clickedTile = null;
            }
        }
    }

    private swapWithClickedTile(clickedTile: Tile): void {
        if (this._clickedTile) {
            let coords1: Coords = clickedTile.coords;
            let coords2: Coords = this._clickedTile.coords;
            let distance: number = Coords.distance(coords1, coords2);

            cc.log(`swap: [${coords1.col}, ${coords1.row}], [${coords2.col}, ${coords2.row}] : ${distance}`);
        }
    }

    private distanceToClickedTile(tile: Tile): number {
        if (!this._clickedTile || !tile) return;

        return Coords.distance(this._clickedTile.coords, tile.coords);
    }

    private getTileFromPosition(pos: cc.Vec2): Tile {
        let fieldCoords: Coords = this.field.getCoordsFromAbsolutePosition(pos);
        let cell: Cell = this.field.getCell(fieldCoords);

        if (cell && !cell.isDisabled && cell.tile) return cell.tile;
    }
}
