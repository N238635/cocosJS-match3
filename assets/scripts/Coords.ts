export default class Coords {
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
}
