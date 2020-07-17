import FieldController from "./FieldController";
import Cell from "./Cell";
import Tile, { tileColorID, tileType } from "./Tile";
import Coords from "./Coords";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameController extends cc.Component {

    @property(FieldController) field: FieldController = null;

    protected onLoad(): void {
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event: cc.Event.EventMouse) => {
            let absolutePosition: cc.Vec2 = event.getLocation();
            cc.log(absolutePosition.x, absolutePosition.y);
            let fieldCoords: Coords = this.field.getCoordsFromAbsolutePosition(absolutePosition);
            cc.log(fieldCoords.col, fieldCoords.row);

        });

        this.field.printField();
        this.field.initField();

        this.field.generateRandomTiles();
    }
}
