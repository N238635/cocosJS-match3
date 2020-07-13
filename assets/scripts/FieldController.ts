import Coords from "./Coords";
import Cell from "./Cell";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FieldController extends cc.Component {

    @property(cc.Prefab) cellPrefab: cc.Prefab = null;

    private _fieldLayout = [
        [1, 1, 1, 1, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    private _initField() {
        for (let row = 0; row < this._fieldLayout.length; row++) {
            for (let col = 0; col < this._fieldLayout[row].length; col++) {
                if (this._fieldLayout[row][col] === 1) {
                    this.createCell(new Coords(col, row));
                }
            }
        }
    }

    public getPositionOfCell(coords: Coords) {
        return cc.v2(62 * (coords.col - 4), 62 * (coords.row - 4));
    }

    public createCell(coords: Coords): cc.Node {
        let cell = cc.instantiate(this.cellPrefab);
        cell.parent = this.node;
        let pos = this.getPositionOfCell(coords);
        cell.setPosition(pos);
        return cell;
    }

    onLoad() {
        this._initField();
    }
}
