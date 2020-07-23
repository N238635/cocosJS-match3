export default class Coords {
    public static fieldSize: cc.Size = null;
    public static cellSize: cc.Size = null;
    public static fieldNode: cc.Node = null;
    public static isInitialized: boolean = false;

    public col: number = 0;
    public row: number = 0;

    constructor(col: number = 0, row: number = 0) {
        this.col = col;
        this.row = row;
    }

    public addSelf(coords: Coords): Coords {
        this.col += coords.col;
        this.row += coords.row;

        return this;
    }

    public add(coords: Coords): Coords {
        return this.clone().addSelf(coords);
    }

    public subSelf(coords: Coords): Coords {
        this.col -= coords.col;
        this.row -= coords.row;

        return this;
    }

    public sub(coords: Coords): Coords {
        return this.clone().subSelf(coords);
    }

    public mulSelf(coords: Coords): Coords {
        this.col *= coords.col;
        this.row *= coords.row;

        return this;
    }

    public mul(coords: Coords): Coords {
        return this.clone().mulSelf(coords);
    }

    public clone(): Coords {
        return new Coords(this.col, this.row);
    }

    public static getCoordsFromAbsolutePosition(absolutePosition: cc.Vec2): Coords {
        let relativePos: cc.Vec2 = Coords.fieldNode.parent.convertToNodeSpaceAR(absolutePosition);

        let column: number = relativePos.x / Coords.cellSize.width + Coords.fieldSize.width / 2;
        let row: number = Coords.fieldSize.height / 2 - relativePos.y / Coords.cellSize.height;

        return new Coords(Math.floor(column), Math.floor(row));
    }

    public static getAbsolutePositionFromCoords(coords: Coords): cc.Vec2 {
        let relativeX: number = Coords.cellSize.width * (coords.col - (Coords.fieldSize.width / 2) + 0.5);
        let relativeY: number = Coords.cellSize.height * ((Coords.fieldSize.height / 2) - coords.row - 0.5);
        let relativePos: cc.Vec2 = cc.v2(relativeX, relativeY);

        return Coords.fieldNode.parent.convertToWorldSpaceAR(relativePos);
    }

    public static distance(coords1: Coords, coords2: Coords): number {
        let distanceX: number = Math.abs(coords1.col - coords2.col);
        let distanceY: number = Math.abs(coords1.row - coords2.row);

        return Math.hypot(distanceX, distanceY);
    }
}
