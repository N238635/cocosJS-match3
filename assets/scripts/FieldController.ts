import Coords from "./Coords";
import Cell from "./Cell";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FieldController extends cc.Component {

    @property(cc.Prefab) cellPrefab: cc.Prefab = null;
    @property(cc.JsonAsset) config: cc.JsonAsset = null;

    private _fieldLayout: number[][] = [];
    private _rows: number = 0;
    private _columns: number = 0;

    private _field: Cell[][] = [];

    private everyCell(callback: (cell: Cell) => void): void {
        for (let row = 0; row < this._rows; row++) {
            for (let col = 0; col < this._columns; col++) {
                callback(this.getCell(col, row));
            }
        }
    }

    public getCell(coords: Coords | number, row?: number): Cell {
        const isInvalidType: boolean = (typeof(coords) === 'number');
        const column = isInvalidType && (coords as number);

        let realCoords = isInvalidType ? new Coords(column, row) : (coords as Coords);
        if (!realCoords) return;

        return this._field[realCoords.col][realCoords.row];
    }

    private isEven(n: number): boolean {
        return n % 2 === 0;
    }

    // Заполняем поле клетками
    private initField(): void {
        for (let row = 0; row < this._rows; row++) {
            this._field.push([]);
            for (let col = 0; col < this._columns; col++) {
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
        for (let row = 0; row < this._rows; row++) {
            for (let col = 0; col < this._columns; col++) {
                str += this._fieldLayout[row][col] === 1 ? 'O ' : 'X ';
            }
            str += '\n';
        }
        cc.log(str);
    }

    public getPositionOfCell(coords: Coords): cc.Vec2 {
        return cc.v2(62 * (coords.col - 4), 62 * (4 - coords.row));
    }

    public createCell(coords: Coords, typeID: number): Cell {
        let cell = cc.instantiate(this.cellPrefab);
        cell.parent = this.node;
        let pos = this.getPositionOfCell(coords);
        cell.setPosition(pos);
        return cell.getComponent(Cell);
    }

    protected onLoad(): void {
        this._fieldLayout = this.config.json.fieldLayout;
        this._rows = this.config.json.rows;
        this._columns = this.config.json.columns;

        this.printField();
        this.initField();
    }
}
