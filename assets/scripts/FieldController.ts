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

    private _clickedCell: Cell;
    private _canSwipe: boolean = false;
    private _field: Cell[][] = [];

    public everyCoords(everyCoordsCallback: (coords: Coords) => void, fromLastRow: boolean = false): void {
        const { field } = this.config.json;

        let fromStart = (callback: (row: number) => void): void => {
            for (let row: number = 0; row < field.rows; row++) {
                callback(row);
            }
        }

        let fromEnd = (callback: (row: number) => void): void => {
            for (let row: number = field.rows - 1; row >= 0; row--) {
                callback(row);
            }
        }

        let everyRow: Function = fromLastRow ? fromEnd : fromStart;

        everyRow((row: number) => {
            for (let col: number = 0; col < field.columns; col++) {
                everyCoordsCallback(new Coords(col, row));
            }
        });
    }

    public everyCell(callback: (cell: Cell) => void, fromLastRow: boolean = false): void {
        this.everyCoords((coords: Coords) => {
            callback(this.getCell(coords));
        }, fromLastRow);
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
        let positionFromCoords: cc.Vec2, cellPosition: cc.Vec2;
        let cell: Cell;

        this.everyCoords((coords: Coords) => {
            cell = this.createCell(coords);

            positionFromCoords = this.getAbsolutePositionFromCoords(coords);
            cellPosition = cell.convertToRelativePosition(positionFromCoords);

            cell.node.setPosition(cellPosition);
            cell.node.setContentSize(cellParams.width, cellParams.height);

            cell.isDisabled = field.layout[coords.row][coords.col] === 0;
            cell.isDark = this.isEven(coords.row) === this.isEven(coords.col);

            this._field[coords.row] = this._field[coords.row] || [];
            this._field[coords.row][coords.col] = cell;
        });
    }

    public generateRandomTiles(): void {
        this.everyCell((cell: Cell) => {
            if (cell.isDisabled) return;

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

            let tile: Tile = cell.createTile(cell.coords, tileType.Color, randomColorID)

            tile.node.setParent(this.tileLayer);

            cell.tile = tile;
        });
    }

    // TODO сделать падение тайлов / добавление бонусов
    public checkField() {
        const directions = [
            new Coords(1, 0),
            new Coords(0, 1)
        ];

        let isFromLastRow = true;
        let combinations: Cell[][] = [];
        let combination: Cell[];

        this.everyCell((currentCell: Cell) => {
            if (currentCell.isBusy) return;

            directions.forEach((direction: Coords) => {
                combination = this.checkCombination(currentCell, direction);

                if (combination.length > 2) combinations.push(combination);
            });

            if (currentCell.tile || currentCell.isDisabled || currentCell.isBusy) return;

            let fallingTile: Tile = this.getFallingTile(currentCell.coords);

            if (!fallingTile) return;

            cc.log(fallingTile.coords);
            currentCell.attractTile(fallingTile);
        }, isFromLastRow);

        combinations.forEach((combination: Cell[]) => {
            cc.log(combination);
            combination.forEach((cell: Cell) => {
                cell.removeTile();
            });
        });
    }


    // TODO создание новых тайлов
    public getFallingTile(fallTo: Coords): Tile {
        let currentRow: number = fallTo.row;

        let currentCoords: Coords;
        let currentCell: Cell;

        let findTile: Function = (): Tile => {
            currentCoords = new Coords(fallTo.col, currentRow--);
            currentCell = this.getCell(currentCoords);

            if (!currentCell || currentCell.isDisabled) {
                return;

                let cell: Cell = this.getCell(fallTo);

                let randomColorID: tileColorID = this.randomColorID();
                let newTile: Tile = cell.createTile(currentCoords, tileType.Color, randomColorID);

                newTile.node.setParent(this.tileLayer);

                return newTile;
            }

            if (!currentCell.tile) return findTile();

            return currentCell.tile;
        };

        return findTile();
    }

    public checkCombination(targetCell: Cell, direction: Coords): Cell[] {
        if (!targetCell.tile) return [];

        const targetColorID: number = targetCell.tile.colorID;

        let nextCoords: Coords = targetCell.coords.clone();
        let combination: Cell[] = [];
        let currentCell: Cell = targetCell;

        let checkNextTile: Function = () => {
            combination.push(currentCell);

            nextCoords.addSelf(direction);
            currentCell = this.getCell(nextCoords);

            if (
                !currentCell || 
                !currentCell.tile || 
                currentCell.tile.colorID !== targetColorID || 
                currentCell.isBusy
            ) { 
                return combination;
            }

            return checkNextTile();
        };

        return checkNextTile();
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

    protected update(): void {
        this.checkField();
    }

    // TODO Если swap не произошел - отменяем выделение, не начинаем onMouseMove!
    private onMouseDown(event: cc.Event.EventMouse): void {
        let mousePosition: cc.Vec2 = event.getLocation();
        let coordsFromPosition: Coords = this.getCoordsFromAbsolutePosition(mousePosition);
        let cell: Cell = this.getCell(coordsFromPosition);

        // При любом клике снимаем выделения тайла
        this.unselectTile();

        if (!cell || cell.isDisabled || !cell.tile) {
            this._clickedCell = null;
            return;
        }

        let distance: number = this.distanceBetweenCells(this._clickedCell, cell);

        // Если между координатами этого и предыдущего нажатий одна клетка, то меняем их местами
        if (distance === 1) {
            this._clickedCell.swapTiles(cell);
        } else {
            // Если не меняем местами - начинаем слушать движение мыши
            this._canSwipe = true;
        }

        // Если меняем местами, либо повторный клик (по одному тайлу),
        // то не считаем за начало нажатия (и не выделяем)
        this._clickedCell = distance === 1 || distance === 0 ? null : cell;
    }

    private onMouseUp(event: cc.Event.EventMouse): void {
        let mousePosition: cc.Vec2 = event.getLocation();
        let fieldCoords: Coords = this.getCoordsFromAbsolutePosition(mousePosition);
        let cell: Cell = this.getCell(fieldCoords);

        // Конец нажатия - перестаем слушать движения мыши
        this._canSwipe = false;

        if (!this._clickedCell || !cell || cell.isDisabled || !cell.tile) return;

        // Если координаты начала и конца клика совпадают - выделяем тайл
        if (this._clickedCell === cell) this.selectTile(cell.tile);
    }

    // TODO избавиться от else if
    private onMouseMove(event: cc.Event.EventMouse): void {
        if (!this._canSwipe || !this._clickedCell) return;

        const { cell } = this.config.json
        const mousePosition: cc.Vec2 = event.getLocation();
        const startPosition: cc.Vec2 = this._clickedCell.getAbsolutePosition();

        const moved: cc.Vec2 = mousePosition.sub(startPosition);
        const movedCol: number = moved.x / cell.width;
        const movedRow: number = moved.y / cell.height;

        let targetCoords: Coords = this._clickedCell.coords.clone();

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

        targetCell.swapTiles(this._clickedCell);
        this._clickedCell = null;
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

    private distanceBetweenCells(cell1: Cell, cell2: Cell): number {
        if (!cell1 || !cell2) return;

        let distanceX: number = Math.abs(cell1.coords.col - cell2.coords.col);
        let distanceY: number = Math.abs(cell1.coords.row - cell2.coords.row);

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

    private createCell(coords: Coords): Cell {
        let cellNode: cc.Node = cc.instantiate(this.cellPrefab);
        let cell: Cell = cellNode.getComponent(Cell);
        cell.node.setParent(this.cellLayer);
        cell.coords = coords;

        return cell;
    }

    private isEven(n: number): boolean {
        return n % 2 === 0;
    }
}
