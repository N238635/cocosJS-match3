import FieldController from "./FieldController";
import Cell from "./Cell";
import Tile, { tileColorID, tileType } from "./Tile";
import Coords from "./Coords";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameController extends cc.Component {

    @property(FieldController) field: FieldController = null;

    protected onLoad(): void {
        this.field.printField();
        this.field.initField();

        this.field.generateRandomTiles();
    }
}
