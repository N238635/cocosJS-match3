import Coords from "./Coords";
import Cell from "./Cell";
import Tile, { tileColorID, tileType } from "./Tile";
import Counter from "./Counter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FieldController extends cc.Component {

    @property(cc.JsonAsset) config: cc.JsonAsset = null;

    @property(Counter) turnsCounter: Counter = null;
    @property(Counter) taskCounter: Counter = null;

    @property(cc.Node) tileLayer: cc.Node = null;
    @property(cc.Node) cellLayer: cc.Node = null;

    @property(cc.Prefab) cellPrefab: cc.Prefab = null;

    public selectedTile: Tile;
    public isChecking: boolean = false;

    private _clickedCell: Cell = null;
    private _canSwipe: boolean = false;
    private _field: Cell[][] = [];
    private _lastSwapCells: Cell[];

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
        const col: number = isInvalidType && (coords as number);

        let realCoords: Coords = isInvalidType ? new Coords(col, row) : (coords as Coords);
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

            positionFromCoords = Coords.getAbsolutePositionFromCoords(coords);
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
                Coords.left,
                Coords.up
            ];

            let currentCell: Cell = null;

            checkDirections.forEach((direction) => {
                currentCell = this.getCell(cellCoords.col + direction.col, cellCoords.row + direction.row);

                if (currentCell && currentCell.isTileAvailable()) exeptions.push(currentCell.tile.colorID);
            });

            let randomColorID: tileColorID = this.randomColorID(exeptions);

            let newTile: Tile = cell.createTile(tileType.Color, randomColorID)
            newTile.node.setParent(this.tileLayer);

            cell.forceMoveContents();
        });
    }

    public checkField() {
        const directions = [
            Coords.right,
            Coords.up
        ];

        const boosterDirections = [
            "Vertical",
            "Horizontal"
        ];

        type combinationType = { cells: Cell[], boosterType: tileType };

        let isFromLastRow = true;
        let combinations: combinationType[] = [];
        let combination: combinationType;
        let combinationCells: Cell[];

        this.everyCell((currentCell: Cell) => {
            if (currentCell.isBusy) return;

            for (let directionIndex in directions) {
                combinationCells = this.checkCombination(currentCell, directions[directionIndex]);

                if (combinationCells.length < 3) continue;

                combination = {
                    cells: combinationCells,
                    boosterType: null
                };

                if (combinationCells.length > 3) {
                    combination.boosterType = combinationCells.length === 4 ? tileType[boosterDirections[directionIndex]] : tileType.Rainbow;
                }

                combinations.push(combination);

                combination.cells.forEach((cell: Cell) => {
                    cell.isBusy = true;
                });
            }

            if (!currentCell.tile && !currentCell.isDisabled) this.fillColumn(currentCell);
        }, isFromLastRow);

        let findCombinationCellFromLastMove = (currentCell: Cell, swappedCells: Cell[]): Cell => {
            if (!swappedCells) return currentCell;

            for (let swappedCell of swappedCells) {
                if (
                    swappedCell.tile &&
                    currentCell.tile &&
                    swappedCell.tile.colorID === currentCell.tile.colorID
                ) {
                    return swappedCell;
                }
            }

            return currentCell;
        }

        let randomIndex: number;

        combinations.forEach((combination: { cells: Cell[], boosterType: tileType }) => {
            randomIndex = Math.floor(Math.random() * combination.cells.length);

            let boosterCell = findCombinationCellFromLastMove(combination.cells[randomIndex], this._lastSwapCells);

            const createBooster = (cell: Cell, targetCell: Cell): void => {
                if (!combination.boosterType || targetCell !== cell) return;

                let newTile = cell.createTile(combination.boosterType);
                newTile.node.setParent(this.tileLayer);

                cell.forceMoveContents();
            };

            combination.cells.forEach((cell: Cell) => {
                cell.removeTile(() => createBooster(cell, boosterCell));
            });
        });

        if (combinations.length > 0) return true;
    }

    public checkCombination(targetCell: Cell, direction: Coords): Cell[] {
        if (!targetCell.tile || (!targetCell.tile.colorID && targetCell.tile.colorID !== 0)) return [];

        const targetColorID: number = targetCell.tile.colorID;

        let nextCoords: Coords = targetCell.coords.clone();
        let combination: Cell[] = [];
        let nextCell: Cell = targetCell;

        let checkNextTile: Function = () => {
            combination.push(nextCell);

            nextCoords.addSelf(direction);
            nextCell = this.getCell(nextCoords);

            if (combination.length > 2) {
                let a = [nextCell];
                cc.log(a, targetColorID);
            }

            if (
                !nextCell ||
                !nextCell.isTileAvailable() ||
                nextCell.tile.colorID !== targetColorID
            ) {
                return combination;
            }

            return checkNextTile();
        };

        return checkNextTile();
    }

    public fillColumn(targetCell: Cell): void {
        const targetCoords: Coords = targetCell.coords;

        const foundResult = this.getCellToFallFrom(targetCoords);

        let { shouldFall, cellToFallFrom, startCoords, diagonalOptions } = foundResult;

        if (!shouldFall) return;

        if (cellToFallFrom && cellToFallFrom.tile) {
            if (cellToFallFrom.isBusy) return;

            targetCell.isBusy = true;

            targetCell.attractTile(cellToFallFrom.tile);

            cellToFallFrom.tile = null;

            return;
        }

        if (startCoords.row !== -1) {
            if (diagonalOptions.length === 0) return;

            const randomOptionIndex: number = Math.floor(Math.random() * diagonalOptions.length);
            const diagonalCell = diagonalOptions[randomOptionIndex];

            const newTargetCell = this.getCell(targetCell.coords.col, diagonalCell.coords.row + 1);

            if (diagonalCell.isBusy) return;

            newTargetCell.isBusy = true;

            newTargetCell.attractTile(diagonalCell.tile);

            diagonalCell.tile = null;

            return;
        }

        let currentCoords: Coords;
        let currentCell: Cell;

        for (let row = targetCoords.row; row >= 0; row--) {
            currentCoords = new Coords(targetCoords.col, row);
            currentCell = this.getCell(currentCoords);

            currentCell.isBusy = true;

            this.createAndDropTileWithDelay(currentCell, 200 * (targetCoords.row - row));
        }
    }

    public getCellToFallFrom(targetCoords: Coords): {
        shouldFall: boolean,
        cellToFallFrom: Cell,
        startCoords: Coords,
        diagonalOptions: Cell[]
    } {
        let result = {
            shouldFall: true,
            cellToFallFrom: null,
            startCoords: targetCoords.clone(),
            diagonalOptions: []
        };

        let checkForDiagonals: boolean = true;
        let diagonalOptionsFound: Cell[] = [];

        let leftCell: Cell = null;
        let rightCell: Cell = null;

        let findTile = () => {
            result.startCoords.row--;

            if (checkForDiagonals && result.startCoords.row < targetCoords.row) {
                diagonalOptionsFound = []

                leftCell = this.getCell(targetCoords.col - 1, result.startCoords.row);
                rightCell = this.getCell(targetCoords.col + 1, result.startCoords.row);

                if (leftCell && leftCell.tile) diagonalOptionsFound.push(leftCell);
                if (rightCell && rightCell.tile) diagonalOptionsFound.push(rightCell);

                if (diagonalOptionsFound.length === 0) checkForDiagonals = false;
                else result.diagonalOptions = diagonalOptionsFound;
            }

            result.cellToFallFrom = this.getCell(result.startCoords);

            if (!result.cellToFallFrom || result.cellToFallFrom.isDisabled) return;

            if (result.cellToFallFrom.isBusy) {
                result.shouldFall = false;
                return;
            }

            if (result.cellToFallFrom.tile) return;

            findTile();
        };

        findTile();

        return result;
    }

    public createAndDropTileWithDelay(targetCell: Cell, delay: number): void {
        setTimeout(() => {
            const randomColorID: tileColorID = this.randomColorID();

            let newTile: Tile = targetCell.createTile(tileType.Color, randomColorID);
            newTile.node.setParent(this.tileLayer);

            const fallFrom = new Coords(targetCell.coords.col, -1);

            targetCell.forceMoveContents(fallFrom);
            targetCell.attractTile();
        }, delay);
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
        if (!Coords.isInitialized) return;

        let hasFoundCombination: boolean = this.checkField();

        if (hasFoundCombination) this._lastSwapCells = null;

        if (
            !this._lastSwapCells ||
            this._lastSwapCells[0].isBusy ||
            this._lastSwapCells[1].isBusy
        ) {
            return;
        }

        // this._lastSwapCells[0].swapTiles(this._lastSwapCells[1]);

        this._lastSwapCells = null;
    }

    // TODO Если swap не произошел - отменяем выделение, не начинаем onMouseMove!
    private onMouseDown(event: cc.Event.EventMouse): void {
        let mousePosition: cc.Vec2 = event.getLocation();
        let coordsFromPosition: Coords = Coords.getCoordsFromAbsolutePosition(mousePosition);
        let cell: Cell = this.getCell(coordsFromPosition);

        this.unselectTile();

        if (!cell || !cell.isTileAvailable()) {
            this._clickedCell = null;
            return;
        }

        let distance: number = (!this._clickedCell) ? null : Coords.distance(this._clickedCell.coords, cell.coords);

        // Если между координатами этого и предыдущего нажатий одна клетка, то меняем их местами
        if (distance === 1) {
            this.swap(cell, this._clickedCell);
        } else {
            this._canSwipe = true;
        }

        this._clickedCell = cell;
        // Если меняем местами, либо повторный клик (по одному тайлу),
        // то не считаем за начало нажатия (и не выделяем)
        if (distance !== 1 && distance !== 0) return;

        this._clickedCell = null;

        if (cell.tile.type !== tileType.Color && distance === 0) {
            this.activateBooster(cell);
        }
    }

    private onMouseUp(event: cc.Event.EventMouse): void {
        let mousePosition: cc.Vec2 = event.getLocation();
        let fieldCoords: Coords = Coords.getCoordsFromAbsolutePosition(mousePosition);
        let cell: Cell = this.getCell(fieldCoords);

        // Конец нажатия - перестаем слушать движения мыши
        this._canSwipe = false;

        if (!this._clickedCell || !cell || !cell.isTileAvailable()) return;

        // Если координаты начала и конца клика совпадают - выделяем тайл
        if (this._clickedCell === cell) this.selectTile(cell.tile);
    }

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

        this.swap(targetCell, this._clickedCell);

        if (targetCell && targetCell.tile) this._clickedCell = null;
    }

    private swap(cell1: Cell, cell2: Cell): void {
        if (!cell1 || !cell2 || !cell1.isTileAvailable() || !cell2.isTileAvailable()) return;

        this._lastSwapCells = [cell1, cell2];

        let cell1Tile: Tile = cell1.tile;

        cell1.attractTile(cell2.tile, () => {
            if (cell2.tile.type !== tileType.Color) this.activateBooster(cell2, cell1);
        });

        cell2.attractTile(cell1Tile, () => {
            if (cell1.tile.type !== tileType.Color) this.activateBooster(cell1, cell2);
        });

        cc.log(`swap: [${cell1.coords.col}, ${cell1.coords.row}], [${cell2.coords.col}, ${cell2.coords.row}]`);

    }

    private activateBooster(boosterCell: Cell, activateOn?: Cell) {
        const strategies = {
            [tileType.Rainbow]: {
                check: (
                    activateOn && 
                    (activateOn.tile.type === tileType.Color || activateOn.tile.type === tileType.Rainbow)
                ),
                callback: () => {
                    if (!activateOn.tile) return;

                    if (activateOn.tile.type === tileType.Color) this.removeEveryTileOfColor(activateOn.tile.colorID);
                    else if (activateOn.tile.type === tileType.Rainbow) this.removeEveryTile();
                }
            },

            [tileType.Vertical]: {
                check: true,
                callback: () => { this.removeVerticalLine(boosterCell.coords.col) }
            },

            [tileType.Horizontal]: {
                check: true,
                callback: () => { this.removeHorizontalLine(boosterCell.coords.row) }
            }
        };

        let strategy = strategies[boosterCell.tile.type];

        if (strategy && strategy.check) boosterCell.removeTile(strategy.callback);
    }

    private removeEveryTile() {
        this.everyCell((cell: Cell) => {
            cell.removeTile();
        });
    }

    private removeEveryTileOfColor(targetColor: tileColorID): void {
        this.everyCell((cell: Cell) => {
            if (!cell.isTileAvailable() || cell.tile.colorID !== targetColor) return;

            this.removeTileFromCell(cell);
        });
    }

    private removeVerticalLine(col: number): void {
        let currentCell: Cell = null;

        for (let row = 0; row < Coords.fieldSize.width; row++) {
            currentCell = this.getCell(col, row);

            if (!currentCell) continue;

            this.removeTileFromCell(currentCell);
        }
    }

    private removeHorizontalLine(row: number): void {
        let currentCell: Cell = null;

        for (let col = 0; col < Coords.fieldSize.width; col++) {
            currentCell = this.getCell(col, row);

            if (!currentCell) continue;

            this.removeTileFromCell(currentCell);
        }
    }

    private removeTileFromCell(cell: Cell): void {
        if (!cell || !cell.tile || cell.isDisabled) return;

        if (cell.tile.type === tileType.Color) return void cell.removeTile();

        this.activateBooster(cell);
    }

    private selectTile(tile: Tile): void {
        this.selectedTile = tile;
        this.selectedTile.select();
    }

    private unselectTile(): void {
        if (!this.selectedTile) return;

        this.selectedTile.unselect();
        this.selectedTile = null;
    
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
