import { assert } from 'chai';
import { Euler, Group, Vector3 } from 'three';

import { SpaceTruck, Navigation } from '../src/meshes/groups/SpaceTruck.js';

function createNavigation() {
    const group = new Group();
    group.name = 'test';
    const burst = new Group();
    burst.name = 'burst';
    group.add(burst);
    return new Navigation(group);
}

describe('Navigation', () => {
    describe('constructor', () => {
        it('should have set the default values', () => {
            const navigation = createNavigation();
            assert.equal(navigation.state, 'idle');
            assert.equal(navigation.engineBurstAmount, 1);
            assert.equal(navigation.engineRotationAmount, 0.01);
            assert.equal(navigation.burstDuration, 1000);
            assert.equal(navigation.burstTimer, 0);
            assert.equal(navigation.velocity, 0);
            assert.equal(navigation.velocityDirection, 0);
        });
    });
    describe('Rotation', () => {
        it('should rotate only in the rotation states', () => {
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
                const originalRotation = navigation.group.rotation;
                navigation.state = 'rotatingLeft';
                navigation.rotateLeft();
                assert.notEqual(navigation.group.rotation, originalRotation);
                assert.equal(navigation.state, 'idle');
                navigation.group.rotation = originalRotation;
                navigation.state = 'rotatingLeft';
                navigation.rotateRight();
                assert.notEqual(navigation.group.rotation, originalRotation);
                assert.equal(navigation.state, 'idle');
            });
            it('should rotate in rotateRight state', () => {
                const originalRotation = navigation.group.rotation;
                navigation.state = 'rotatingRight';
                navigation.rotateLeft();
                assert.notEqual(navigation.group.rotation, originalRotation);
                assert.equal(navigation.state, 'idle');
                navigation.group.rotation = originalRotation;
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
            for (let i = 0; i < 100; i++) {
                it('should be incremented in iteration ' + i, () => {
                    navigation.state = 'rotatingLeft';
                    navigation.rotateLeft();
                    assert.equal(navigation.group.rotation.z.toFixed(5), (navigation.engineRotationAmount * (i + 1)).toFixed(5));
                    assert.equal(navigation.state, 'idle');
                });
            }
            it('should be decreased by 2PI if the rotation is more than PI', () => {
                navigation.group.rotation.z = Math.PI;
                navigation.state = 'rotatingLeft';
                navigation.rotateLeft();
                assert.equal(navigation.group.rotation.z, Math.PI + navigation.engineRotationAmount - 2 * Math.PI);
            });
        });
        describe('RotateRight', () => {
            const navigation = createNavigation();
            const initialRotationComponent = 0;
            navigation.group.rotation.z = initialRotationComponent;
            for (let i = 0; i < 100; i++) {
                it('should be decremented in iteration ' + i, () => {
                    navigation.state = 'rotatingRight';
                    navigation.rotateRight();
                    assert.equal(navigation.group.rotation.z.toFixed(5), (-navigation.engineRotationAmount * (i + 1)).toFixed(5));
                    assert.equal(navigation.state, 'idle');
                });
            }
            it('should be increased by 2PI if the rotation is less than -PI', () => {
                navigation.group.rotation.z = -Math.PI;
                navigation.state = 'rotatingRight';
                navigation.rotateRight();
                assert.equal(navigation.group.rotation.z, -Math.PI - navigation.engineRotationAmount + 2 * Math.PI);
            });
        });
        it('should rotate both direction with the correct steps', () => {
            const navigation = createNavigation();
            const initialRotationComponent = 0;
            navigation.group.rotation.z = initialRotationComponent;
            for (let i = 0; i < 100; i++) {
                it('should be incremented in iteration ' + i, () => {
                    navigation.state = 'rotatingLeft';
                    navigation.rotateLeft();
                    assert.equal(navigation.group.rotation.z.toFixed(5), (navigation.engineRotationAmount * (i + 1)).toFixed(5));
                    assert.equal(navigation.state, 'idle');
                });
            }
            for (let i = 0; i < 100; i++) {
                it('should be incremented in iteration ' + i, () => {
                    navigation.state = 'rotatingLeft';
                    navigation.rotateLeft();
                    assert.equal(navigation.group.rotation.z.toFixed(5), (navigation.engineRotationAmount * (100 - i)).toFixed(5));
                    assert.equal(navigation.state, 'idle');
                });
            }
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
            assert.equal(unitVector.x.toFixed(5), 1.0.toFixed(5));
            assert.equal(unitVector.y.toFixed(5), 0.0.toFixed(5));
            assert.equal(unitVector.z.toFixed(5), 0.0.toFixed(5));
        });
        // if the velocityDirection is -PI, the unit vector is (0, -1, 0)
        it('should be (0, -1, 0) if the velocityDirection is -PI', () => {
            const navigation = createNavigation();
            navigation.velocityDirection = -Math.PI;
            const unitVector = navigation.velocityDirectionUnitVector();
            assert.equal(unitVector.x.toFixed(5), 0.0.toFixed(5));
            assert.equal(unitVector.y.toFixed(5), -1.0.toFixed(5));
            assert.equal(unitVector.z.toFixed(5), 0.0.toFixed(5));
        });
        // if the velocityDirection is PI, the unit vector is (0, -1, 0)
        it('should be (0, -1, 0) if the velocityDirection is PI', () => {
            const navigation = createNavigation();
            navigation.velocityDirection = -Math.PI;
            const unitVector = navigation.velocityDirectionUnitVector();
            assert.equal(unitVector.x.toFixed(5), 0.0.toFixed(5));
            assert.equal(unitVector.y.toFixed(5), -1.0.toFixed(5));
            assert.equal(unitVector.z.toFixed(5), 0.0.toFixed(5));
        });
        // if the velocityDirection is PI/2, the unit vector is (-1, 0, 0)
        it('should be (1, 0, 0) if the velocityDirection is PI/2', () => {
            const navigation = createNavigation();
            navigation.velocityDirection = Math.PI / 2;
            const unitVector = navigation.velocityDirectionUnitVector();
            assert.equal(unitVector.x.toFixed(5), -1.0.toFixed(5));
            assert.equal(unitVector.y.toFixed(5), 0.0.toFixed(5));
            assert.equal(unitVector.z.toFixed(5), 0.0.toFixed(5));
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
            const startStateNavigation = Object.assign({}, navigation);
            const startStateBurst = startStateNavigation.group.getObjectByName('burst').clone();
            it('should set the burstTimer to the initial value', () => {
                assert.equal(startStateNavigation.burstTimer, initialBurstTime);
            });
            it('should set the burst state', () => {
                assert.equal(startStateNavigation.state, 'burst');
            });
            it('should set the Burst visible', () => {
                assert.isTrue(startStateBurst.visible);
            });
            it('should set the velocity to 1', () => {
                assert.equal(startStateNavigation.velocity, 1);
            });
            it('should set the velocityDirection', () => {
                assert.equal(startStateNavigation.velocityDirection, 0);
            });
            navigation.burst(initialBurstTime + burstStep);
            const middleStateNavigation = Object.assign({}, navigation);
            const middleStateBurst = middleStateNavigation.group.getObjectByName('burst').clone();
            it('should not be changed burstTimer', () => {
                assert.equal(middleStateNavigation.burstTimer, initialBurstTime);
            });
            it('should set the burst state', () => {
                assert.equal(middleStateNavigation.state, 'burst');
            });
            it('should set the Burst visible', () => {
                assert.isTrue(middleStateBurst.visible);
            });
            it('should keep the velocity at 1', () => {
                assert.equal(middleStateNavigation.velocity, 1);
            });
            it('should set the velocityDirection', () => {
                assert.equal(middleStateNavigation.velocityDirection, 0);
            });
            navigation.burst(initialBurstTime + 2 * burstStep);
            it('should set the burstTimer to 0', () => {
                assert.equal(navigation.burstTimer, 0);
            });
            it('should set the state to idle', () => {
                assert.equal(navigation.state, 'idle');
            });
            it('should set the Burst hidden', () => {
                assert.isFalse(navigation.group.getObjectByName('burst').visible);
            });
            it('should keep the velocity at 1', () => {
                assert.equal(navigation.velocity, 1);
            });
            it('should set the velocityDirection', () => {
                assert.equal(navigation.velocityDirection, 0);
            });
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
                // check the current state
                const firstUpdateNavigation = Object.assign({}, navigation);
                const firstUpdateBurst = firstUpdateNavigation.group.getObjectByName('burst').clone();
                const firstUpdateGroup = firstUpdateNavigation.group.clone();
                it('should set the burstTimer to the initial value', () => {
                    assert.equal(firstUpdateNavigation.burstTimer, initialBurstTime);
                });
                it('should set the burst state', () => {
                    assert.equal(firstUpdateNavigation.state, 'burst');
                });
                it('should set the Burst visible', () => {
                    assert.isTrue(firstUpdateBurst.visible);
                });
                it('should set the velocity to 1', () => {
                    assert.equal(firstUpdateNavigation.velocity, 1);
                });
                it('should set the velocityDirection', () => {
                    assert.equal(firstUpdateNavigation.velocityDirection, 0);
                });
                it('should set the position of the group', () => {
                    assert.equal(firstUpdateGroup.position.x, 0);
                    assert.equal(firstUpdateGroup.position.y, 1);
                    assert.equal(firstUpdateGroup.position.z, 0);
                });
            });
            describe('Halftime', () => {
                navigation.update(initialBurstTime + burstStep);
                // check the current state
                const secondUpdateNavigation = Object.assign({}, navigation);
                const secondUpdateBurst = secondUpdateNavigation.group.getObjectByName('burst').clone();
                const secondUpdateGroup = secondUpdateNavigation.group.clone();
                it('should set the burstTimer to the initial value', () => {
                    assert.equal(secondUpdateNavigation.burstTimer, initialBurstTime);
                });
                it('should set the burst state', () => {
                    assert.equal(secondUpdateNavigation.state, 'burst');
                });
                it('should set the Burst visible', () => {
                    assert.isTrue(secondUpdateBurst.visible);
                });
                it('should set the velocity to 1', () => {
                    assert.equal(secondUpdateNavigation.velocity, 1);
                });
                it('should set the velocityDirection', () => {
                    assert.equal(secondUpdateNavigation.velocityDirection, 0);
                });
                it('should set the position of the group', () => {
                    assert.equal(secondUpdateGroup.position.x, 0);
                    assert.equal(secondUpdateGroup.position.y, 2);
                    assert.equal(secondUpdateGroup.position.z, 0);
                });
            });
            describe('Stop Burst', () => {
                navigation.update(initialBurstTime + 2 * burstStep);
                const stopNavigation = Object.assign({}, navigation);
                const stopBurst = stopNavigation.group.getObjectByName('burst').clone();
                const stopGroup = stopNavigation.group.clone();
                // check the current state
                it('should set the burstTimer to 0', () => {
                    assert.equal(stopNavigation.burstTimer, 0);
                });
                it('should set the idle state', () => {
                    assert.equal(stopNavigation.state, 'idle');
                });
                it('should set the Burst hidden', () => {
                    assert.isFalse(stopBurst.visible);
                });
                it('should set the velocity to 1', () => {
                    assert.equal(stopNavigation.velocity, 1);
                });
                it('should set the velocityDirection', () => {
                    assert.equal(stopNavigation.velocityDirection, 0);
                });
                it('should set the position of the group', () => {
                    assert.equal(stopGroup.position.x, 0);
                    assert.equal(stopGroup.position.y, 3);
                    assert.equal(stopGroup.position.z, 0);
                });
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
                // check the current state
                const firstUpdateNavigation = Object.assign({}, navigation);
                const firstUpdateBurst = firstUpdateNavigation.group.getObjectByName('burst').clone();
                const firstUpdateGroup = firstUpdateNavigation.group.clone();
                it('should set the burstTimer to the initial value', () => {
                    assert.equal(firstUpdateNavigation.burstTimer, initialBurstTime);
                });
                it('should set the burst state', () => {
                    assert.equal(firstUpdateNavigation.state, 'burst');
                });
                it('should set the Burst visible', () => {
                    assert.isTrue(firstUpdateBurst.visible);
                });
                it('should set the velocity to 1', () => {
                    assert.equal(firstUpdateNavigation.velocity, 1);
                });
                it('should set the velocityDirection', () => {
                    assert.equal(firstUpdateNavigation.velocityDirection, Math.PI / 2);
                });
                it('should set the position of the group', () => {
                    assert.equal(firstUpdateGroup.position.x.toFixed(5), -1.0.toFixed(5));
                    assert.equal(firstUpdateGroup.position.y.toFixed(5), 0.0.toFixed(5));
                    assert.equal(firstUpdateGroup.position.z.toFixed(5), 0.0.toFixed(5));
                });
            });
            describe('Halftime', () => {
                navigation.update(initialBurstTime + burstStep);
                // check the current state
                const secondUpdateNavigation = Object.assign({}, navigation);
                const secondUpdateBurst = secondUpdateNavigation.group.getObjectByName('burst').clone();
                const secondUpdateGroup = secondUpdateNavigation.group.clone();
                it('should set the burstTimer to the initial value', () => {
                    assert.equal(secondUpdateNavigation.burstTimer, initialBurstTime);
                });
                it('should set the burst state', () => {
                    assert.equal(secondUpdateNavigation.state, 'burst');
                });
                it('should set the Burst visible', () => {
                    assert.isTrue(secondUpdateBurst.visible);
                });
                it('should set the velocity to 1', () => {
                    assert.equal(secondUpdateNavigation.velocity, 1);
                });
                it('should set the velocityDirection', () => {
                    assert.equal(secondUpdateNavigation.velocityDirection, Math.PI / 2);
                });
                it('should set the position of the group', () => {
                    assert.equal(secondUpdateGroup.position.x.toFixed(5), -2.0.toFixed(5));
                    assert.equal(secondUpdateGroup.position.y.toFixed(5), 0.0.toFixed(5));
                    assert.equal(secondUpdateGroup.position.z.toFixed(5), 0.0.toFixed(5));
                });
            });
            describe('Stop Burst', () => {
                navigation.update(initialBurstTime + 2 * burstStep);
                const stopNavigation = Object.assign({}, navigation);
                const stopBurst = stopNavigation.group.getObjectByName('burst').clone();
                const stopGroup = stopNavigation.group.clone();
                // check the current state
                it('should set the burstTimer to 0', () => {
                    assert.equal(stopNavigation.burstTimer, 0);
                });
                it('should set the idle state', () => {
                    assert.equal(stopNavigation.state, 'idle');
                });
                it('should set the Burst hidden', () => {
                    assert.isFalse(stopBurst.visible);
                });
                it('should set the velocity to 1', () => {
                    assert.equal(stopNavigation.velocity, 1);
                });
                it('should set the velocityDirection', () => {
                    assert.equal(stopNavigation.velocityDirection, Math.PI / 2);
                });
                it('should set the position of the group', () => {
                    assert.equal(stopGroup.position.x.toFixed(5), -3.0.toFixed(5));
                    assert.equal(stopGroup.position.y.toFixed(5), 0.0.toFixed(5));
                    assert.equal(stopGroup.position.z.toFixed(5), 0.0.toFixed(5));
                });
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
                // check the current state
                const firstUpdateNavigation = Object.assign({}, navigation);
                const firstUpdateBurst = firstUpdateNavigation.group.getObjectByName('burst').clone();
                const firstUpdateGroup = firstUpdateNavigation.group.clone();
                it('should set the burstTimer to the initial value', () => {
                    assert.equal(firstUpdateNavigation.burstTimer, initialBurstTime);
                });
                it('should set the burst state', () => {
                    assert.equal(firstUpdateNavigation.state, 'burst');
                });
                it('should set the Burst visible', () => {
                    assert.isTrue(firstUpdateBurst.visible);
                });
                it('should set the velocity to 1', () => {
                    assert.equal(firstUpdateNavigation.velocity, 1);
                });
                it('should set the velocityDirection', () => {
                    assert.equal(firstUpdateNavigation.velocityDirection, -Math.PI / 2);
                });
                it('should set the position of the group', () => {
                    assert.equal(firstUpdateGroup.position.x.toFixed(5), 1.0.toFixed(5));
                    assert.equal(firstUpdateGroup.position.y.toFixed(5), 0.0.toFixed(5));
                    assert.equal(firstUpdateGroup.position.z.toFixed(5), 0.0.toFixed(5));
                });
            });
            describe('Halftime', () => {
                navigation.update(initialBurstTime + burstStep);
                // check the current state
                const secondUpdateNavigation = Object.assign({}, navigation);
                const secondUpdateBurst = secondUpdateNavigation.group.getObjectByName('burst').clone();
                const secondUpdateGroup = secondUpdateNavigation.group.clone();
                it('should set the burstTimer to the initial value', () => {
                    assert.equal(secondUpdateNavigation.burstTimer, initialBurstTime);
                });
                it('should set the burst state', () => {
                    assert.equal(secondUpdateNavigation.state, 'burst');
                });
                it('should set the Burst visible', () => {
                    assert.isTrue(secondUpdateBurst.visible);
                });
                it('should set the velocity to 1', () => {
                    assert.equal(secondUpdateNavigation.velocity, 1);
                });
                it('should set the velocityDirection', () => {
                    assert.equal(secondUpdateNavigation.velocityDirection, -Math.PI / 2);
                });
                it('should set the position of the group', () => {
                    assert.equal(secondUpdateGroup.position.x.toFixed(5), 2.0.toFixed(5));
                    assert.equal(secondUpdateGroup.position.y.toFixed(5), 0.0.toFixed(5));
                    assert.equal(secondUpdateGroup.position.z.toFixed(5), 0.0.toFixed(5));
                });
            });
            describe('Stop Burst', () => {
                navigation.update(initialBurstTime + 2 * burstStep);
                const stopNavigation = Object.assign({}, navigation);
                const stopBurst = stopNavigation.group.getObjectByName('burst').clone();
                const stopGroup = stopNavigation.group.clone();
                // check the current state
                it('should set the burstTimer to 0', () => {
                    assert.equal(stopNavigation.burstTimer, 0);
                });
                it('should set the idle state', () => {
                    assert.equal(stopNavigation.state, 'idle');
                });
                it('should set the Burst hidden', () => {
                    assert.isFalse(stopBurst.visible);
                });
                it('should set the velocity to 1', () => {
                    assert.equal(stopNavigation.velocity, 1);
                });
                it('should set the velocityDirection', () => {
                    assert.equal(stopNavigation.velocityDirection, -Math.PI / 2);
                });
                it('should set the position of the group', () => {
                    assert.equal(stopGroup.position.x.toFixed(5), 3.0.toFixed(5));
                    assert.equal(stopGroup.position.y.toFixed(5), 0.0.toFixed(5));
                    assert.equal(stopGroup.position.z.toFixed(5), 0.0.toFixed(5));
                });
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
                // check the current state
                const firstUpdateNavigation = Object.assign({}, navigation);
                const firstUpdateBurst = firstUpdateNavigation.group.getObjectByName('burst').clone();
                const firstUpdateGroup = firstUpdateNavigation.group.clone();
                it('should set the burstTimer to the initial value', () => {
                    assert.equal(firstUpdateNavigation.burstTimer, initialBurstTime);
                });
                it('should set the burst state', () => {
                    assert.equal(firstUpdateNavigation.state, 'burst');
                });
                it('should set the Burst visible', () => {
                    assert.isTrue(firstUpdateBurst.visible);
                });
                it('should set the velocity to 1', () => {
                    assert.equal(firstUpdateNavigation.velocity, 1);
                });
                it('should set the velocityDirection', () => {
                    assert.equal(firstUpdateNavigation.velocityDirection, Math.PI);
                });
                it('should set the position of the group', () => {
                    assert.equal(firstUpdateGroup.position.x.toFixed(5), -0.0.toFixed(5));
                    assert.equal(firstUpdateGroup.position.y.toFixed(5), -1.0.toFixed(5));
                    assert.equal(firstUpdateGroup.position.z.toFixed(5), 0.0.toFixed(5));
                });
            });
            describe('Halftime', () => {
                navigation.update(initialBurstTime + burstStep);
                // check the current state
                const secondUpdateNavigation = Object.assign({}, navigation);
                const secondUpdateBurst = secondUpdateNavigation.group.getObjectByName('burst').clone();
                const secondUpdateGroup = secondUpdateNavigation.group.clone();
                it('should set the burstTimer to the initial value', () => {
                    assert.equal(secondUpdateNavigation.burstTimer, initialBurstTime);
                });
                it('should set the burst state', () => {
                    assert.equal(secondUpdateNavigation.state, 'burst');
                });
                it('should set the Burst visible', () => {
                    assert.isTrue(secondUpdateBurst.visible);
                });
                it('should set the velocity to 1', () => {
                    assert.equal(secondUpdateNavigation.velocity, 1);
                });
                it('should set the velocityDirection', () => {
                    assert.equal(secondUpdateNavigation.velocityDirection, Math.PI);
                });
                it('should set the position of the group', () => {
                    assert.equal(secondUpdateGroup.position.x.toFixed(5), -0.0.toFixed(5));
                    assert.equal(secondUpdateGroup.position.y.toFixed(5), -2.0.toFixed(5));
                    assert.equal(secondUpdateGroup.position.z.toFixed(5), 0.0.toFixed(5));
                });
            });
            describe('Stop Burst', () => {
                navigation.update(initialBurstTime + 2 * burstStep);
                const stopNavigation = Object.assign({}, navigation);
                const stopBurst = stopNavigation.group.getObjectByName('burst').clone();
                const stopGroup = stopNavigation.group.clone();
                // check the current state
                it('should set the burstTimer to 0', () => {
                    assert.equal(stopNavigation.burstTimer, 0);
                });
                it('should set the idle state', () => {
                    assert.equal(stopNavigation.state, 'idle');
                });
                it('should set the Burst hidden', () => {
                    assert.isFalse(stopBurst.visible);
                });
                it('should set the velocity to 1', () => {
                    assert.equal(stopNavigation.velocity, 1);
                });
                it('should set the velocityDirection', () => {
                    assert.equal(stopNavigation.velocityDirection, Math.PI);
                });
                it('should set the position of the group', () => {
                    assert.equal(stopGroup.position.x.toFixed(5), -0.0.toFixed(5));
                    assert.equal(stopGroup.position.y.toFixed(5), -3.0.toFixed(5));
                    assert.equal(stopGroup.position.z.toFixed(5), 0.0.toFixed(5));
                });
            });
        });
    });
});