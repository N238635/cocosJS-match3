import FieldController from "./FieldController";
import Coords from "./Coords";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameController extends cc.Component {

    @property(FieldController) field: FieldController = null;

    protected onEnable(): void {
        const { cell, field } = this.field.config.json;

        Coords.cellSize = cc.size(cell.width, cell.height);
        Coords.fieldSize = cc.size(field.rows, field.columns);
        Coords.fieldNode = this.field.node;
        
        this.field.initField();

        this.field.generateRandomTiles();
    }
}
