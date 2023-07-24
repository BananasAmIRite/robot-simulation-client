import { Scene } from 'three';
import ModelLoader from './ModelLoader';
import SimulatedRobotComponent from './SimulatedRobotComponent';
import ModelSpace from './ModelSpace';
import RobotComponentModel from './RobotComponentModel';

export default class ModelRenderer {
    private loader: ModelLoader = new ModelLoader();

    private models: RobotComponentModel[] = [];

    private components: Map<string, SimulatedRobotComponent> = new Map();

    private worldModelSpace: ModelSpace = new ModelSpace({ x: 0, y: 0, z: 0 }, null);

    private firstLoaded: boolean = false;

    public constructor(private scene: Scene) {}

    public loadModelFromFile(dataJson: string, modelFile: string) {
        const model = this.loader.loadModel(this, dataJson, modelFile);
        this.models.push(model);
    }

    public render() {
        if (!this.firstLoaded) {
            if (!this.isAllLoaded()) return;
            this.makeComponents();
            this.setParents();
            this.firstLoaded = true;
        }

        for (const [name, model] of this.components) {
            model.updatePosition();
        }
    }

    public getModelByName(name: string) {
        return this.getComponentByName(name)?.getModel();
    }

    public getComponentByName(name: string) {
        return this.components.get(name);
    }

    private isAllLoaded(): boolean {
        for (const model of this.models) {
            if (!model.isLoaded()) return false;
            console.log(model.getName() + ' loaded');
        }
        return true;
    }

    private makeComponents() {
        for (const model of this.models) {
            const comp = new SimulatedRobotComponent(this.scene, model);
            comp.loadData();
            this.components.set(model.getName(), comp);
        }
    }

    private setParents() {
        for (const [name, model] of this.components) {
            const parentString = model.getModel().getZeroedPosition().componentName;
            if (parentString === 'world')
                model
                    .getModelSpace()
                    .setParentSpace(this.worldModelSpace, model.getModel().getZeroedPosition().componentSpacePosition);
            else {
                const comp = this.getComponentByName(parentString);
                if (comp)
                    model
                        .getModelSpace()
                        .setParentSpace(
                            comp.getModelSpace(),
                            model.getModel().getZeroedPosition().componentSpacePosition
                        );
            }
        }
    }
}
