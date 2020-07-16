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
        let tileNode = cc.instantiate(this.tilePrefab);
        let tile = tileNode.getComponent(Tile);

        tile.setParent(this.node);
        tile.setType(type);

        if (colorID || colorID === 0) tile.setColorID(colorID);

        return tile;
    }

    // Заполняем поле клетками
    public initField(): void {
        const { columns, rows, fieldLayout, cellSize } = this.config.json;
        let cell: Cell, cellCoords: Coords, absoluteCellPosition: cc.Vec2;

        for (let row = 0; row < rows; row++) {
            this._field[row] = [];

            for (let col = 0; col < columns; col++) {
                cell = this.createCell();

                cell.isDisabled = fieldLayout[row][col] === 0;
                cell.isDark = this.isEven(row) === this.isEven(col);
                cell.setSize(cellSize);

                cellCoords = new Coords(col, row);
                cell.coords = cellCoords;

                absoluteCellPosition = this.getAbsolutePositionOfCoords(cellCoords);
                cell.setPositionFromAbsolute(absoluteCellPosition);

                this._field[row][col] = cell;
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

    private randomColorID(): number {
        let colorNames = Object.keys(tileColorID).filter(n => isNaN(Number(n)));
        let randomNameIndex = Math.floor(Math.random() * colorNames.length);
        let color = colorNames[randomNameIndex];

        return tileColorID[color];
    }

    private getAbsolutePositionOfCoords(coords: Coords): cc.Vec2 {
        const { columns, rows, canvas, cellSize } = this.config.json;

        let absoluteX = canvas.width / 2 - (columns / 2 - coords.col) * cellSize;
        let absoluteY = canvas.height / 2 + (rows / 2 - coords.row) * cellSize;

        return cc.v2(absoluteX, absoluteY);
    }

    private createCell(): Cell {
        let cellNode = cc.instantiate(this.cellPrefab);
        let cell = cellNode.getComponent(Cell);
        cell.setParent(this.node);

        return cell;
    }

    private isEven(n: number): boolean {
        return n % 2 === 0;
    }
}
