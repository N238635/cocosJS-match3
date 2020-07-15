import Coords from "./Coords";
import Cell from "./Cell";
import GameController from "./GameController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FieldController extends cc.Component {

    @property(cc.Prefab) cellPrefab: cc.Prefab = null;
    @property(cc.JsonAsset) config: cc.JsonAsset = null;

    private _fieldLayout: number[][] = [];
    private _rows: number = 0;
    private _columns: number = 0;
    private _cellSize: number = 0;

    private _canvasWidth: number;
    private _canvasHeight: number;

    private _field: Cell[][] = [];

    public everyCell(callback: (cell: Cell) => void): void {
        for (let row = 0; row < this._rows; row++) {
            for (let col = 0; col < this._columns; col++) {
                callback(this.getCell(col, row));
            }
        }
    }

    public getCell(coords: Coords | number, row?: number): Cell {
        const isInvalidType: boolean = (typeof (coords) === 'number');
        const column = isInvalidType && (coords as number);

        let realCoords = isInvalidType ? new Coords(column, row) : (coords as Coords);
        if (!realCoords) return;

        return this._field[realCoords.col][realCoords.row];
    }

    public createCell(coords: Coords, isDisabled: boolean, isDark: boolean): Cell {
        let cell = cc.instantiate(this.cellPrefab).getComponent(Cell);
        cell.node.parent = this.node;
        cell.setSize(this._cellSize);
        cell.node.setPosition(this.getPositionOfCoords(coords));
        cell.coords = coords;
        cell.isDisabled = isDisabled;
        cell.isDark = isDark;
        return cell;
    }

    protected onLoad(): void {
        this._fieldLayout = this.config.json.fieldLayout;
        this._rows = this.config.json.rows;
        this._columns = this.config.json.columns;
        this._cellSize = this.config.json.cellSize;
        this._canvasWidth = this.config.json.canvas.width;
        this._canvasHeight = this.config.json.canvas.height;

        this.printField();
        this.initField();
    }

    private getPositionOfCoords(coords: Coords): cc.Vec2 {
        let absoluteX = this._canvasWidth / 2 - (this._columns / 2 - (coords.col + 0.5)) * this._cellSize;
        let absoluteY = this._canvasHeight / 2 + (this._rows / 2 - (coords.row + 0.5)) * this._cellSize;
        return this.node.convertToNodeSpaceAR(cc.v2(absoluteX, absoluteY));
    }

    // Заполняем поле клетками
    private initField(): void {
        let isDark: boolean;
        let isDisabled: boolean;
        for (let row = 0; row < this._rows; row++) {
            this._field.push([]);
            for (let col = 0; col < this._columns; col++) {
                isDisabled = (this._fieldLayout[row][col] === 0);
                isDark = (this.isEven(row) === this.isEven(col));
                this._field[row].push(
                    this.createCell(new Coords(col, row), isDisabled, isDark)
                );
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

    private isEven(n: number): boolean {
        return n % 2 === 0;
    }
}
