import Coords from "./Coords";
import Cell from "./Cell";
import Tile, { tileColorID, tileType } from "./Tile";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FieldController extends cc.Component {

    @property(cc.JsonAsset) config: cc.JsonAsset = null;
    @property(cc.Node) tileLayer: cc.Node = null;

    @property(cc.Prefab) cellPrefab: cc.Prefab = null;
    @property(cc.Prefab) tilePrefab: cc.Prefab = null;

    public selectedTile: Tile;

    private _clickedTile: Tile;
    private _canSwipe: boolean = false;

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
        tileNode.setParent(this.tileLayer);

        let tile: Tile = tileNode.getComponent(Tile);
        tile.type = type;

        if (colorID || colorID === 0) tile.colorID = colorID;

        return tile;
    }

    public selectTile(tile: Tile): void {
        this.selectedTile = tile;
        this.selectedTile.select();
    }

    public unselectTile(): void {
        if (this.selectedTile) {
            this.selectedTile.unselect();
            this.selectedTile = null;
        }
    }

    // Заполняем поле клетками
    public initField(): void {
        const { field, cell: cellParams } = this.config.json;
        let cell: Cell, cellCoords: Coords;
        let absoluteCoordsPos: cc.Vec2, relativeCellPos: cc.Vec2;

        for (let row: number = 0; row < field.rows; row++) {
            this._field[row] = [];

            for (let col: number = 0; col < field.columns; col++) {
                cell = this.createCell();

                cell.isDisabled = field.layout[row][col] === 0;
                cell.isDark = this.isEven(row) === this.isEven(col);
                cell.node.setContentSize(cellParams.width, cellParams.height);

                cellCoords = new Coords(col, row);
                cell.coords = cellCoords;

                absoluteCoordsPos = this.getAbsolutePositionOfCoords(cellCoords);
                relativeCellPos = cell.convertToRelativePosition(absoluteCoordsPos);
                cell.node.setPosition(relativeCellPos);

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

    private onMouseDown(event: cc.Event.EventMouse): void {
        let mousePosition: cc.Vec2 = event.getLocation();
        let tile: Tile = this.getTileFromPosition(mousePosition);

        // При любом клике снимаем выделения тайла
        this.unselectTile();

        if (!tile) return;

        let distance: number = this.distanceToClickedTile(tile);

        // Если между координатами этого и предыдущего нажатий одна клетка, то меняем их местами
        if (distance === 1) {
            this.swapTiles(this._clickedTile, tile);
        } else {
            // Если не меняем местами - начинаем слушать движение мыши
            this._canSwipe = true;
        }

        // Если меняем местами, либо повторный клик (по одному тайлу),
        // то не считаем за начало нажатия (и не выделяем)
        if (distance === 1 || distance === 0) tile = null;

        // Начало нажатия - текущий тайл
        this._clickedTile = tile;
    }

    private onMouseUp(event: cc.Event.EventMouse): void {
        let mousePosition: cc.Vec2 = event.getLocation();
        let tile: Tile = this.getTileFromPosition(mousePosition);

        // Конец нажатия - перестаем слушать движения мыши
        this._canSwipe = false;

        // Если координаты начала и конца клика совпадают - выделяем тайл
        if (this.distanceToClickedTile(tile) === 0) {
            this.selectTile(tile);
        }
    }

    private onMouseMove(event: cc.Event.EventMouse): void {
        if (!this._canSwipe) return;

        const { cell } = this.config.json
        const mousePosition: cc.Vec2 = event.getLocation();
        const startPosition: cc.Vec2 = this._clickedTile.getAbsolutePosition();

        const moved: cc.Vec2 = mousePosition.sub(startPosition);
        const movedCol: number = moved.x / cell.width;
        const movedRow: number = moved.y / cell.height;

        if (Math.abs(movedCol) < 1 && Math.abs(movedRow) < 1) return;

        this._canSwipe = false;

        let targetCoords: Coords = this._clickedTile.coords.clone();

        if (movedRow >= 1) targetCoords.row--;
        else if (movedRow <= -1) targetCoords.row++;
        else if (movedCol >= 1) targetCoords.col++;
        else if (movedCol <= -1) targetCoords.col--;

        let targetCell: Cell = this.getCell(targetCoords);

        if (!targetCell || !targetCell.tile) return;

        this.swapTiles(this._clickedTile, targetCell.tile);
        this._clickedTile = null;
    }

    private swapTiles(firstTile: Tile, secondTile: Tile): void {
        if (!firstTile && !secondTile) return;

        const coords1: Coords = secondTile.coords;
        const coords2: Coords = firstTile.coords;
        const distance: number = Coords.distance(coords1, coords2);

        const cell1: Cell = this.getCell(coords1);
        const cell2: Cell = this.getCell(coords2);

        const cell1AbsolutePos: cc.Vec2 = cell1.getAbsolutePosition();
        const cell2AbsolutePos: cc.Vec2 = cell2.getAbsolutePosition();

        const tile1NewPos: cc.Vec2 = firstTile.convertToRelativePosition(cell2AbsolutePos);
        const tile2NewPos: cc.Vec2 = firstTile.convertToRelativePosition(cell1AbsolutePos);

        cc.tween(firstTile.node).to(0.2, { position: tile2NewPos }).call(() => {
            cell2.tile = secondTile;
        }).start();

        cc.tween(secondTile.node).to(0.2, { position: tile1NewPos }).call(() => {
            cell1.tile = firstTile;
        }).start();

        cc.log(`swap: [${coords1.col}, ${coords1.row}], [${coords2.col}, ${coords2.row}] : ${distance}`);
    }

    private distanceToClickedTile(tile: Tile): number {
        if (!this._clickedTile || !tile) return;

        return Coords.distance(this._clickedTile.coords, tile.coords);
    }

    private getTileFromPosition(pos: cc.Vec2): Tile {
        let fieldCoords: Coords = this.getCoordsFromAbsolutePosition(pos);
        let cell: Cell = this.getCell(fieldCoords);

        if (cell && !cell.isDisabled && cell.tile) return cell.tile;
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
        cell.node.setParent(this.node);

        return cell;
    }

    private isEven(n: number): boolean {
        return n % 2 === 0;
    }
}
