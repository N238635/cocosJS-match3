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
        const { field } = this.config.json;

        for (let row: number = 0; row < field.rows; row++) {
            for (let col: number = 0; col < field.columns; col++) {
                callback(this.getCell(col, row));
            }
        }
    }

    public getCell(coords: Coords | number, row?: number): Cell {
        const isInvalidType: boolean = typeof (coords) === 'number';
        const column: number = isInvalidType && (coords as number);

        let realCoords: Coords = isInvalidType ? new Coords(column, row) : (coords as Coords);
        if (!realCoords) return;
        if (!this._field[realCoords.row]) return;

        return this._field[realCoords.row][realCoords.col];
    }

    public createTile(type: tileType, colorID?: tileColorID): Tile {
        let tileNode: cc.Node = cc.instantiate(this.tilePrefab);
        let tile: Tile = tileNode.getComponent(Tile);

        tile.type = type;

        if (colorID || colorID === 0) tile.colorID = colorID;

        return tile;
    }

    // Заполняем поле клетками
    public initField(): void {
        const { field, cell: cellParams } = this.config.json;
        let cell: Cell, cellCoords: Coords, absoluteCellPosition: cc.Vec2;

        for (let row: number = 0; row < field.rows; row++) {
            this._field[row] = [];

            for (let col: number = 0; col < field.columns; col++) {
                cell = this.createCell();

                cell.isDisabled = field.layout[row][col] === 0;
                cell.isDark = this.isEven(row) === this.isEven(col);
                cell.node.setContentSize(cellParams.width, cellParams.height);

                cellCoords = new Coords(col, row);
                cell.coords = cellCoords;

                absoluteCellPosition = this.getAbsolutePositionOfCoords(cellCoords);
                cell.setAbsolutePosition(absoluteCellPosition);

                this._field[row][col] = cell;
            }
        }
    }

    public printField(): void {
        const { field } = this.config.json;

        let str: string = "";

        for (let row: number = 0; row < field.rows; row++) {
            for (let col: number = 0; col < field.columns; col++) {
                str += field.layout[row][col] === 1 ? 'O ' : 'X ';
            }
            str += '\n';
        }

        cc.log(str);
    }

    public generateRandomTiles(): void {
        this.everyCell((cell: Cell) => {
            if (!cell.isDisabled) {
                let cellCoords: Coords = cell.coords;
                let exeptions: tileColorID[] = [];

                let leftCell: Cell = this.getCell(cellCoords.col - 1, cellCoords.row);

                if (leftCell && !leftCell.isDisabled && leftCell.tile) {
                    let leftTileColorID: tileColorID = leftCell.tile.colorID;
                    exeptions.push(leftTileColorID);
                }

                let topCell: Cell = this.getCell(cellCoords.col, cellCoords.row - 1);

                if (topCell && !topCell.isDisabled && topCell.tile) {
                    let topTileColorID: tileColorID = topCell.tile.colorID;
                    exeptions.push(topTileColorID);
                }

                let randomColorID: tileColorID = this.randomColorID(exeptions);
                let tile: Tile = this.createTile(tileType.Color, randomColorID);

                cell.tile = tile;
            }
        });
    }

    public getCoordsFromAbsolutePosition(absolutePosition: cc.Vec2): Coords {
        const { canvas, cell } = this.config.json;

        let column: number = (absolutePosition.x - canvas.leftPadding) / cell.width
        let row: number = (canvas.height - absolutePosition.y - canvas.topPadding) / cell.height;

        return new Coords(Math.floor(column), Math.floor(row));
    }

    public getAbsolutePositionOfCoords(coords: Coords): cc.Vec2 {
        const { canvas, cell } = this.config.json;

        let absoluteX: number = canvas.leftPadding + coords.col * cell.width;
        let absoluteY: number = canvas.height - (canvas.topPadding + coords.row * cell.height);

        return cc.v2(absoluteX, absoluteY);
    }

    private randomColorID(exeptions?: tileColorID[]): tileColorID {
        let colorNames: string[] = Object.keys(tileColorID);

        let availableColors: tileColorID[] = [];
        let colorNumber: number;

        colorNames.forEach((colorName: string) => {
            colorNumber = Number.parseInt(colorName);
            if (Number.isNaN(colorNumber)) return;

            if (!exeptions || (exeptions.indexOf(colorNumber) === -1)) {
                availableColors.push(colorNumber);
            }
        });

        let randomAvailableColorIndex: number = Math.floor(Math.random() * availableColors.length);
        let colorID: tileColorID = availableColors[randomAvailableColorIndex];

        return colorID;
    }

    private createCell(): Cell {
        let cellNode: cc.Node = cc.instantiate(this.cellPrefab);
        let cell: Cell = cellNode.getComponent(Cell);
        cell.setParent(this.node);

        return cell;
    }

    private isEven(n: number): boolean {
        return n % 2 === 0;
    }
}
