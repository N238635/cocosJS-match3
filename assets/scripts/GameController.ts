import FieldController from "./FieldController";
import Cell from "./Cell";
import Coords from "./Coords";
import Tile, { tileColorID, tileType } from "./Tile";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameController extends cc.Component {

    @property(FieldController) field: FieldController = null;

    public selectedTile: Tile;

    public selectTile(tile: Tile): void {
        this.unselectTile();
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
        let clickedTile: Tile = this.getTileFromPosition(mousePosition);

        if (clickedTile) this.selectTile(clickedTile);
    }

    private onMouseUp(event: cc.Event.EventMouse): void {

    }

    private getTileFromPosition(pos: cc.Vec2): Tile {
        let fieldCoords: Coords = this.field.getCoordsFromAbsolutePosition(pos);
        let cell: Cell = this.field.getCell(fieldCoords);

        if (cell && !cell.isDisabled && cell.tile) return cell.tile;
    }
}
