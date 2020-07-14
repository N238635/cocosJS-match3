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

    private _height = this._fieldLayout.length;
    private _width = this._fieldLayout[0].length;

    private _everyRow(callback: Function) {
        for (let row = 0; row < this._height; row++) {
            callback(row);
        }
    }

    private _everyCol(callback: Function) {
        for (let col = 0; col < this._width; col++) {
            callback(col);
        }
    }

    private _everyCell(callback: Function) {
        this._everyRow((row: number) => {
            this._everyCol((col: number) => {
                callback(col, row);
            });
        });
    }

    private _initField() {
        this._everyCell((col: number, row: number) => {
            this.createCell(new Coords(col, row));
        });
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
