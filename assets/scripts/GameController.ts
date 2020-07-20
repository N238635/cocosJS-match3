import FieldController from "./FieldController";
import Cell from "./Cell";
import Coords from "./Coords";
import Tile, { tileColorID, tileType } from "./Tile";

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
