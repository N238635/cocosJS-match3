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
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event: cc.Event.EventMouse) => {
            let absoluteMousePosition: cc.Vec2 = event.getLocation();
            cc.log(absoluteMousePosition.x, absoluteMousePosition.y);
            let fieldCoords: Coords = this.field.getCoordsFromAbsolutePosition(absoluteMousePosition);
            cc.log(fieldCoords.col, fieldCoords.row);
            let clickedCell: Cell = this.field.getCell(fieldCoords);

            if (clickedCell && !clickedCell.isDisabled && clickedCell.tile) {
                let tile: Tile = clickedCell.tile;
                this.selectTile(tile);
            }
        });

        this.field.printField();
        this.field.initField();

        this.field.generateRandomTiles();
    }
}
