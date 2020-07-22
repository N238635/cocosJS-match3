import Coords from "./Coords";
import Cell from "./Cell";
import Tile, { tileColorID, tileType } from "./Tile";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FieldController extends cc.Component {

    @property(cc.JsonAsset) config: cc.JsonAsset = null;

    @property(cc.Node) tileLayer: cc.Node = null;
    @property(cc.Node) cellLayer: cc.Node = null;

    @property(cc.Prefab) cellPrefab: cc.Prefab = null;

    public selectedTile: Tile;

    private _clickedTile: Tile;
    private _canSwipe: boolean = false;
    private _field: Cell[][] = [];

    public everyCell(callback: (cell: Cell) => void): void {
        this.everyRow((row: number) => {
            this.everyCol((column: number) => {
                callback(this.getCell(column, row));
            });
        });
    }

    public getCell(coords: Coords | number, row?: number): Cell {
        const isInvalidType: boolean = typeof (coords) === 'number';
        const column: number = isInvalidType && (coords as number);

        let realCoords: Coords = isInvalidType ? new Coords(column, row) : (coords as Coords);
        if (!realCoords) return;
        if (!this._field[realCoords.row]) return;

        return this._field[realCoords.row][realCoords.col];
    }

    public initField(): void {
        const { field, cell: cellParams } = this.config.json;
        let cell: Cell, cellCoords: Coords;
        let positionFromCoords: cc.Vec2, cellPosition: cc.Vec2;

        this.everyRow((row: number) => {
            this._field[row] = [];

            this.everyCol((col: number) => {
                cell = this.createCell();

                cellCoords = new Coords(col, row);
                cell.coords = cellCoords;

                positionFromCoords = this.getAbsolutePositionFromCoords(cellCoords);
                cellPosition = cell.convertToRelativePosition(positionFromCoords);

                cell.node.setPosition(cellPosition);
                cell.node.setContentSize(cellParams.width, cellParams.height);

                cell.isDisabled = field.layout[row][col] === 0;
                cell.isDark = this.isEven(row) === this.isEven(col);

                this._field[row][col] = cell;
            });
        });
    }

    public generateRandomTiles(): void {
        this.everyCell((cell: Cell) => {
            if (!cell.isDisabled) {
                const cellCoords: Coords = cell.coords;
                let exeptions: tileColorID[] = [];

                const checkDirections = [
                    { col: -1, row: 0 },
                    { col: 0, row: -1 }
                ];

                let currentCell: Cell;

                checkDirections.forEach((direction) => {
                    currentCell = this.getCell(cellCoords.col + direction.col, cellCoords.row + direction.row);

                    if (currentCell && currentCell.tile) exeptions.push(currentCell.tile.colorID);
                });

                let randomColorID: tileColorID = this.randomColorID(exeptions);

                let tile: Tile = cell.createTile(tileType.Color, randomColorID)

                tile.node.setParent(this.tileLayer);
                cell.tile = tile;
            }
        });
    }

    // TODO доделать
    public checkCombinations() {
        const directions = [
            new Coords(1, 0),
            new Coords(0, 1)
        ];

        let numberOfSameCells: number;

        this.everyCell((currentCell: Cell) => {
            directions.forEach((direction: Coords) => {
                numberOfSameCells = this.countSameColor(currentCell, direction);

                if (!numberOfSameCells) return;

                cc.log(numberOfSameCells);
            });
        });
    }

    public countSameColor(targetCell: Cell, direction: Coords): number {
        if (!targetCell.tile) return;

        let count: number = 0;
        let isSameColor: boolean = true;
        let nextCoords: Coords = targetCell.coords;

        let currentCell: Cell;
        let currentTile: Tile;

        while (isSameColor) {
            nextCoords.addSelf(direction);

            currentCell = this.getCell(nextCoords);

            if (!currentCell) return;


        }

        return count;
    }

    protected onEnable(): void {
        this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.node.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this);
        this.node.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }

    protected onDisable(): void {
        this.node.off(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.node.off(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this);
        this.node.off(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);

    }

    // TODO Если swap не произошел - отменяем выделение, не начинаем onMouseMove!
    private onMouseDown(event: cc.Event.EventMouse): void {
        let mousePosition: cc.Vec2 = event.getLocation();
        let coordsFromPosition: Coords = this.getCoordsFromAbsolutePosition(mousePosition);
        let cell: Cell = this.getCell(coordsFromPosition);

        // При любом клике снимаем выделения тайла
        this.unselectTile();

        if (!cell || cell.isDisabled || !cell.tile) {
            this._clickedTile = null;
            return;
        }

        let distance: number = this.distanceBetweenTiles(this._clickedTile, cell.tile);

        // Если между координатами этого и предыдущего нажатий одна клетка, то меняем их местами
        if (distance === 1) {
            this.swapTiles(this._clickedTile, cell.tile);
        } else {
            // Если не меняем местами - начинаем слушать движение мыши
            this._canSwipe = true;
        }

        // Если меняем местами, либо повторный клик (по одному тайлу),
        // то не считаем за начало нажатия (и не выделяем)
        this._clickedTile = distance === 1 || distance === 0 ? null : cell.tile;
    }

    private onMouseUp(event: cc.Event.EventMouse): void {
        let mousePosition: cc.Vec2 = event.getLocation();
        let fieldCoords: Coords = this.getCoordsFromAbsolutePosition(mousePosition);
        let cell: Cell = this.getCell(fieldCoords);

        // Конец нажатия - перестаем слушать движения мыши
        this._canSwipe = false;

        if (!this._clickedTile || !cell || cell.isDisabled || !cell.tile) return;

        // Если координаты начала и конца клика совпадают - выделяем тайл
        if (this._clickedTile === cell.tile) this.selectTile(cell.tile);
    }

    // TODO избавиться от else if
    private onMouseMove(event: cc.Event.EventMouse): void {
        if (!this._canSwipe || !this._clickedTile) return;

        const { cell } = this.config.json
        const mousePosition: cc.Vec2 = event.getLocation();
        const startPosition: cc.Vec2 = this._clickedTile.getAbsolutePosition();

        const moved: cc.Vec2 = mousePosition.sub(startPosition);
        const movedCol: number = moved.x / cell.width;
        const movedRow: number = moved.y / cell.height;

        let targetCoords: Coords = this._clickedTile.coords.clone();

        if (Math.abs(movedCol) > 1) {

            if (movedCol > 0) targetCoords.col++;
            else targetCoords.col--;

        } else if (Math.abs(movedRow) > 1) {
            
            if (movedRow > 0) targetCoords.row--;
            else targetCoords.row++;

        } else { return }

        this._canSwipe = false;

        let targetCell: Cell = this.getCell(targetCoords);

        if (!targetCell || !targetCell.tile) return;

        this.swapTiles(this._clickedTile, targetCell.tile);
        this._clickedTile = null;
    }

    private selectTile(tile: Tile): void {
        this.selectedTile = tile;
        this.selectedTile.select();
    }

    private unselectTile(): void {
        if (this.selectedTile) {
            this.selectedTile.unselect();
            this.selectedTile = null;
        }
    }

    private swapTiles(firstTile: Tile, secondTile: Tile): void {
        if (!firstTile || !secondTile || !firstTile.canBeSwapped || !secondTile.canBeSwapped) return;

        const coords1: Coords = firstTile.coords;
        const coords2: Coords = secondTile.coords;

        const cell1: Cell = this.getCell(coords1);
        const cell2: Cell = this.getCell(coords2);

        cell2.attractTile(firstTile);
        cell1.attractTile(secondTile);

        cc.log(`swap: [${coords1.col}, ${coords1.row}], [${coords2.col}, ${coords2.row}]`);
    }

    private getCoordsFromAbsolutePosition(absolutePosition: cc.Vec2): Coords {
        const { cell, field } = this.config.json;

        let relativePos: cc.Vec2 = this.node.parent.convertToNodeSpaceAR(absolutePosition);

        let column: number = relativePos.x / cell.width + field.columns / 2;
        let row: number = field.rows / 2 - relativePos.y / cell.height;

        return new Coords(Math.floor(column), Math.floor(row));
    }

    private getAbsolutePositionFromCoords(coords: Coords): cc.Vec2 {
        const { cell, field } = this.config.json;

        let relativeX: number = cell.width * (coords.col - (field.columns / 2) + 0.5);
        let relativeY: number = cell.height * ((field.rows / 2) - coords.row - 0.5);
        let relativePos: cc.Vec2 = cc.v2(relativeX, relativeY);

        return this.node.parent.convertToWorldSpaceAR(relativePos);
    }

    private distanceBetweenTiles(tile1: Tile, tile2: Tile): number {
        if (!tile1 || !tile2) return;

        let distanceX: number = Math.abs(tile1.coords.col - tile2.coords.col);
        let distanceY: number = Math.abs(tile1.coords.row - tile2.coords.row);

        return Math.hypot(distanceX, distanceY);
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
        cell.node.setParent(this.cellLayer);

        return cell;
    }

    private everyRow(callback: (row: number) => void): void {
        const { field } = this.config.json;

        for (let row: number = 0; row < field.rows; row++) {
            callback(row);
        }
    }

    private everyCol(callback: (column: number) => void): void {
        const { field } = this.config.json;

        for (let column: number = 0; column < field.columns; column++) {
            callback(column);
        }
    }

    private isEven(n: number): boolean {
        return n % 2 === 0;
    }
}
