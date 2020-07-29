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
    @property(cc.SpriteFrame) bonusVertical: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) bonusHorizontal: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) bonusRainbow: cc.SpriteFrame = null;

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

    public moveTo(targetCoords: Coords, callback?: () => void): void {
        const absolutePosition: cc.Vec2 = Coords.getAbsolutePositionFromCoords(targetCoords);
        const targetPosition: cc.Vec2 = this.convertToRelativePosition(absolutePosition);

        const distance: number = Coords.distance(this.coords, targetCoords);
        const animationTime: number = 0.2;
        const duration: number = animationTime * distance;

        this.coords = targetCoords;

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
            [tileType.Vertical]: this.bonusVertical,
            [tileType.Horizontal]: this.bonusHorizontal,
            [tileType.Rainbow]: this.bonusRainbow,
        };

        this.sprite.spriteFrame = spriteFrames[this.type];
    }
}
