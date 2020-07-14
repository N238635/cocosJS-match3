import Coords from "./Coords";
import Cell from "./Cell";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FieldController extends cc.Component {

    @property(cc.Prefab) cellPrefab: cc.Prefab = null;

    private readonly _fieldLayout: number[][] = [
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

    private readonly _height: number = 9;
    private readonly _width: number = 9;

    private _field: cc.Node[][] = [];

    private everyCoord(callback: (col: number, row: number) => void): void {
        for (let row = 0; row < this._height; row++) {
            for (let col = 0; col < this._width; col++) {
                callback(col, row);
            }
        }
    }

    public getCell(coords: Coords): Cell {
        return
    }

    private isEven(n: number): boolean {
        return n % 2 === 0;
    }

    // Заполняем поле клетками
    private initField(): void {
        for (let row = 0; row < this._height; row++) {
            this._field.push([]);
            for (let col = 0; col < this._width; col++) {
                if (this._fieldLayout[row][col] === 1) {
                    let typeID = this.isEven(row) !== this.isEven(col) ? 0 : 1;
                    this._field[row].push(
                        this.createCell(new Coords(col, row), typeID)
                    );
                }
            }
        }
    }

    private printField(): void {
        let str = "";
        for (let row = 0; row < this._height; row++) {
            for (let col = 0; col < this._width; col++) {
                str += this._fieldLayout[row][col] === 1 ? 'O ' : 'X ';
            }
            str += '\n';
        }
        cc.log(str);
    }

    public getPositionOfCell(coords: Coords): cc.Vec2 {
        return cc.v2(62 * (coords.col - 4), 62 * (4 - coords.row));
    }

    public createCell(coords: Coords, typeID: number): cc.Node {
        let cell = cc.instantiate(this.cellPrefab);
        cell.parent = this.node;
        let pos = this.getPositionOfCell(coords);
        cell.setPosition(pos);
        return cell;
    }

    protected onLoad(): void {
        this.printField();
        this.initField();
    }
}
