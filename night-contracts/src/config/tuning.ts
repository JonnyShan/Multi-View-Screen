/**
 * Every gameplay number lives here. Systems read from a `Tuning` object and
 * never hard-code values.
 *
 * Units: 8 world units = 1 metre. Speeds are units per second, accelerations
 * units per second squared, angles radians, times seconds.
 */

export const UNITS_PER_METRE = 8;
/** Multiply km/h by this to get units per second. */
export const KMH = UNITS_PER_METRE / 3.6;

export type CarModel = 'sedan' | 'suv' | 'limo' | 'police' | 'hatch' | 'ute' | 'van';
export type KillMethod = 'gun' | 'blade' | 'crash' | 'roof';

export interface CarSpec {
  /** Half length and half width of the collision box. */
  hl: number;
  hw: number;
  /** Roof height above ground, used for roof landings and rendering. */
  roof: number;
  mass: number;
  maxSpeed: number;
  accel: number;
  wheelbase: number;
  hp: number;
}

export const tuning = {
  sim: {
    hz: 60,
    /** Max fixed steps per rendered frame before the loop drops time. */
    maxStepsPerFrame: 6,
  },

  world: {
    seed: 7331,
    blocksX: 8,
    blocksY: 8,
    blockSize: 400,
    roadWidth: 112,
    laneOffset: 26,
    alleyWidth: 34,
    footpathWidth: 22,
    kerbHeight: 1.2,
    storeyHeight: 28,
    /** Coastal boulevard runs one block pitch south of the grid, raised. */
    boulevardElevation: 32,
    /** Grid columns whose north-south road ramps up to the boulevard. */
    rampColumns: [0, 4, 8],
    /** Bollard spacing at alley mouths: bikes pass, cars do not. */
    bollardGap: 13,
    bollardRadius: 2.2,
    /** Beach strip depth south of the boulevard, then ocean. */
    beachDepth: 260,
    lampHeight: 60,
    /** Palm trunks and lamp posts are solid. */
    solidStreetFurniture: true,
    lampInset: 12,
    /** Floors per block type [min, max]. */
    floors: {
      tower: [9, 26] as [number, number],
      split: [4, 12] as [number, number],
      quad: [3, 8] as [number, number],
      skyline: [44, 44] as [number, number],
    },
    /** Fraction of blocks of each type (rest are towers). */
    blockMix: { split: 0.3, quad: 0.2, plaza: 0.1, carpark: 0.08 },
  },

  bike: {
    /** Kept well under real superbike speeds: the city is only about 500 m across. */
    topSpeed: 150 * KMH,
    accel: 95,
    accelExponent: 1.7,
    brake: 250,
    reverseMax: 20 * KMH,
    reverseAccel: 70,
    rollingDrag: 16,
    aeroDrag: 0.00012,
    /** Yaw rate at low and top speed (rad/s). */
    steerRateLow: 2.7,
    steerRateHigh: 1.4,
    /** Below this speed steering authority fades to zero. */
    steerFadeSpeed: 30,
    yawResponse: 11,
    /** How fast the velocity direction follows the heading (1/s). */
    grip: 11,
    driftGrip: 1.7,
    driftYawMul: 1.55,
    driftSpeedLoss: 34,
    /** Heading vs velocity angle above which the tyre skids. */
    skidAngle: 0.14,
    maxLean: 0.8,
    leanResponse: 9,
    /** Normal impact speed against a wall that throws the rider. */
    crashImpactSpeed: 170,
    radius: 4,
    halfLength: 5,
    mass: 260,
    riderlessFriction: 170,
    fallOverSpeed: 24,
    wetGripMul: 0.72,
    wetBrakeMul: 0.85,
  },

  player: {
    maxHealth: 100,
    /** Damage taken is divided by this: 2 means every hit does half. */
    armor: 2,
    runSpeed: 50,
    accel: 420,
    turnRate: 12,
    radius: 3.2,
    regenDelay: 8,
    regenRate: 4,
    remountRange: 44,
    knockdownTime: 1.3,
    deathTime: 3.2,
    respawnCashPenalty: 500,
    gravity: 190,
    height: 14,
  },

  /** E on foot whistles: the bike rides itself over (see sim/BikeCall). */
  bikeCall: {
    /** Length of the whistle pose, and the gap before you can whistle again. */
    whistleTime: 0.9,
    standUpTime: 0.6,
    speed: 95 * KMH,
    cornerSpeed: 70,
    approachSpeed: 45,
    /** Plans braking at this rate (the bike brakes harder, so it always makes it). */
    brake: 150,
    /** Leaves the lane this far before the player to pull in at an angle. */
    pullIn: 34,
    /** Stops this far short of the player. */
    stopShort: 14,
    /** How far it moves over to squeeze past stopped traffic. */
    filterOffset: 17,
    /** Longer road trips skip ahead: the bike appears out of sight this far out and rides in. */
    maxRide: 1400,
    skipTo: 650,
    /** Then it hops to a road near the player. */
    giveUpTime: 25,
  },

  leap: {
    minSpeed: 170,
    launchVz: 72,
    forwardFactor: 0.97,
    roofTime: 1.6,
    roofFailDamage: 25,
    roofThrowSpeed: 120,
    /** Landing on the ground above this horizontal speed hurts. */
    safeLandSpeed: 95,
    landDamagePerUnit: 0.13,
    landDamageMax: 38,
  },

  crash: {
    throwFactor: 0.55,
    throwVz: 52,
    baseDamage: 12,
    damagePerUnit: 0.1,
    maxDamage: 45,
  },

  gun: {
    magazine: 30,
    fireRate: 11,
    reloadTime: 1.5,
    damageCar: 6,
    damagePed: 34,
    range: 950,
    spread: 0.03,
    wheelHitRadius: 7,
    tyreBlowChance: 0.35,
    assistCone: 0.38,
    assistConeCivil: 0.16,
    assistRange: 720,
    muzzleHeight: 11,
  },

  katana: {
    range: 30,
    arcFoot: 2.5,
    arcBike: 3.9,
    cooldown: 0.42,
    damage: 40,
    wheelRadius: 11,
    spinMinSpeed: 55,
    spinAngular: 7.5,
    spinTime: 2.3,
    limpSpeed: 38,
  },

  car: {
    /** Top speeds sit under the bike's so a clean line can still outrun police and escorts. */
    specs: {
      sedan: { hl: 19, hw: 7.6, roof: 11.6, mass: 1500, maxSpeed: 120 * KMH, accel: 120, wheelbase: 23, hp: 100 },
      suv: { hl: 20, hw: 8.4, roof: 14.4, mass: 2300, maxSpeed: 110 * KMH, accel: 105, wheelbase: 24, hp: 150 },
      limo: { hl: 29, hw: 8, roof: 11.8, mass: 2900, maxSpeed: 105 * KMH, accel: 90, wheelbase: 38, hp: 170 },
      police: { hl: 19.5, hw: 7.8, roof: 12, mass: 1700, maxSpeed: 135 * KMH, accel: 140, wheelbase: 23, hp: 130 },
      hatch: { hl: 16, hw: 7, roof: 11.4, mass: 1100, maxSpeed: 105 * KMH, accel: 110, wheelbase: 20, hp: 80 },
      ute: { hl: 21, hw: 8, roof: 13.6, mass: 1900, maxSpeed: 105 * KMH, accel: 100, wheelbase: 26, hp: 110 },
      van: { hl: 21, hw: 8.4, roof: 16.5, mass: 2200, maxSpeed: 95 * KMH, accel: 85, wheelbase: 26, hp: 120 },
    } satisfies Record<CarModel, CarSpec>,
    grip: 14,
    yawResponse: 9,
    maxSteer: 0.62,
    brake: 230,
    /** Delta-v per step above which an impact hurts the car. */
    impactThreshold: 75,
    impactDamage: 0.45,
    spinImpactMul: 4.5,
    /** Spinning cars take damage from gentler impacts too. */
    spinThresholdMul: 0.5,
    spinGrip: 0.55,
    spinAngularDamp: 0.9,
    blownTyreGrip: 0.45,
    blownTyreSpeedMul: 0.55,
    smokeAt: 0.4,
    fireAt: 0.15,
    burnDps: 4,
    explodeDelay: 0.35,
    blastRadius: 170,
    blastCarDamage: 75,
    blastPlayerDamage: 70,
    blastImpulse: 520,
    wreckLife: 30,
  },

  traffic: {
    count: 24,
    cruiseSpeed: 112,
    boulevardSpeed: 150,
    turnSpeed: 58,
    followGap: 68,
    lookaheadBase: 34,
    lookaheadPerSpeed: 0.32,
    accel: 95,
    panicSpeedMul: 1.55,
    panicTime: 8,
    panicRadius: 420,
    spawnMin: 820,
    spawnMax: 1450,
    despawnDistance: 1650,
    intersectionTimeout: 4,
    stuckTime: 7,
    reverseTime: 1.4,
    respawnStuckTime: 8,
    ghostAfter: 10,
    ghostTime: 3,
    parkOffset: 44,
    maxParked: 28,
    overtakeAfter: 2.5,
    overtakeTime: 2.2,
    overtakeSpeed: 60,
  },

  danger: {
    /** Relative speed at contact: below light is a push only. */
    light: 70,
    /** At or above heavy the hit does a full health bar of damage before armour (so without armour it kills). */
    heavy: 235,
    mediumMinDamage: 18,
    mediumMaxDamage: 60,
    hitCooldown: 0.8,
  },

  escort: {
    shootRange: 460,
    burstShots: 5,
    burstGap: 1.4,
    fireRate: 7,
    bulletSpeed: 1350,
    bulletDamage: 5,
    spread: 0.055,
    ramSpeedMul: 1.2,
    backoffTime: 2.2,
    followGap: 75,
    engageRange: 900,
  },

  contracts: {
    firstRingDelay: 6,
    nextDelay: 10,
    retryDelay: 8,
    ringAutoRepeat: 3.5,
    meetingTime: 22,
    alertRadius: 170,
    gunfireAlertRadius: 460,
    spawnBlocksOut: 2,
    loopMultiplier: 1.5,
    arriveSpeed: 120,
    fleeSpeedMul: 1.35,
    reachRadius: 60,
    list: [
      { id: 'rane', target: 'Viktor Rane', alias: 'The Accountant', car: 'black sedan', model: 'sedan' as CarModel, color: 0x121316, from: 'Casino Strip', to: 'Harbour Docks', eta: 30, hp: 120, escorts: 0, escortRam: false, escortShoot: false, fee: 12000 },
      { id: 'kasai', target: 'Lena Kasai', alias: 'Mother Hen', car: 'armoured white SUV', model: 'suv' as CarModel, color: 0xe9e6de, from: 'Neon Market', to: 'Old Temple', eta: 35, hp: 190, escorts: 1, escortRam: false, escortShoot: true, fee: 25000 },
      { id: 'ormond', target: 'Judge Ormond', alias: 'The Magistrate', car: 'stretch limo', model: 'limo' as CarModel, color: 0x0d0e10, from: 'Old Temple', to: 'Rail Yard', eta: 40, hp: 240, escorts: 2, escortRam: true, escortShoot: true, fee: 50000 },
    ],
  },

  scoring: {
    multipliers: { gun: 1.0, blade: 1.5, crash: 1.6, roof: 2.0 } satisfies Record<KillMethod, number>,
    civilianPenalty: 2000,
  },

  heat: {
    enabled: true,
    max: 5,
    shotFired: 0.015,
    civilianCarDamaged: 0.12,
    civilianCarDestroyed: 1.0,
    pedHit: 0.6,
    killLoud: 1.7,
    killQuiet: 0.5,
    killCrash: 1.1,
    policeDamaged: 0.12,
    policeDestroyed: 1.2,
    decayDelay: 6,
    decayRate: 0.2,
    policeByStar: [0, 0, 2, 3, 4, 6],
    roadblockStars: 4,
    roadblockInterval: 22,
    shootStars: 3,
    spawnMin: 850,
    spawnMax: 1350,
    despawnDistance: 1900,
    losRange: 760,
    chaseDirectRange: 320,
  },

  peds: {
    count: 34,
    walkSpeed: 11,
    runSpeed: 42,
    radius: 2.6,
    scatterRadius: 380,
    scatterTime: 6,
    spawnMin: 250,
    spawnMax: 900,
    despawnDistance: 1100,
    knockSpeed: 40,
  },

  camera: {
    distance: 44,
    distanceFast: 58,
    height: 16,
    heightFast: 19,
    lookAhead: 34,
    lookHeight: 9,
    fov: 62,
    fovFast: 72,
    yawDamping: 6.5,
    posDamping: 11,
    footDistance: 40,
    footHeight: 21,
    airDistance: 60,
    airHeight: 30,
    roofDistance: 58,
    roofHeight: 38,
    clipPadding: 4,
    shakeDecay: 3.2,
    far: 5200,
  },

  time: {
    /** At night one real minute is one game hour: one real second is one game minute. */
    gameMinutesPerSecond: 1,
    /**
     * Full daylight (these hours) runs this much faster, so most play is at night:
     * a 17 minute cycle with about 11 minutes of night, 2 of dusk and dawn, 4 of day.
     */
    dayRate: 3,
    dayHours: [7, 18] as [number, number],
    startHour: 21.5,
  },

  weather: {
    /** Chance per game hour (one real minute) that rain starts when dry: a short shower every 20 minutes or so. */
    rainChancePerHour: 0.05,
    rainHours: [2, 4] as [number, number],
    wetRampSeconds: 20,
    dryRampSeconds: 60,
    lightningInterval: [6, 18] as [number, number],
    startRaining: false,
  },

  fx: {
    slowMoScale: 0.3,
    slowMoTime: 0.6,
    hitStopTime: 0.06,
  },
};

export type Tuning = typeof tuning;

/** Deep clone so tests can tweak numbers without touching the shared object. */
export function cloneTuning(): Tuning {
  return structuredClone(tuning);
}
