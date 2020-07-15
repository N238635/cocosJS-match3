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
    Color = 0,
    Vertical = 1,
    Horizontal = 2,
    Rainbow = 3
}

const colorsRGB = {
    0: [255, 255, 255],
    1: [255, 255, 0],
    2: [255, 0, 0],
    3: [0, 0, 255],
    4: [128, 0, 128],
    5: [0, 255, 0],
    6: [255, 165, 0]
};

@ccclass
export default class Tile extends cc.Component {
    
    @property(cc.Sprite) sprite: cc.Sprite = null;
    @property(cc.SpriteFrame) whiteCircle: cc.SpriteFrame = null;

    public coords: Coords = new Coords();

    private _colorID: tileColorID = tileColorID.White;
    private _type: tileType = tileType.Color;

    public setType(type: tileType): void {
        this._type = type;
        this.setSprite();
    }

    public setColorID(colorID: tileColorID): void {
        this._colorID = colorID;
        if (colorsRGB[this._colorID]) {
            this.node.color = cc.color(...colorsRGB[this._colorID]);
        }
    }

    private setSprite(): void {
        const spriteFrames = {
            [tileType.Color]: this.whiteCircle,
        };
        if (spriteFrames[tileType.Color]) {
            this.sprite.spriteFrame = spriteFrames[tileType.Color];
        }
    }
}
