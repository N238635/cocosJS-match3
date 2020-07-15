import FieldController from "./FieldController";
import Cell from "./Cell";
import { tileColorID, tileType } from "./Tile";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameController extends cc.Component {

    @property(FieldController) field: FieldController = null;

    onLoad() {
        this.field.printField();
        this.field.initField();
        this.field.everyCell((cell: Cell) => {
            if (!cell.isDisabled) {
                let tile = this.field.createTile(tileType.Color, tileColorID.Red);
                cell.setTile(tile);
            }
        });
    }

}
