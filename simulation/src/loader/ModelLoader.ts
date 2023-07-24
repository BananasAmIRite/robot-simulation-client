import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import RobotComponentModel from './RobotComponentModel';
import ModelRenderer from './ModelRenderer';
import { FileLoader } from 'three';

export default class ModelLoader {
    public static GLTFLoader: GLTFLoader = new GLTFLoader();
    public static FileLoader: FileLoader = new FileLoader();
    public loadModel(renderer: ModelRenderer, dataJson: string, modelFile: string): RobotComponentModel {
        return RobotComponentModel.loadFromFile(renderer, dataJson, modelFile);
    }
}
