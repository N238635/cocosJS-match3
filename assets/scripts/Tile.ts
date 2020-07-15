import Coords from "./Coords";
const {ccclass, property} = cc._decorator;

export enum tileColorID {
    White = 0,
    Yellow = 1,
    Red = 2, 
    Blue = 3, 
    Purple = 4, 
    Green = 5, 
    Orange = 6
}

export enum tileType {
    Gem = 0,
    Vertical = 1,
    Horizontal = 2,
    Rainbow = 3
}

const colors = {
    0: [255, 255, 255],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: []
};

@ccclass
export default class Tile extends cc.Component {
    
    @property(cc.Sprite) sprite: cc.Sprite = null;
    @property(cc.SpriteFrame) whiteCircle: cc.SpriteFrame = null;

    get coords(): Coords { return this._coords }
    set coords(coords: Coords) { this._coords = coords }

    private _coords: Coords = new Coords();
    private _colorID: tileColorID = tileColorID.White;
    private _type: tileType = tileType.Gem;

    public setType(type: tileType): void {
        this._type = type;
        this.setSprite();
    }

    public setColorID(colorID: tileColorID): void {
        this._colorID = colorID;
        this.setColor();
    }

    private setSprite(): void {
        switch (this._type) {
            case 0:
                this.sprite.spriteFrame = this.whiteCircle;
                break;
        }
    }

    private setColor(): void {
        if (colors[this._colorID]) {
            this.node.color = cc.color(...colors[this._colorID]);
        }
    }
}
