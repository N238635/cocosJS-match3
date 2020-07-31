const {ccclass, property} = cc._decorator;

@ccclass
export default class EndScreen extends cc.Component {

    @property(cc.Label) endText: cc.Label = null;

    @property(cc.Node) continueButton: cc.Node = null;
    @property(cc.Node) background: cc.Node = null;
    @property(cc.Node) window: cc.Node = null;

    public showWin() {
        this.show(true);
    }

    public showLose() {
        this.show(false);
    }

    public hide(): void {
        this.node.active = false;

        this.background.opacity = 0;
        this.window.scale = 0;
    }


    private show(isGameWon: boolean): void {
        this.endText.string = isGameWon ? "Ты выйграл!" : "Ты проиграл";
        
        this.continueButton.active = !isGameWon;
        
        this.node.active = true;

        cc.tween(this.background).to(1, { opacity: 150 }).start();
        cc.tween(this.window).to(0.3, { scale: 1 }).start();
    }
}
