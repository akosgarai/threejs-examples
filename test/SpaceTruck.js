import { assert } from 'chai';
import { Euler, Group, Vector3 } from 'three';

import { SpaceTruck, Navigation } from '../src/meshes/groups/SpaceTruck.js';

const MAX_DELTA = 0.000001;

function createNavigation() {
    const group = new Group();
    group.name = 'test';
    const burst = new Group();
    burst.name = 'burst';
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
        assert.equal(currentNavigation.velocity, expectedVelocity);
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
            it('should be decreased by 2PI if the rotation is more than PI', () => {
                navigation.group.rotation.z = Math.PI;
                navigation.state = 'rotatingLeft';
                const expected = Math.PI + (navigation.engineRotationAmount * Math.PI / 180) - 2 * Math.PI;
                navigation.rotateLeft();
                assert.closeTo(navigation.group.rotation.z, expected, MAX_DELTA);
            });
        });
        describe('RotateRight', () => {
            const navigation = createNavigation();
            const initialRotationComponent = 0;
            navigation.group.rotation.z = initialRotationComponent;
            it('should be decremented in 180 iteration', () => {
                for (let i = 0; i < 180; i++) {
                    const expected = -navigation.engineRotationAmount * (i + 1) * Math.PI / 180;
                    navigation.state = 'rotatingRight';
                    navigation.rotateRight();
                    assert.closeTo(navigation.group.rotation.z, expected, MAX_DELTA, 'Iteration ' + i);
                    assert.equal(navigation.state, 'idle');
                }
            });
            it('should be increased by 2PI if the rotation is less than -PI', () => {
                navigation.group.rotation.z = -Math.PI;
                navigation.state = 'rotatingRight';
                const expected = -Math.PI - (navigation.engineRotationAmount * Math.PI / 180) + 2 * Math.PI;
                navigation.rotateRight();
                assert.closeTo(navigation.group.rotation.z, expected, MAX_DELTA);
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
        // if the velocityDirection is 0, the unit vector is (0, 1, 0)
        it('should be (0, 1, 0) if the velocityDirection is 0', () => {
            const navigation = createNavigation();
            navigation.velocityDirection = 0;
            const unitVector = navigation.velocityDirectionUnitVector();
            assert.equal(unitVector.x, 0);
            assert.equal(unitVector.y, 1);
            assert.equal(unitVector.z, 0);
        });
        // if the velocityDirection is -PI/2, the unit vector is (1, 0, 0)
        it('should be (1, 0, 0) if the velocityDirection is -PI/2', () => {
            const navigation = createNavigation();
            navigation.velocityDirection = -(Math.PI / 2);
            const unitVector = navigation.velocityDirectionUnitVector();
            assert.closeTo(unitVector.x, 1, MAX_DELTA);
            assert.closeTo(unitVector.y, 0, MAX_DELTA);
            assert.closeTo(unitVector.z, 0, MAX_DELTA);
        });
        // if the velocityDirection is -PI, the unit vector is (0, -1, 0)
        it('should be (0, -1, 0) if the velocityDirection is -PI', () => {
            const navigation = createNavigation();
            navigation.velocityDirection = -Math.PI;
            const unitVector = navigation.velocityDirectionUnitVector();
            assert.closeTo(unitVector.x, 0, MAX_DELTA);
            assert.closeTo(unitVector.y, -1, MAX_DELTA);
            assert.closeTo(unitVector.z, 0, MAX_DELTA);
        });
        // if the velocityDirection is PI, the unit vector is (0, -1, 0)
        it('should be (0, -1, 0) if the velocityDirection is PI', () => {
            const navigation = createNavigation();
            navigation.velocityDirection = -Math.PI;
            const unitVector = navigation.velocityDirectionUnitVector();
            assert.closeTo(unitVector.x, 0, MAX_DELTA);
            assert.closeTo(unitVector.y, -1, MAX_DELTA);
            assert.closeTo(unitVector.z, 0, MAX_DELTA);
        });
        // if the velocityDirection is PI/2, the unit vector is (-1, 0, 0)
        it('should be (1, 0, 0) if the velocityDirection is PI/2', () => {
            const navigation = createNavigation();
            navigation.velocityDirection = Math.PI / 2;
            const unitVector = navigation.velocityDirectionUnitVector();
            assert.closeTo(unitVector.x, -1, MAX_DELTA);
            assert.closeTo(unitVector.y, 0, MAX_DELTA);
            assert.closeTo(unitVector.z, 0, MAX_DELTA);
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
    describe('Burst', () => {
        const navigation = createNavigation();
        const burstStep = navigation.burstDuration / 2;
        const initialBurstTime = 10;
        describe('Burst flow with 0 rotation', () => {
            navigation.burst(initialBurstTime);
            // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
            checkNavigation(navigation, initialBurstTime, 'burst', 1, 0, new Vector3(0, 0, 0), true);
            navigation.burst(initialBurstTime + burstStep);
            checkNavigation(navigation, initialBurstTime, 'burst', 1, 0, new Vector3(0, 0, 0), true);
            navigation.burst(initialBurstTime + 2 * burstStep);
            checkNavigation(navigation, 0, 'idle', 1, 0, new Vector3(0, 0, 0), false);
        });
    });
    describe('Update', () => {
        // Burst state then update.
        const navigation = createNavigation();
        const burstStep = navigation.burstDuration / 2;
        const initialBurstTime = 10;
        describe('Burst flow with 0 rotation', () => {
            navigation.setState('burst');
            navigation.direction = 0;
            navigation.group.position.x = 0;
            navigation.group.position.y = 0;
            navigation.group.position.z = 0;
            navigation.velocity = 0;
            navigation.group.rotation.x = 0;
            navigation.group.rotation.y = 0;
            navigation.group.rotation.z = 0;
            describe('Start Burst', () => {
                navigation.update(initialBurstTime);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, initialBurstTime, 'burst', 1, 0, new Vector3(0, 1, 0), true);
            });
            describe('Halftime', () => {
                navigation.update(initialBurstTime + burstStep);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, initialBurstTime, 'burst', 1, 0, new Vector3(0, 2, 0), true);
            });
            describe('Stop Burst', () => {
                navigation.update(initialBurstTime + 2 * burstStep);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, 0, 'idle', 1, 0, new Vector3(0, 3, 0), false);
            });
        });
        describe('Burst flow with 90 deg. rotation', () => {
            navigation.group.position.x = 0;
            navigation.group.position.y = 0;
            navigation.group.position.z = 0;
            navigation.velocity = 0;
            navigation.group.rotation.x = 0;
            navigation.group.rotation.y = 0;
            navigation.group.rotation.z = Math.PI / 2;
            navigation.burstTimer = 0;
            navigation.setState('burst');
            describe('Start Burst', () => {
                navigation.update(initialBurstTime);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, initialBurstTime, 'burst', 1, Math.PI / 2, new Vector3(-1, 0, 0), true);
            });
            describe('Halftime', () => {
                navigation.update(initialBurstTime + burstStep);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, initialBurstTime, 'burst', 1, Math.PI / 2, new Vector3(-2, 0, 0), true);
            });
            describe('Stop Burst', () => {
                navigation.update(initialBurstTime + 2 * burstStep);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, 0, 'idle', 1, Math.PI / 2, new Vector3(-3, 0, 0), false);
            });
            describe('Start Burst again', () => {
                navigation.setState('burst');
                navigation.update(initialBurstTime);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, initialBurstTime, 'burst', 2, Math.PI / 2, new Vector3(-5, 0, 0), true);
            });
        });
        describe('Burst flow with -90 deg. rotation', () => {
            navigation.group.position.x = 0;
            navigation.group.position.y = 0;
            navigation.group.position.z = 0;
            navigation.velocity = 0;
            navigation.group.rotation.x = 0;
            navigation.group.rotation.y = 0;
            navigation.group.rotation.z = -Math.PI / 2;
            navigation.burstTimer = 0;
            navigation.setState('burst');
            describe('Start Burst', () => {
                navigation.update(initialBurstTime);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, initialBurstTime, 'burst', 1, -Math.PI / 2, new Vector3(1, 0, 0), true);
            });
            describe('Halftime', () => {
                navigation.update(initialBurstTime + burstStep);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, initialBurstTime, 'burst', 1, -Math.PI / 2, new Vector3(2, 0, 0), true);
            });
            describe('Stop Burst', () => {
                navigation.update(initialBurstTime + 2 * burstStep);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, 0, 'idle', 1, -Math.PI / 2, new Vector3(3, 0, 0), false);
            });
        });
        describe('Burst flow with -180 / 180 deg. rotation', () => {
            navigation.group.position.x = 0;
            navigation.group.position.y = 0;
            navigation.group.position.z = 0;
            navigation.velocity = 0;
            navigation.group.rotation.x = 0;
            navigation.group.rotation.y = 0;
            navigation.group.rotation.z = Math.PI;
            navigation.burstTimer = 0;
            navigation.setState('burst');
            describe('Start Burst', () => {
                navigation.update(initialBurstTime);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, initialBurstTime, 'burst', 1, Math.PI, new Vector3(0, -1, 0), true);
            });
            describe('Halftime', () => {
                navigation.update(initialBurstTime + burstStep);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, initialBurstTime, 'burst', 1, Math.PI, new Vector3(0, -2, 0), true);
            });
            describe('Stop Burst', () => {
                navigation.update(initialBurstTime + 2 * burstStep);
                // navigation, expectedBurstTimer, expectedState, expectedVelocity, expectedVelocityDirection, expectedPosition, expectedBurstVisible
                checkNavigation(navigation, 0, 'idle', 1, Math.PI, new Vector3(0, -3, 0), false);
            });
        });
        describe('Move then rotate', () => {
            navigation.group.position.x = 0;
            navigation.group.position.y = 0;
            navigation.group.position.z = 0;
            navigation.velocity = 1;
            navigation.group.rotation.x = 0;
            navigation.group.rotation.y = 0;
            navigation.group.rotation.z = 0;
            navigation.burstTimer = 0;
            navigation.velocityDirection = 0;
            navigation.setState('idle');
            describe('Move forward', () => {
                // we are not bursting, so that the time is not important
                navigation.update(0);
                const testNavigation = Object.assign({}, navigation);
                const testGroup = testNavigation.group.clone();
                it('should set the position of the group', () => {
                    assert.closeTo(testGroup.position.x, 0, MAX_DELTA);
                    assert.closeTo(testGroup.position.y, 1, MAX_DELTA);
                    assert.closeTo(testGroup.position.z, 0, MAX_DELTA);
                });
            });
            describe('Move forward again', () => {
                // we are not bursting, so that the time is not important
                navigation.update(0);
                const testNavigation = Object.assign({}, navigation);
                const testGroup = testNavigation.group.clone();
                it('should set the position of the group', () => {
                    assert.closeTo(testGroup.position.x, 0, MAX_DELTA);
                    assert.closeTo(testGroup.position.y, 2, MAX_DELTA);
                    assert.closeTo(testGroup.position.z, 0, MAX_DELTA);
                });
            });
            describe('Burst with 90 deg. rotation start', () => {
                navigation.group.rotation.z = Math.PI / 2;
                navigation.setState('burst');
                navigation.update(initialBurstTime);
                const testNavigation = Object.assign({}, navigation);
                const testGroup = testNavigation.group.clone();
                it('should set the position of the group', () => {
                    assert.closeTo(testGroup.position.x, -1, MAX_DELTA);
                    assert.closeTo(testGroup.position.y, 3, MAX_DELTA);
                    assert.closeTo(testGroup.position.z, 0, MAX_DELTA);
                });
                it('should set the velocityDirection', () => {
                    assert.closeTo(testNavigation.velocityDirection, Math.PI / 4, MAX_DELTA);
                });
            });
            describe('Burst with 90 deg. rotation middle', () => {
                navigation.update(initialBurstTime + burstStep);
                const testNavigation = Object.assign({}, navigation);
                const testGroup = testNavigation.group.clone();
                it('should set the position of the group', () => {
                    assert.closeTo(testGroup.position.x, -2, MAX_DELTA);
                    assert.closeTo(testGroup.position.y, 4, MAX_DELTA);
                    assert.closeTo(testGroup.position.z, 0, MAX_DELTA);
                });
                it('should set the velocityDirection', () => {
                    assert.closeTo(testNavigation.velocityDirection, Math.PI / 4, MAX_DELTA);
                });
            });
            describe('Burst with 90 deg. rotation stop', () => {
                navigation.update(initialBurstTime + 2 * burstStep);
                const testNavigation = Object.assign({}, navigation);
                const testGroup = testNavigation.group.clone();
                it('should set the position of the group', () => {
                    assert.closeTo(testGroup.position.x, -3, MAX_DELTA);
                    assert.closeTo(testGroup.position.y, 5, MAX_DELTA);
                    assert.closeTo(testGroup.position.z, 0, MAX_DELTA);
                });
                it('should set the velocityDirection', () => {
                    assert.closeTo(testNavigation.velocityDirection, Math.PI / 4, MAX_DELTA);
                });
            });
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
