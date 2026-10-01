/**
 * Thin wrapper over Rapier. The world is effectively 2D: every body lives on
 * the z = 0 slab with z translation and x/y rotation locked, gravity off.
 * Heights (ramps, boulevard, airborne) are handled by the sim itself.
 */
import RAPIER from '@dimforge/rapier3d-compat';
import type { StaticCollider } from '../world/CityGenerator';

export { RAPIER };
export type Body = RAPIER.RigidBody;
export type Collider = RAPIER.Collider;

export const GROUP = {
  STATIC: 0x0001,
  CAR: 0x0002,
  BIKE: 0x0004,
  FOOT: 0x0008,
  AIR: 0x0010,
} as const;

const groups = (membership: number, filter: number): number => ((membership & 0xffff) << 16) | (filter & 0xffff);

export const COLLISION = {
  static: groups(GROUP.STATIC, GROUP.CAR | GROUP.BIKE | GROUP.FOOT | GROUP.AIR),
  car: groups(GROUP.CAR, GROUP.STATIC | GROUP.CAR | GROUP.BIKE | GROUP.FOOT),
  bike: groups(GROUP.BIKE, GROUP.STATIC | GROUP.CAR),
  foot: groups(GROUP.FOOT, GROUP.STATIC | GROUP.CAR),
  air: groups(GROUP.AIR, GROUP.STATIC),
  ghost: groups(GROUP.AIR, 0),
  /** A car that only collides with the world (unjamming). */
  carGhost: groups(GROUP.CAR, GROUP.STATIC),
} as const;

let ready = false;

export async function initPhysics(): Promise<void> {
  if (ready) return;
  await RAPIER.init();
  ready = true;
}

export function yawOf(body: Body): number {
  const q = body.rotation();
  return 2 * Math.atan2(q.z, q.w);
}

export function setYaw(body: Body, a: number): void {
  body.setRotation({ x: 0, y: 0, z: Math.sin(a / 2), w: Math.cos(a / 2) }, true);
}

export class Physics {
  readonly world: RAPIER.World;
  private readonly staticBody: RAPIER.RigidBody;

  constructor(dt: number) {
    if (!ready) throw new Error('initPhysics() must be awaited before creating Physics');
    this.world = new RAPIER.World({ x: 0, y: 0, z: 0 });
    this.world.timestep = dt;
    this.world.integrationParameters.numSolverIterations = 4;
    this.staticBody = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
  }

  addStatic(c: StaticCollider): void {
    const hx = (c.maxX - c.minX) / 2;
    const hy = (c.maxY - c.minY) / 2;
    const desc = RAPIER.ColliderDesc.cuboid(hx, hy, 50)
      .setTranslation(c.minX + hx, c.minY + hy, 0)
      .setFriction(0.05)
      .setRestitution(0.05)
      .setCollisionGroups(COLLISION.static);
    this.world.createCollider(desc, this.staticBody);
  }

  /** Dynamic box body that only moves in the plane and yaws. */
  createBoxBody(x: number, y: number, a: number, hl: number, hw: number, mass: number, collision: number): Body {
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(x, y, 0)
        .setRotation({ x: 0, y: 0, z: Math.sin(a / 2), w: Math.cos(a / 2) })
        .enabledTranslations(true, true, false)
        .enabledRotations(false, false, true)
        .setCanSleep(true)
        .setCcdEnabled(false),
    );
    const col = RAPIER.ColliderDesc.cuboid(hl, hw, 20).setMass(mass).setFriction(0.15).setRestitution(0.1).setCollisionGroups(collision);
    this.world.createCollider(col, body);
    return body;
  }

  /** Capsule lying along the local x axis (the bike). Rotation is set by the sim. */
  createCapsuleBody(x: number, y: number, a: number, halfLength: number, radius: number, mass: number, collision: number): Body {
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(x, y, 0)
        .setRotation({ x: 0, y: 0, z: Math.sin(a / 2), w: Math.cos(a / 2) })
        .enabledTranslations(true, true, false)
        .lockRotations()
        .setCanSleep(false)
        .setCcdEnabled(true),
    );
    // Rapier capsules run along local y; rotate so the long axis is local x.
    const col = RAPIER.ColliderDesc.capsule(halfLength, radius)
      .setRotation({ x: 0, y: 0, z: Math.SQRT1_2, w: Math.SQRT1_2 })
      .setMass(mass)
      .setFriction(0.05)
      .setRestitution(0.05)
      .setCollisionGroups(collision);
    this.world.createCollider(col, body);
    return body;
  }

  createBallBody(x: number, y: number, radius: number, mass: number, collision: number): Body {
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, 0).enabledTranslations(true, true, false).lockRotations().setCanSleep(false).setCcdEnabled(true),
    );
    const col = RAPIER.ColliderDesc.ball(radius).setMass(mass).setFriction(0.1).setRestitution(0).setCollisionGroups(collision);
    this.world.createCollider(col, body);
    return body;
  }

  setCollision(body: Body, collision: number): void {
    for (let i = 0; i < body.numColliders(); i++) body.collider(i).setCollisionGroups(collision);
  }

  remove(body: Body): void {
    this.world.removeRigidBody(body);
  }

  step(): void {
    this.world.step();
  }
}
