import * as THREE from 'three';
import { Coordinate, Rotation3d, Translation3d } from './loader/RobotComponentModel';

export const add = (coord1: Coordinate, coord2: Coordinate | Translation3d): Coordinate => ({
    x: coord1.x + coord2.x,
    y: coord1.y + coord2.y,
    z: coord1.z + coord2.z,
});

export const negative = (coord: Coordinate): Coordinate => ({
    x: -coord.x,
    y: -coord.y,
    z: -coord.z,
});

export const subtract = (coord1: Coordinate, coord2: Coordinate): Translation3d => add(coord1, negative(coord2));

export const asVector3 = (coord: Coordinate | Translation3d): THREE.Vector3 =>
    new THREE.Vector3(coord.x, coord.y, coord.z);

export const asCoordinate = (v: THREE.Vector3): Coordinate => ({
    x: v.x,
    y: v.y,
    z: v.z,
});

export const rotatePointAround = (toRotate: Coordinate, around: Coordinate, rotation: Rotation3d): Coordinate => {
    const diff = asVector3(subtract(toRotate, around));

    return add(asCoordinate(diff.applyEuler(new THREE.Euler(rotation.x, rotation.y, rotation.z, 'XYZ'))), around);
};

// export const addRotation = (r1: Rotation3d, r2: Rotation3d): Rotation3d => {
//     rotationMatrixX(r1.x).
// };

// export const rotationMatrixX = (xTheta: number) =>
//     new THREE.Matrix3().set(1, 0, 0, 0, Math.cos(xTheta), -Math.sin(xTheta), 0, Math.sin(xTheta), Math.cos(xTheta));

// export const rotationMatrixY = (yTheta: number) =>
//     new THREE.Matrix3().set(Math.cos(yTheta), 0, Math.sin(yTheta), 0, 1, 0, -Math.sin(yTheta), 0, Math.cos(yTheta));

// export const rotationMatrixZ = (zTheta: number) =>
//     new THREE.Matrix3().set(Math.cos(zTheta), -Math.sin(zTheta), 0, Math.sin(zTheta), Math.cos(zTheta), 0, 0, 0, 1);
