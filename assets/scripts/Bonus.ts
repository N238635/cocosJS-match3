const {ccclass, property} = cc._decorator;

@ccclass
export default class Bonus extends cc.Component {
    public isActive: boolean = false;

    public use() {
        this.isActive = false;
        this.node.active = false;
    }

    protected onEnable() {
        this.node.on('click', this.onClick, this);
    }

    protected onDisable() {
        this.node.off('click', this.onClick, this);
    }

    private onClick() {
        this.isActive = !this.isActive;
    }
}
