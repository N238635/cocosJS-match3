const {ccclass, property} = cc._decorator;

@ccclass
export default class Counter extends cc.Component {

    @property(cc.Label) countLabel: cc.Label = null;

    get count(): number {
        return this._count;
    }

    set count(num: number) {
        this._count = num;
        this.countLabel.string = this._count.toString();
    }

    private _count: number = 0;
}
