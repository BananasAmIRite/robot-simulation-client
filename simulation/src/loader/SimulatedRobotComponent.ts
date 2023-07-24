import { BufferAttribute, BufferGeometry, Object3D, Points, PointsMaterial, Scene, Vector3 } from 'three';
import ModelSpace, { ArrowCoordinate } from './ModelSpace';
import RobotComponentModel, { Coordinate, Rotation3d, Translation3d } from './RobotComponentModel';
import { asVector3, rotatePointAround } from '../CoordinateUtils';

export default class SimulatedRobotComponent {
    private model: RobotComponentModel;

    private modelSpace!: ModelSpace;

    private modelObject!: Object3D;

    public constructor(private scene: Scene, model: RobotComponentModel) {
        this.model = model;
    }

    public getComponentWorldPosition(): ArrowCoordinate {
        const zeroTransformed = this.modelSpace.CADSpaceToWorldSpace({
            coordinate: { x: 0, y: 0, z: 0 },
            rotation: [{ x: 0, y: 0, z: 0 }],
        });
        // const pivotTransformed = this.modelSpace.CADSpaceToWorldSpace(this.model.getPivotPoint());

        // const rotation = {
        //     x: Math.atan2(zeroTransformed.y - pivotTransformed.y, -(zeroTransformed.z - pivotTransformed.z)),
        //     y: Math.atan2(zeroTransformed.x - pivotTransformed.x, zeroTransformed.z - pivotTransformed.z),
        //     z: Math.atan2(zeroTransformed.y - pivotTransformed.y, -(zeroTransformed.x - pivotTransformed.x)),
        // };

        return zeroTransformed;
    }

    public updatePosition() {
        // console.log(`performing cad to world on mechanism: `, this.getModel().getName());
        const { coordinate, rotation } = this.getComponentWorldPosition();

        // const pivotTransformed = this.modelSpace.CADSpaceToWorldSpace({
        //     coordinate: this.model.getPivotPoint(),
        //     rotation: { x: 0, y: 0, z: 0 },
        // });

        // const coords = pivotTransformed.coordinate;

        this.modelObject.position.set(coordinate.x, coordinate.y, coordinate.z);
        this.modelObject.rotation.set(0, 0, 0);
        for (const rot of rotation) {
            this.modelObject.rotateOnWorldAxis(new Vector3(1, 0, 0), rot.x);
            this.modelObject.rotateOnWorldAxis(new Vector3(0, 1, 0), rot.y);
            this.modelObject.rotateOnWorldAxis(new Vector3(0, 0, 1), rot.z);
        }
        // this.modelObject.rotation.set(rotation.x, rotation.y, rotation.z, 'XYZ');

        // const dotGeometry = new BufferGeometry();
        // dotGeometry.setAttribute('position', new BufferAttribute(new Float32Array([coords.x, coords.y, coords.z]), 3));
        // const dotMaterial = new PointsMaterial({ size: 0.1, color: 0xff0000 });
        // dotMaterial.depthTest = false;
        // const dot = new Points(dotGeometry, dotMaterial);
        // this.scene.add(dot);
    }

    public getModel() {
        return this.model;
    }

    public getModelSpace() {
        return this.modelSpace;
    }

    public setTranslation(coord: Partial<Translation3d>) {
        this.modelSpace.translation.x = coord.x ?? this.modelSpace.translation.x;
        this.modelSpace.translation.y = coord.y ?? this.modelSpace.translation.y;
        this.modelSpace.translation.z = coord.z ?? this.modelSpace.translation.z;
    }

    public setRotation(coord: Partial<Rotation3d>) {
        this.modelSpace.rotation.x = coord.x ?? this.modelSpace.rotation.x;
        this.modelSpace.rotation.y = coord.y ?? this.modelSpace.rotation.y;
        this.modelSpace.rotation.z = coord.z ?? this.modelSpace.rotation.z;
    }

    public getRotation() {
        return this.modelSpace.rotation;
    }

    public getTranslation() {
        return this.modelSpace.translation;
    }

    public loadData() {
        this.modelSpace = new ModelSpace(
            this.model.getPivotPoint(),
            null,
            { x: 0, y: 0, z: 0 },
            { x: 0, y: 0, z: 0 },
            this.model.getZeroedRotation(),
            this.model.getTransformMethod()
        );
        this.scene.add(this.model.getModel().scene);
        this.modelObject = this.model.getModel().scene;
        // console.log(this.modelObject);
    }

    public getScene() {
        return this.modelObject;
    }
}
