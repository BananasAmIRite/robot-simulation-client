import { add, rotatePointAround, subtract } from '../CoordinateUtils';
import { Coordinate, RelativeCoordinate, Rotation3d, TransformMethod, Translation3d } from './RobotComponentModel';

/*
a model space is a coordinate system for a simulated model
each model space is: 
- zeroed at a coordinate relative to the world's coord system or a coord in the coord system of another model space
- pivoted at a point (usually at the zero location) 
- rotated about that pivot in 3 dimensions
(see RobotComponentModel.ts)


*/

export interface ParentTransformedSpace {
    parentSpace: ModelSpace;
    translation: Translation3d;
}

export interface ArrowCoordinate {
    coordinate: Coordinate;
    rotation: Rotation3d[];
}

export default class ModelSpace {
    private pivotPoint: Coordinate;
    private zeroedRotation: Rotation3d;
    public rotation: Rotation3d;
    public translation: Translation3d;

    private transformMethod: TransformMethod;

    private parent: ParentTransformedSpace | null;

    public constructor(pivotPoint: Coordinate, parent: ParentTransformedSpace | null);
    public constructor(
        pivotPoint: Coordinate,
        parent: ParentTransformedSpace | null,
        rotation: Rotation3d,
        translation: Translation3d,
        zeroedRotation: Rotation3d,
        transformMethod: TransformMethod
    );
    public constructor(
        pivotPoint: Coordinate,
        parent: ParentTransformedSpace | null,
        initialRotation?: Rotation3d,
        initialTranslation?: Translation3d,
        zeroedRotation?: Rotation3d,
        transformMethod?: TransformMethod
    ) {
        this.pivotPoint = pivotPoint;
        this.parent = parent;
        this.rotation = initialRotation ?? { x: 0, y: 0, z: 0 };
        this.translation = initialTranslation ?? { x: 0, y: 0, z: 0 };
        this.zeroedRotation = zeroedRotation ?? { x: 0, y: 0, z: 0 };

        this.transformMethod = transformMethod ?? 'TRANSLATE_FIRST';
    }

    public CADSpaceToModelSpace(coords: ArrowCoordinate): ArrowCoordinate {
        const translated = subtract(coords.coordinate, this.pivotPoint);

        // console.log('trans: ', translated, {
        //     x: -this.zeroedRotation.x,
        //     y: -this.zeroedRotation.y,
        //     z: -this.zeroedRotation.z,
        // });

        return {
            coordinate: rotatePointAround(
                translated,
                { x: 0, y: 0, z: 0 },
                { x: -this.zeroedRotation.x, y: -this.zeroedRotation.y, z: -this.zeroedRotation.z }
            ),
            rotation: [
                ...coords.rotation,
                {
                    x: -this.zeroedRotation.x,
                    y: -this.zeroedRotation.y,
                    z: -this.zeroedRotation.z,
                },
            ],
        };
    }

    public modelSpaceToSimulationSpace(coords: ArrowCoordinate): ArrowCoordinate {
        // console.log(
        //     `obj - `,
        //     this,
        //     `model -> sim: coords - `,
        //     coords,
        //     `rotation - `,
        //     this.rotation,
        //     `translation - `,
        //     this.translation
        // );

        if (this.transformMethod === 'TRANSLATE_FIRST') {
            return {
                coordinate: add(
                    rotatePointAround(coords.coordinate, { x: 0, y: 0, z: 0 }, this.rotation),
                    this.translation
                ),
                rotation: [...coords.rotation, this.rotation],
            };
        } else {
            // console.log(
            //     'perf rot first',
            //     rotatePointAround(coords.coordinate, { x: 0, y: 0, z: 0 }, this.rotation),
            //     rotatePointAround(this.translation, { x: 0, y: 0, z: 0 }, this.rotation)
            // );
            return {
                coordinate: add(
                    rotatePointAround(coords.coordinate, { x: 0, y: 0, z: 0 }, this.rotation),
                    rotatePointAround(this.translation, { x: 0, y: 0, z: 0 }, this.rotation)
                ),
                rotation: [...coords.rotation, this.rotation],
            };
        }
    }

    public simulationSpaceInParentCADSpace(coords: ArrowCoordinate): ArrowCoordinate {
        if (this.parent === null) return coords;
        return {
            coordinate: add(coords.coordinate, this.parent.translation),
            rotation: coords.rotation,
        };
    }

    public CADSpaceToWorldSpace(coords: ArrowCoordinate): ArrowCoordinate {
        let currentCoordinates = coords;
        let currentSpace: ModelSpace = this;

        while (true) {
            // if (currentSpace.getParentSpace() === null) {
            //     console.log(
            //         'current coords: ',
            //         currentCoordinates,
            //         currentSpace.CADSpaceToModelSpace(coords),
            //         currentSpace.modelSpaceToSimulationSpace(currentSpace.CADSpaceToModelSpace(coords)),
            //         currentSpace.simulationSpaceInParentCADSpace(
            //             currentSpace.modelSpaceToSimulationSpace(currentSpace.CADSpaceToModelSpace(coords))
            //         )
            //     );
            // }
            currentCoordinates = currentSpace.simulationSpaceInParentCADSpace(
                currentSpace.modelSpaceToSimulationSpace(currentSpace.CADSpaceToModelSpace(currentCoordinates))
            );
            // if (currentSpace.getParentSpace() === null) console.log('new coords: ', currentCoordinates);
            // console.log(currentSpace, currentCoordinates);
            const space = currentSpace.getParentSpace();
            if (space === null) return currentCoordinates;
            currentSpace = space;
        }
    }

    public isWorldSpace(): boolean {
        return this.parent === null;
    }

    public getParentSpace(): ModelSpace | null {
        return this.parent?.parentSpace ?? null;
    }

    public setParentSpace(space: ModelSpace, translation: Translation3d) {
        this.parent = {
            parentSpace: space,
            translation: translation,
        };
    }
}
