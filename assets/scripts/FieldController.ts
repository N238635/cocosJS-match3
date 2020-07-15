import Coords from "./Coords";
import Cell from "./Cell";
import Tile, { tileColorID, tileType } from "./Tile";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FieldController extends cc.Component {

    @property(cc.JsonAsset) config: cc.JsonAsset = null;

    @property(cc.Prefab) cellPrefab: cc.Prefab = null;
    @property(cc.Prefab) tilePrefab: cc.Prefab = null;

    private _field: Cell[][] = [];

    public everyCell(callback: (cell: Cell) => void): void {
        const { columns, rows } = this.config.json;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
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

    public createRandomColorTile(): Tile {
        let randomColorID = this.randomColorID();
        return this.createTile(tileType.Color, randomColorID);
    }

    public createTile(type: tileType, colorID?: tileColorID): Tile {
        let tile = cc.instantiate(this.tilePrefab).getComponent(Tile);
        tile.node.parent = this.node;
        tile.setType(type);
        if (typeof (colorID) !== 'undefined') {
            tile.setColorID(colorID);
        }
        return tile;
    }

    // Заполняем поле клетками
    public initField(): void {
        const { columns, rows, fieldLayout } = this.config.json;
        let isDark: boolean;
        let isDisabled: boolean;
        for (let row = 0; row < rows; row++) {
            this._field.push([]);
            for (let col = 0; col < columns; col++) {
                isDisabled = (fieldLayout[row][col] === 0);
                isDark = (this.isEven(row) === this.isEven(col));
                this._field[row].push(
                    this.createCell(new Coords(col, row), isDisabled, isDark)
                );
            }
        }
    }

    public printField(): void {
        const { fieldLayout, rows, columns } = this.config.json;
        let str = "";
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                str += fieldLayout[row][col] === 1 ? 'O ' : 'X ';
            }
            str += '\n';
        }
        cc.log(str);
    }

    private randomColorID(): tileColorID {
        let keys = Object.keys(tileColorID).filter(n => isNaN(Number(n)));
        let key = keys[Math.floor(Math.random() * keys.length)];
        return tileColorID[key];
    }

    private getAbsolutePositionOfCoords(coords: Coords): cc.Vec2 {
        const { columns, rows, canvas, cellSize } = this.config.json;
        let absoluteX = canvas.width / 2 - (columns / 2 - coords.col) * cellSize;
        let absoluteY = canvas.height / 2 + (rows / 2 - coords.row) * cellSize;
        return cc.v2(absoluteX, absoluteY);
    }

    private createCell(coords: Coords, isDisabled: boolean, isDark: boolean): Cell {
        const { cellSize } = this.config.json;
        let cell = cc.instantiate(this.cellPrefab).getComponent(Cell);
        cell.node.parent = this.node;
        cell.setSize(cellSize);
        let absoluteCellPosition = this.getAbsolutePositionOfCoords(coords);
        cell.setPositionFromAbsolute(absoluteCellPosition);
        cell.coords = coords;
        cell.isDisabled = isDisabled;
        cell.isDark = isDark;
        return cell;
    }

    private isEven(n: number): boolean {
        return n % 2 === 0;
    }
}
