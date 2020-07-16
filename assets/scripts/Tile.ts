import Coords from "./Coords";

const { ccclass, property } = cc._decorator;

export enum tileColorID {
    Yellow = 0,
    Red = 1,
    Blue = 2,
    Purple = 3,
    Green = 4,
    Orange = 5
}

export enum tileType {
    Color = 0,
    Vertical = 1,
    Horizontal = 2,
    Rainbow = 3
}

const colorsRGB = {
    0: [255, 255, 0],
    1: [255, 0, 0],
    2: [0, 0, 255],
    3: [128, 0, 128],
    4: [0, 255, 0],
    5: [255, 165, 0]
};

@ccclass
export default class Tile extends cc.Component {

    @property(cc.Sprite) sprite: cc.Sprite = null;
    @property(cc.SpriteFrame) whiteCircle: cc.SpriteFrame = null;

    public coords: Coords = new Coords();

    private _colorID: tileColorID;
    private _type: tileType = tileType.Color;

    public setParent(parent: cc.Node): void {
        this.node.parent = parent;
    }

    public getType(): tileType { return this._type }

    public setType(type: tileType): void {
        this._type = type;
        this.setSprite();
    }

    public getColorID(): tileColorID { return this._colorID }

    public setColorID(colorID: tileColorID): void {
        this._colorID = colorID;

        if (colorsRGB[this._colorID]) {
            this.node.color = cc.color(...colorsRGB[this._colorID]);
        }
    }

    public setPosition(pos: cc.Vec2): void {
        this.node.setPosition(pos);
    }

    public remove() {
        this.node.destroy();
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
