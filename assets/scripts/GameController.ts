import FieldController from "./FieldController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameController extends cc.Component {

    @property(FieldController) field: FieldController = null;

    protected onLoad(): void {
        this.field.initField();

        this.field.generateRandomTiles();
    }
}
