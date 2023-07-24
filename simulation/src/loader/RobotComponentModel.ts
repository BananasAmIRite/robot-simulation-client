import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import ModelLoader from './ModelLoader';
import ModelRenderer from './ModelRenderer';
import { FileLoader } from 'three';

export interface RobotComponentMetadata {
    name: string;
    pivotPoint: Coordinate; // point to pivot about in the space of THIS component
    zeroedRotation: Rotation3d;
    zeroedPosition: Coordinate | RelativeCoordinate; // gives the zero (0, 0, 0) position of the current coordinate space, either relative to the global space or the space of another model
    transformMethod: TransformMethod;
}

export interface Coordinate {
    x: number;
    y: number;
    z: number;
}

export interface Rotation3d {
    x: number;
    y: number;
    z: number;
}

export interface Translation3d {
    x: number;
    y: number;
    z: number;
}

export interface RelativeCoordinate {
    componentName: string;
    componentSpacePosition: Coordinate; // coordinate in the space of the component relative to (NOT current component)
}

export type TransformMethod = 'TRANSLATE_FIRST' | 'ROTATE_FIRST';

/*


*/

export default class RobotComponentModel {
    private loaded: boolean = false;

    private transformMethod!: TransformMethod;

    private model!: GLTF;

    private name!: string;
    private pivotPoint!: Coordinate;
    private zeroedRotation!: Rotation3d;
    private zeroedPosition!: RelativeCoordinate;

    private constructor(private renderer: ModelRenderer, dataJson: string, modelFile: string) {
        // load model
        ModelLoader.GLTFLoader.load(modelFile, (model) => {
            this.model = model;

            // load model metadata
            // import(dataJson, { assert: { type: 'json' } }).then((data) => {
            ModelLoader.FileLoader.load(dataJson, (data) => {
                // console.log(data);
                const json = JSON.parse(data.toString());
                this.loadMetadata(json);
                this.loaded = true;
            });
            // });
        });
    }

    private loadMetadata(data: RobotComponentMetadata) {
        this.name = data.name ?? 'Unnamed Component';
        this.pivotPoint = data.pivotPoint ?? { x: 0, y: 0, z: 0 };
        this.zeroedRotation = data.zeroedRotation ?? { x: 0, y: 0, z: 0 };
        const zp = data.zeroedPosition ?? { x: 0, y: 0, z: 0 };
        this.zeroedPosition =
            'componentName' in zp
                ? zp
                : {
                      componentName: 'world',
                      componentSpacePosition: zp,
                  };
        this.transformMethod = data.transformMethod ?? 'TRANSLATE_FIRST';
    }

    public static loadFromFile(renderer: ModelRenderer, dataJson: string, modelFile: string): RobotComponentModel {
        return new RobotComponentModel(renderer, dataJson, modelFile);
    }

    public getPivotPoint() {
        return this.pivotPoint;
    }

    public getModel(): GLTF {
        return this.model;
    }

    public getZeroedRotation(): Rotation3d {
        return this.zeroedRotation;
    }

    public getTransformMethod(): TransformMethod {
        return this.transformMethod;
    }

    public getZeroedPosition(): RelativeCoordinate {
        return this.zeroedPosition;
    }

    public getName(): string {
        return this.name;
    }

    public isLoaded(): boolean {
        return this.loaded;
    }
}
