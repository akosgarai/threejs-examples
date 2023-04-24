import { assert } from 'chai';
import { Euler, Group, Vector3 } from 'three';

import { SpaceTruck, Navigation } from '../src/meshes/groups/SpaceTruck.js';

const MAX_DELTA = 0.000001;

function createNavigation() {
    const group = new Group();
    group.name = 'test';
    const burst = new Group();
    burst.name = 'burst';
    burst.visible = false;
    group.add(burst);
    return new Navigation(group);
}
function checkNavigation(
    navigation,
    expectedBurstTimer,
    expectedState,
    expectedVelocity,
    expectedVelocityDirection,
    expectedPosition,
    expectedBurstVisible
) {
    const currentNavigation = Object.assign({}, navigation);
    const currentBurst = currentNavigation.group.getObjectByName('burst').clone();
    const currentGroup = currentNavigation.group.clone();
    // check the current state
    it('should set the burstTimer to ' + expectedBurstTimer, () => {
        assert.equal(currentNavigation.burstTimer, expectedBurstTimer);
    });
    it('should be in the ' + expectedState + ' state', () => {
        assert.equal(currentNavigation.state, expectedState);
    });
    it('should set the Burst visibility', () => {
        assert.equal(currentBurst.visible, expectedBurstVisible);
    });
    it('should set the velocity to ' + expectedVelocity, () => {
        assert.closeTo(currentNavigation.velocity, expectedVelocity, MAX_DELTA);
    });
    it('should set the velocityDirection', () => {
        assert.closeTo(currentNavigation.velocityDirection, expectedVelocityDirection, MAX_DELTA);
    });
    it('should set the position of the group', () => {
        assert.closeTo(currentGroup.position.x, expectedPosition.x, MAX_DELTA);
        assert.closeTo(currentGroup.position.y, expectedPosition.y, MAX_DELTA);
        assert.closeTo(currentGroup.position.z, expectedPosition.z, MAX_DELTA);
    });
}
function testCaseVelocityDirectionUnitVector(directionRadians, expectedUnitVector) {
    const vectorDisplay = '(' + expectedUnitVector.x + ', ' + expectedUnitVector.y + ', ' + expectedUnitVector.z + ')';
    const angleDisplay = directionRadians + ' radians / ' + (directionRadians * 180 / Math.PI) + ' degrees';
    it('should be ' + vectorDisplay + ' if the velocityDirection is ' + angleDisplay, () => {
        const navigation = createNavigation();
        navigation.velocityDirection = directionRadians;
        const unitVector = navigation.velocityDirectionUnitVector();
        assert.closeTo(unitVector.x, expectedUnitVector.x, MAX_DELTA);
        assert.closeTo(unitVector.y, expectedUnitVector.y, MAX_DELTA);
        assert.closeTo(unitVector.z, expectedUnitVector.z, MAX_DELTA);
    });
}
function testCaseBurstFlowWithInitialRotation(directionRad, expectedPositions) {
    const angleDisplay = directionRad + ' radians / ' + (directionRad * 180 / Math.PI) + ' degrees';
    describe('Burst flow with ' + angleDisplay + ' initial rotation', () => {
        const navigation = createNavigation();
        navigation.group.rotation.z = directionRad;
        const initialBurstTime = 1;
        const burstStep = navigation.burstDuration / 2;
        navigation.setState('burst');
        describe('Start Burst', () => {
            navigation.update(initialBurstTime);
            // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
            checkNavigation(navigation, initialBurstTime, 'burst', 1, directionRad, expectedPositions[0], true);
        });
        describe('Halftime', () => {
            navigation.update(initialBurstTime + burstStep);
            // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
            checkNavigation(navigation, initialBurstTime, 'burst', 1, directionRad, expectedPositions[1], true);
        });
        describe('Stop Burst', () => {
            navigation.update(initialBurstTime + 2 * burstStep);
            // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
            checkNavigation(navigation, 0, 'idle', 1, directionRad, expectedPositions[2], false);
        });
        describe('Start Burst again', () => {
            navigation.setState('burst');
            navigation.update(initialBurstTime);
            // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
            checkNavigation(navigation, initialBurstTime, 'burst', 2, directionRad, expectedPositions[3], true);
        });
    });
}
function testCaseMoveForwardThenRotate(originalDirectionDeg, rotationDirectionDeg, initialVelocity, expectedValues) {
    const originalDirectionLabel = originalDirectionDeg + ' degrees';
    const rotationDirectionLabel = rotationDirectionDeg + ' degrees';

    describe('Move to ' + originalDirectionLabel + ' with ' + initialVelocity + ' velocity, then rotate with ' + rotationDirectionLabel + ' and burst', () => {
        const navigation = createNavigation();
        const initialBurstTime = 1;
        const burstStep = navigation.burstDuration / 2;
        const originalRotationRad = originalDirectionDeg * Math.PI / 180;
        const newRotationRad = rotationDirectionDeg * Math.PI / 180;
        const rotatedRad = (originalRotationRad + newRotationRad) % (2 * Math.PI);
        navigation.velocity = initialVelocity;
        describe('Rotate to ' + originalDirectionLabel, () => {
            navigation.setState('rotatingLeft');
            navigation.rotateWith(originalDirectionDeg);
            assert.closeTo(navigation.group.rotation.z, originalRotationRad, MAX_DELTA);
            navigation.velocityDirection = originalRotationRad;
            // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
            checkNavigation(navigation, 0, 'idle', initialVelocity, originalRotationRad, new Vector3(0, 0, 0), false);
        });
        describe('Move to original direction', () => {
            // we are not bursting, so that the time is not important
            navigation.update(0);
            checkNavigation(navigation, 0, 'idle', expectedValues[0].vel, expectedValues[0].rot, expectedValues[0].position, false);
        });
        describe('Move forward again', () => {
            // we are not bursting, so that the time is not important
            navigation.update(0);
            // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
            checkNavigation(navigation, 0, 'idle', expectedValues[1].vel, expectedValues[1].rot, expectedValues[1].position, false);
        });
        describe('Rotate with '+rotationDirectionLabel, () => {
            navigation.setState('rotatingLeft');
            navigation.rotateWith(rotationDirectionDeg);
            assert.closeTo(navigation.group.rotation.z, rotatedRad, MAX_DELTA);
            // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
            checkNavigation(navigation, 0, 'idle', expectedValues[2].vel, expectedValues[2].rot, expectedValues[2].position, false);
        });
        describe('Burst start', () => {
            navigation.setState('burst');
            navigation.update(initialBurstTime);
            checkNavigation(navigation, initialBurstTime, 'burst', expectedValues[3].vel, expectedValues[3].rot, expectedValues[3].position, true);
        });
        describe('Burst middle', () => {
            navigation.update(initialBurstTime + burstStep);
            checkNavigation(navigation, initialBurstTime, 'burst', expectedValues[4].vel, expectedValues[4].rot, expectedValues[4].position, true);
        });
        describe('Burst stop', () => {
            navigation.update(initialBurstTime + 2 * burstStep);
            checkNavigation(navigation, 0, 'idle', expectedValues[5].vel, expectedValues[5].rot, expectedValues[5].position, false);
        });
        describe('Start Burst again', () => {
            navigation.setState('burst');
            navigation.update(initialBurstTime);
            // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
            checkNavigation(navigation, initialBurstTime, 'burst', expectedValues[6].vel, expectedValues[6].rot, expectedValues[6].position, true);
        });
    });
}
describe('Navigation', () => {
    describe('constructor', () => {
        it('should have set the default values', () => {
            const navigation = createNavigation();
            assert.equal(navigation.state, 'idle');
            assert.equal(navigation.engineBurstAmount, 1);
            assert.equal(navigation.engineRotationAmount, 1);
            assert.equal(navigation.burstDuration, 1000);
            assert.equal(navigation.burstTimer, 0);
            assert.equal(navigation.velocity, 0);
            assert.equal(navigation.velocityDirection, 0);
        });
    });
    describe('Rotation', () => {
        describe('Rotates only in the rotation states', () => {
            const navigation = createNavigation();
            it('should not rotate in idle state', () => {
                const originalRotation = navigation.group.rotation;
                const originalState = navigation.state;
                navigation.rotateLeft();
                assert.equal(navigation.group.rotation, originalRotation);
                assert.equal(navigation.state, originalState);
                navigation.rotateRight();
                assert.equal(navigation.group.rotation, originalRotation);
                assert.equal(navigation.state, originalState);
            });
            it('should not rotate in burst state', () => {
                const originalRotation = navigation.group.rotation;
                navigation.state = 'burst';
                const originalState = navigation.state;
                navigation.rotateLeft();
                assert.equal(navigation.group.rotation, originalRotation);
                assert.equal(navigation.state, originalState);
                navigation.rotateRight();
                assert.equal(navigation.group.rotation, originalRotation);
                assert.equal(navigation.state, originalState);
            });
            it('should rotate in rotateLeft state', () => {
                const originalRotation = navigation.group.rotation.clone();
                navigation.state = 'rotatingLeft';
                navigation.rotateLeft();
                assert.notEqual(navigation.group.rotation, originalRotation);
                assert.equal(navigation.state, 'idle');
                navigation.group.rotation.x = originalRotation.x;
                navigation.group.rotation.y = originalRotation.y;
                navigation.group.rotation.z = originalRotation.z;
                navigation.state = 'rotatingLeft';
                navigation.rotateRight();
                assert.notEqual(navigation.group.rotation, originalRotation);
                assert.equal(navigation.state, 'idle');
            });
            it('should rotate in rotateRight state', () => {
                const originalRotation = navigation.group.rotation.clone();
                navigation.state = 'rotatingRight';
                navigation.rotateLeft();
                assert.notEqual(navigation.group.rotation, originalRotation);
                assert.equal(navigation.state, 'idle');
                navigation.group.rotation.x = originalRotation.x;
                navigation.group.rotation.y = originalRotation.y;
                navigation.group.rotation.z = originalRotation.z;
                navigation.state = 'rotatingRight';
                navigation.rotateRight();
                assert.notEqual(navigation.group.rotation, originalRotation);
                assert.equal(navigation.state, 'idle');
            });
        });
        describe('RotateLeft', () => {
            const navigation = createNavigation();
            const initialRotationComponent = 0;
            navigation.rotationAngleDegree = initialRotationComponent;
            it('should be incremented in 180 iteration', () => {
                for (let i = 0; i < 180; i++) {
                    const expected = navigation.engineRotationAmount * (i + 1) * Math.PI / 180;
                    navigation.state = 'rotatingLeft';
                    navigation.rotateLeft();
                    assert.closeTo(navigation.group.rotation.z, expected, MAX_DELTA, 'Iteration ' + i);
                    assert.equal(navigation.state, 'idle');
                    assert.equal(navigation.rotationAngleDegree, i + 1);
                }
            });
            it('should be decreased by 360 if the rotation is more than 360', () => {
                navigation.rotationAngleDegree = 359;
                navigation.state = 'rotatingLeft';
                const expected = 0;
                navigation.rotateLeft();
                assert.closeTo(navigation.group.rotation.z, expected, MAX_DELTA);
            });
        });
        describe('RotateRight', () => {
            const navigation = createNavigation();
            const initialRotationComponent = 0;
            navigation.rotationAngleDegree = initialRotationComponent;
            it('should be decremented in 180 iteration', () => {
                for (let i = 0; i < 180; i++) {
                    const expected = 2 * Math.PI - navigation.engineRotationAmount * (i + 1) * Math.PI / 180;
                    navigation.state = 'rotatingRight';
                    navigation.rotateRight();
                    assert.closeTo(navigation.group.rotation.z, expected, MAX_DELTA, 'Iteration ' + i);
                    assert.equal(navigation.state, 'idle');
                    assert.equal(navigation.rotationAngleDegree, 360 - (i + 1));
                }
            });
            it('should be increased by 360 if the rotation is less than 0', () => {
                navigation.rotationAngleDegree = 0;
                navigation.state = 'rotatingRight';
                const expected = 2*Math.PI - (navigation.engineRotationAmount * Math.PI / 180);
                navigation.rotateRight();
                assert.closeTo(navigation.group.rotation.z, expected, MAX_DELTA);
                assert.equal(navigation.rotationAngleDegree, 359);
            });
        });
        describe('Rotate both direction with the correct steps', () => {
            const navigation = createNavigation();
            const initialRotationComponent = 0;
            navigation.group.rotation.z = initialRotationComponent;
            it('should be incremented in 180 iteration', () => {
                for (let i = 0; i < 180; i++) {
                    const expected = navigation.engineRotationAmount * (i + 1) * Math.PI / 180;
                    navigation.state = 'rotatingLeft';
                    navigation.rotateLeft();
                    assert.closeTo(navigation.group.rotation.z, expected, MAX_DELTA, 'Iteration ' + i);
                    assert.equal(navigation.state, 'idle');
                }
            });
            it('should be decremented in 180 iteration', () => {
                for (let i = 0; i < 180; i++) {
                    const expected = Math.PI + (-navigation.engineRotationAmount * (i + 1) * Math.PI / 180);
                    navigation.state = 'rotatingRight';
                    navigation.rotateRight();
                    // to fixed makes the -0.0 different from 0.0.
                    assert.closeTo(navigation.group.rotation.z, expected, MAX_DELTA, 'Iteration ' + i);
                    assert.equal(navigation.state, 'idle');
                }
            });
        });
    });
    describe('velocityDirectionUnitVector', () => {
        const testData = [
            { 'directionRad': 0, 'expected': { 'x': 0, 'y': 1, 'z': 0 } },
            { 'directionRad': -(Math.PI / 2), 'expected': { 'x': 1, 'y': 0, 'z': 0 } },
            { 'directionRad': -Math.PI, 'expected': { 'x': 0, 'y': -1, 'z': 0 } },
            { 'directionRad': Math.PI, 'expected': { 'x': 0, 'y': -1, 'z': 0 } },
            { 'directionRad': Math.PI / 2, 'expected': { 'x': -1, 'y': 0, 'z': 0 } },
        ]
        testData.forEach((data) => {
            testCaseVelocityDirectionUnitVector(data.directionRad, data.expected);
        });
    });
    describe('SetState', () => {
        const navigation = createNavigation();
        describe('Idle', () => {
            it('should be able to step to any state', () => {
                const states = ['idle', 'rotatingLeft', 'rotatingRight', 'burst'];
                states.forEach(state => {
                    navigation.state = 'idle';
                    navigation.setState(state);
                    assert.equal(navigation.state, state);
                });
            });
        });
        describe('RotatingLeft', () => {
            it('should be able to step to idle', () => {
                navigation.state = 'rotatingLeft';
                navigation.setState('idle');
                assert.equal(navigation.state, 'idle');
            });
            it('should not be able to step to other states', () => {
                const states = [ 'rotatingRight', 'burst'];
                states.forEach(state => {
                    navigation.state = 'rotatingLeft';
                    navigation.setState(state);
                    assert.equal(navigation.state, 'rotatingLeft');
                });
            });
        });
        describe('RotatingRight', () => {
            it('should be able to step to idle', () => {
                navigation.state = 'rotatingRight';
                navigation.setState('idle');
                assert.equal(navigation.state, 'idle');
            });
            it('should not be able to step to other states', () => {
                const states = [ 'rotatingLeft', 'burst'];
                states.forEach(state => {
                    navigation.state = 'rotatingRight';
                    navigation.setState(state);
                    assert.equal(navigation.state, 'rotatingRight');
                });
            });
        });
        describe('Burst', () => {
            it('should be able to step to idle', () => {
                navigation.state = 'burst';
                navigation.setState('idle');
                assert.equal(navigation.state, 'idle');
            });
            it('should not be able to step to other states', () => {
                const states = [ 'rotatingLeft', 'rotatingRight'];
                states.forEach(state => {
                    navigation.state = 'burst';
                    navigation.setState(state);
                    assert.equal(navigation.state, 'burst');
                });
            });
        });
    });
    describe('changeVelocityWithBurstAmount', () => {
        const testData = [
            {
                'angle': 0,
                'initialVelocity': 1,
                'initialVelocityDirection': 0,
                'expectedVelocity': 2,
                'expectedVelocityDirection': 0,
                'expectedVelocityStep': { 'x': 0, 'y': 1, 'z': 0 },
                'expectedBurstStep': { 'x': 0, 'y': 1, 'z': 0 },
            },
            {
                'angle': 90,
                'initialVelocity': 1,
                'initialVelocityDirection': Math.PI / 2 ,
                'expectedVelocity': 2,
                'expectedVelocityDirection': Math.PI / 2 ,
                'expectedVelocityStep': { 'x': -1, 'y': 0, 'z': 0 },
                'expectedBurstStep': { 'x': -1, 'y': 0, 'z': 0 },
            },
            {
                'angle': 180,
                'initialVelocity': 1,
                'initialVelocityDirection': Math.PI ,
                'expectedVelocity': 2,
                'expectedVelocityDirection': Math.PI ,
                'expectedVelocityStep': { 'x': 0, 'y': -1, 'z': 0 },
                'expectedBurstStep': { 'x': 0, 'y': -1, 'z': 0 },
            },
            {
                'angle': -180,
                'initialVelocity': 1,
                'initialVelocityDirection': Math.PI ,
                'expectedVelocity': 2,
                'expectedVelocityDirection': Math.PI ,
                'expectedVelocityStep': { 'x': 0, 'y': -1, 'z': 0 },
                'expectedBurstStep': { 'x': 0, 'y': -1, 'z': 0 },
            },
            {
                'angle': -90,
                'initialVelocity': 1,
                'initialVelocityDirection': 3 * Math.PI / 2 ,
                'expectedVelocity': 2,
                'expectedVelocityDirection': 3 * Math.PI / 2 ,
                'expectedVelocityStep': { 'x': 1, 'y': 0, 'z': 0 },
                'expectedBurstStep': { 'x': 1, 'y': 0, 'z': 0 },
            },
            {
                'angle': 90,
                'initialVelocity': Math.sqrt(2),
                'initialVelocityDirection': Math.PI / 4 ,
                'expectedVelocity': Math.sqrt(5),
                'expectedVelocityDirection': Math.atan2(1, -2) - Math.PI/2 ,
                'expectedVelocityStep': { 'x': -1, 'y': 1, 'z': 0 },
                'expectedBurstStep': { 'x': -1, 'y': 0, 'z': 0 },
            },
        ]
        testData.forEach((data) => {
            describe('Calculation with ' + data.angle + ' angle ' + data.initialVelocity + ' velocity ' + data.initialVelocityDirection*180/Math.PI + ' direction', () => {
                const navigation = createNavigation();
                navigation.velocity = data.initialVelocity;
                navigation.velocityDirection = data.initialVelocityDirection;
                navigation.setState('rotatingLeft');
                navigation.rotateWith(data.angle);
                const currentStep = navigation.spaceshipVelocityStep();
                it('should calculate velocity step well', () => {
                    assert.closeTo(currentStep.x, data.expectedVelocityStep.x, MAX_DELTA);
                    assert.closeTo(currentStep.y, data.expectedVelocityStep.y, MAX_DELTA);
                    assert.closeTo(currentStep.z, data.expectedVelocityStep.z, MAX_DELTA);
                });
                const currentBurstStep = navigation.spaceshipBurstStep();
                it('should calculate burst step well', () => {
                    assert.closeTo(currentBurstStep.x, data.expectedBurstStep.x, MAX_DELTA);
                    assert.closeTo(currentBurstStep.y, data.expectedBurstStep.y, MAX_DELTA);
                    assert.closeTo(currentBurstStep.z, data.expectedBurstStep.z, MAX_DELTA);
                });
                it('should calculate velocity direction custom well', () => {
                    const addedStep = currentStep.clone().add(currentBurstStep.clone());
                    const expectedAdded = new Vector3(
                        data.expectedVelocityStep.x + data.expectedBurstStep.x,
                        data.expectedVelocityStep.y + data.expectedBurstStep.y,
                        data.expectedVelocityStep.z + data.expectedBurstStep.z
                    );
                    assert.closeTo(addedStep.x, expectedAdded.x, MAX_DELTA);
                    assert.closeTo(addedStep.y, expectedAdded.y, MAX_DELTA);
                    assert.closeTo(addedStep.z, expectedAdded.z, MAX_DELTA);
                    // calculate the rotation angle of the added step on the xy plane
                    let addedStepAngle = Math.atan2(addedStep.y, addedStep.x) - Math.PI/2;
                    if (addedStepAngle < 0) {
                        addedStepAngle += 2*Math.PI;
                    }
                    assert.closeTo(addedStepAngle*180/Math.PI, data.expectedVelocityDirection*180/Math.PI, MAX_DELTA, 'Invalid angle');

                    //let expectation = ((new Vector3(addedStep.x, addedStep.y, 0)).normalize()).angleTo((new Vector3(currentStep.x, currentStep.y, 0)).normalize());
                });
                it('should update well', () => {
                    navigation.changeVelocityWithBurstAmount();
                    assert.equal(navigation.velocity, data.expectedVelocity);
                    assert.closeTo(navigation.velocityDirection, data.expectedVelocityDirection, MAX_DELTA);
                });
            });
        });
    });
    describe('Burst', () => {
        const testData = [
            { 'initRot': 0, 'initVel': 0, 'initVelDir': 0, 'expectedRot': 0, 'expectedVel': 1 },
            //{ 'initRot': 0, 'initVel': 1, 'initVelDir': 0, 'expectedRot': 0, 'expectedVel': 2 },
        ];
        testData.forEach((data) => {
            const navigation = createNavigation();
            const burstStep = navigation.burstDuration / 2;
            const initialBurstTime = 10;
            describe('Burst flow with '+data.initRot+' deg rotation, '+data.initVel+' velocity, '+data.initVelDir+' deg direction', () => {
                it('should set the initial state well', () => {
                    navigation.setState('rotateLeft');
                    navigation.rotateWith(data.initRot);
                    navigation.velocity = data.initVel;
                    navigation.velocityDirection = data.initVelDir*Math.PI/180;
                    assert.equal(navigation.state, 'idle');
                    assert.closeTo(navigation.group.rotation.z, data.initRot*Math.PI/180, MAX_DELTA);
                });
                describe('Burst with '+initialBurstTime+' burst time', () => {
                    navigation.burst(initialBurstTime);
                    // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                    checkNavigation(navigation, initialBurstTime, 'burst', data.expectedVel, data.expectedRot, new Vector3(0, 0, 0), true);
                });
                describe('Burst middle state', () => {
                    navigation.burst(initialBurstTime + burstStep);
                    checkNavigation(navigation, initialBurstTime, 'burst', data.expectedVel, data.expectedRot, new Vector3(0, 0, 0), true);
                });
                describe('Burst stopped state', () => {
                    navigation.burst(initialBurstTime + 2 * burstStep);
                    checkNavigation(navigation, 0, 'idle', data.expectedVel, data.expectedRot, new Vector3(0, 0, 0), false);
                });
            });
        });
    });
    describe('Update', () => {
        // Burst state then update.
        const navigation = createNavigation();
        const burstStep = navigation.burstDuration / 2;
        const initialBurstTime = 10;
        const testDataBurstWithInitialDirection = [
            { 'directionRad': 0, 'positions': [{ 'x': 0, 'y': 1, 'z': 0 },{ 'x': 0, 'y': 2, 'z': 0 },{ 'x': 0, 'y': 3, 'z': 0 },{ 'x': 0, 'y': 5, 'z': 0 }] },
            { 'directionRad': 3 * Math.PI / 2, 'positions': [{ 'x': 1, 'y': 0, 'z': 0 },{ 'x': 2, 'y': 0, 'z': 0 },{ 'x': 3, 'y': 0, 'z': 0 },{ 'x': 5, 'y': 0, 'z': 0 }] },
            { 'directionRad': Math.PI, 'positions': [{ 'x': 0, 'y': -1, 'z': 0 },{ 'x': 0, 'y': -2, 'z': 0 },{ 'x': 0, 'y': -3, 'z': 0 },{ 'x': 0, 'y': -5, 'z': 0 }] },
            { 'directionRad': Math.PI / 2, 'positions': [{ 'x': -1, 'y': 0, 'z': 0 },{ 'x': -2, 'y': 0, 'z': 0 },{ 'x': -3, 'y': 0, 'z': 0 },{ 'x': -5, 'y': 0, 'z': 0 }] },
        ];
        testDataBurstWithInitialDirection.forEach((data) => {
            testCaseBurstFlowWithInitialRotation(data.directionRad, data.positions);
        });
        const testDataForwardRotateBurst = [
            {
                'rotationDeg': 90,
                'originalRotationRad': 0,
                'initialVelocity': 1,
                'expected': [
                    { 'position': { 'x': 0, 'y': 1, 'z': 0 }, 'rot': 0, 'vel': 1, },
                    { 'position': { 'x': 0, 'y': 2, 'z': 0 }, 'rot': 0, 'vel': 1, },
                    { 'position': { 'x': 0, 'y': 2, 'z': 0 }, 'rot': 0, 'vel': 1, },
                    { 'position': { 'x': -1, 'y': 3, 'z': 0 }, 'rot': Math.PI / 4, 'vel': Math.sqrt(2), },
                    { 'position': { 'x': -2, 'y': 4, 'z': 0 }, 'rot': Math.PI / 4, 'vel': Math.sqrt(2), },
                    { 'position': { 'x': -3, 'y': 5, 'z': 0 }, 'rot': Math.PI / 4, 'vel': Math.sqrt(2), },
                    { 'position': { 'x': -5, 'y': 6, 'z': 0 }, 'rot': Math.PI / 3, 'vel': Math.sqrt(5), },
                ],
            },
        ];
        testDataForwardRotateBurst.forEach((data) => {
           // testCaseMoveForwardThenRotate(data.originalRotationRad, data.rotationDeg, data.initialVelocity, data.expected);
        });
        describe('Burst multiple time with 0 deg rotation', () => {
            navigation.group.position.x = 0;
            navigation.group.position.y = 0;
            navigation.group.position.z = 0;
            navigation.velocity = 1;
            navigation.group.rotation.x = 0;
            navigation.group.rotation.y = 0;
            navigation.group.rotation.z = 0;
            navigation.burstTimer = 0;
            navigation.velocityDirection = 0;
            describe('Burst first time', () => {
                navigation.setState('burst');
                // we are not bursting, so that the time is not important
                navigation.update(initialBurstTime);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, initialBurstTime, 'burst', 2, 0, new Vector3(0, 2, 0), true);
                navigation.update(initialBurstTime + burstStep);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, initialBurstTime, 'burst', 2, 0, new Vector3(0, 4, 0), true);
                navigation.update(initialBurstTime + 2 * burstStep);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, 0, 'idle', 2, 0, new Vector3(0, 6, 0), false);
            });
            describe('Burst Second time', () => {
                navigation.setState('burst');
                // we are not bursting, so that the time is not important
                navigation.update(initialBurstTime);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, initialBurstTime, 'burst', 3, 0, new Vector3(0, 9, 0), true);
                navigation.update(initialBurstTime + burstStep);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, initialBurstTime, 'burst', 3, 0, new Vector3(0, 12, 0), true);
                navigation.update(initialBurstTime + 2 * burstStep);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, 0, 'idle', 3, 0, new Vector3(0, 15, 0), false);
            });
        });
        describe('Burst multiple time with 90 deg rotation', () => {
            navigation.group.position.x = 0;
            navigation.group.position.y = 0;
            navigation.group.position.z = 0;
            navigation.velocity = 1;
            navigation.group.rotation.x = 0;
            navigation.group.rotation.y = 0;
            navigation.group.rotation.z = Math.PI / 2;
            navigation.burstTimer = 0;
            navigation.velocityDirection = Math.PI / 2;
            describe('Burst first time', () => {
                navigation.setState('burst');
                // we are not bursting, so that the time is not important
                navigation.update(initialBurstTime);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, initialBurstTime, 'burst', 2, Math.PI / 2, new Vector3(-2, 0, 0), true);
                navigation.update(initialBurstTime + burstStep);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, initialBurstTime, 'burst', 2, Math.PI / 2, new Vector3(-4, 0, 0), true);
                navigation.update(initialBurstTime + 2 * burstStep);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, 0, 'idle', 2, Math.PI / 2, new Vector3(-6, 0, 0), false);
            });
            describe('Burst Second time', () => {
                navigation.setState('burst');
                // we are not bursting, so that the time is not important
                navigation.update(initialBurstTime);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, initialBurstTime, 'burst', 3, Math.PI / 2, new Vector3(-9, 0, 0), true);
                navigation.update(initialBurstTime + burstStep);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, initialBurstTime, 'burst', 3, Math.PI / 2, new Vector3(-12, 0, 0), true);
                navigation.update(initialBurstTime + 2 * burstStep);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, 0, 'idle', 3, Math.PI / 2, new Vector3(-15, 0, 0), false);
            });
        });
    });
});
