import Coords from "./Coords";

const { ccclass, property } = cc._decorator;

export enum tileColorID {
    Yellow,
    Red,
    Blue,
    Purple,
    Green,
    Orange
}

export enum tileType {
    Color,
    Vertical,
    Horizontal,
    Rainbow
}

export const colorsRGB = {
    [tileColorID.Yellow]: [255, 255, 0],
    [tileColorID.Red]: [255, 0, 0],
    [tileColorID.Blue]: [0, 0, 255],
    [tileColorID.Purple]: [128, 0, 128],
    [tileColorID.Green]: [0, 175, 0],
    [tileColorID.Orange]: [225, 165, 0]
};

@ccclass
export default class Tile extends cc.Component {

    @property(cc.Sprite) sprite: cc.Sprite = null;

    @property(cc.SpriteFrame) whiteCircle: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) boosterVertical: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) boosterHorizontal: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) boosterRainbow: cc.SpriteFrame = null;

    public coords: Coords = new Coords();
    public type: tileType = tileType.Color;
    public colorID: tileColorID;

    public select(): void {
        cc.tween(this.node).to(0.1, { scale: 1.2 }).start();
    }

    public unselect(): void {
        cc.tween(this.node).to(0.1, { scale: 1 }).start();
    }

    public convertToRelativePosition(absolutePosition: cc.Vec2): cc.Vec2 {
        return this.node.parent.convertToNodeSpaceAR(absolutePosition);
    }

    public getAbsolutePosition(): cc.Vec2 {
        return this.node.convertToWorldSpaceAR(cc.v2());
    }

    public delete(callback?: () => void): void {
        cc.tween(this.node).to(0.2, { scale: 0 }).call(() => {
            this.node.destroy();
            if (callback) callback();
        }).start();
    }

    public moveTo(moveToCoords: Coords, callback?: () => void): void {
        const absolutePosition: cc.Vec2 = Coords.getAbsolutePositionFromCoords(moveToCoords);
        const targetPosition: cc.Vec2 = this.convertToRelativePosition(absolutePosition);

        const distance: number = Coords.distance(this.coords, moveToCoords);
        const animationTime: number = 0.2;
        const duration: number = animationTime * distance;

        this.coords = moveToCoords;

        cc.tween(this.node).to(duration, { position: targetPosition }).call(() => {
            if (callback) callback();
        }).start();
    }

    protected start(): void {
        this.setSprite();

        if (colorsRGB[this.colorID]) {
            this.sprite.node.color = cc.color(...colorsRGB[this.colorID]);
        }
    }

    private setSprite(): void {
        const spriteFrames = {
            [tileType.Color]: this.whiteCircle,
            [tileType.Vertical]: this.boosterVertical,
            [tileType.Horizontal]: this.boosterHorizontal,
            [tileType.Rainbow]: this.boosterRainbow,
        };

        this.sprite.spriteFrame = spriteFrames[this.type];
    }
}
