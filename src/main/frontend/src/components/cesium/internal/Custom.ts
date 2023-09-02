/* eslint-disable no-underscore-dangle,no-restricted-globals,@typescript-eslint/ban-ts-comment */
import {
  Camera,
  CameraEventAggregator,
  CameraEventType,
  Cartesian2,
  Cartesian3,
  Cartesian4,
  Cartographic,
  defaultValue,
  defined,
  DeveloperError,
  Ellipsoid,
  Globe,
  HeadingPitchRoll,
  IntersectionTests,
  KeyboardEventModifier,
  MapMode2D,
  Math as CesiumMath,
  Matrix3,
  Matrix4,
  OrthographicFrustum,
  Plane,
  Quaternion,
  Ray,
  Scene,
  SceneMode,
  SceneTransforms,
  ScreenSpaceCameraController,
  Transforms,
  Viewer,
} from 'cesium';

type Movement = {
  startPosition: Cartesian2;
  endPosition: Cartesian2;
  motion: Cartesian2;
  active: boolean;
  distance?: Movement;
  angleAndHeight?: Movement;
};

function sameMousePosition(movement: Movement) {
  return Cartesian2.equalsEpsilon(
    movement.startPosition,
    movement.endPosition,
    CesiumMath.EPSILON14,
  );
}

function decay(time: number, coefficient: number) {
  if (time < 0) {
    return 0.0;
  }

  const tau = (1.0 - coefficient) * 25.0;
  return Math.exp(-tau * time);
}

// If the time between mouse down and mouse up is not between
// these thresholds, the camera will not move with inertia.
// This value is probably dependent on the browser and/or the
// hardware. Should be investigated further.
const inertiaMaxClickTimeThreshold = 0.4;

function maintainInertia(
  aggregator: CameraEventAggregator,
  type: CameraEventType,
  modifier: KeyboardEventModifier,
  decayCoef: number,
  action: any,
  object: CustomScreenSpaceCameraController,
  lastMovementName: string,
) {
  // @ts-ignore
  let movementState = object[lastMovementName];
  if (!defined(movementState)) {
    // @ts-ignore
    object[lastMovementName] = {
      startPosition: new Cartesian2(),
      endPosition: new Cartesian2(),
      motion: new Cartesian2(),
      active: false,
    };
    // @ts-ignore
    movementState = object[lastMovementName];
  }

  const ts = aggregator.getButtonPressTime(type, modifier);
  const tr = aggregator.getButtonReleaseTime(type, modifier);

  const threshold = ts && tr && (tr.getTime() - ts.getTime()) / 1000.0;
  const now = new Date();
  const fromNow = tr && (now.getTime() - tr.getTime()) / 1000.0;

  if (ts && tr && threshold < inertiaMaxClickTimeThreshold) {
    const d = decay(fromNow, decayCoef);

    if (!movementState.active) {
      const lastMovement = aggregator.getLastMovement(type, modifier);
      if (!defined(lastMovement) || sameMousePosition(lastMovement)) {
        return;
      }

      movementState.motion.x = (lastMovement.endPosition.x - lastMovement.startPosition.x) * 0.5;
      movementState.motion.y = (lastMovement.endPosition.y - lastMovement.startPosition.y) * 0.5;

      movementState.startPosition = Cartesian2.clone(
        lastMovement.startPosition,
        movementState.startPosition,
      );

      movementState.endPosition = Cartesian2.multiplyByScalar(
        movementState.motion,
        d,
        movementState.endPosition,
      );
      movementState.endPosition = Cartesian2.add(
        movementState.startPosition,
        movementState.endPosition,
        movementState.endPosition,
      );

      movementState.active = true;
    } else {
      movementState.startPosition = Cartesian2.clone(
        movementState.endPosition,
        movementState.startPosition,
      );

      movementState.endPosition = Cartesian2.multiplyByScalar(
        movementState.motion,
        d,
        movementState.endPosition,
      );
      movementState.endPosition = Cartesian2.add(
        movementState.startPosition,
        movementState.endPosition,
        movementState.endPosition,
      );

      movementState.motion = Cartesian2.clone(
        Cartesian2.ZERO,
        movementState.motion,
      );
    }

    // If value from the decreasing exponential function is close to zero,
    // the end coordinates may be NaN.
    if (
      isNaN(movementState.endPosition.x)
        || isNaN(movementState.endPosition.y)
        || Cartesian2.distance(
          movementState.startPosition,
          movementState.endPosition,
        ) < 0.5
    ) {
      movementState.active = false;
      return;
    }

    if (!aggregator.isButtonDown(type, modifier)) {
      const startPosition = aggregator.getStartMousePosition(type, modifier);
      action(object, startPosition, movementState);
    }
  } else {
    movementState.active = false;
  }
}

const scratchEventTypeArray: CameraEventType[] = [];

function reactToInput(
  controller: CustomScreenSpaceCameraController,
  enabled: boolean,
  eventTypes: any[] | CameraEventType | undefined,
  action: any,
  inertiaConstant?: number,
  inertiaStateName?: string,
) {
  if (!defined(eventTypes)) {
    return;
  }

  const aggregator = controller._aggregator;

  if (!Array.isArray(eventTypes)) {
    scratchEventTypeArray[0] = eventTypes as CameraEventType;
    eventTypes = scratchEventTypeArray;
  }

  const length = eventTypes.length;
  for (let i = 0; i < length; ++i) {
    const eventType = eventTypes[i];
    const type = defined(eventType.eventType) ? eventType.eventType : eventType;
    const modifier = eventType.modifier;

    const movement = aggregator.isMoving(type, modifier)
        && aggregator.getMovement(type, modifier);
    const startPosition = aggregator.getStartMousePosition(type, modifier);

    if (controller.enableInputs && enabled) {
      if (movement) {
        action(controller, startPosition, movement);
      } else if (inertiaStateName && inertiaConstant && inertiaConstant < 1.0) {
        maintainInertia(
          aggregator,
          type,
          modifier,
          inertiaConstant,
          action,
          controller,
          inertiaStateName,
        );
      }
    }
  }
}

const pickGlobeScratchRay = new Ray();
const scratchDepthIntersection = new Cartesian3();
const scratchRayIntersection = new Cartesian3();
function pickGlobe(controller: CustomScreenSpaceCameraController, mousePosition: Cartesian2, result: Cartesian3) {
  const scene = controller._scene;
  const globe = controller._globe;
  const camera = scene.camera;

  if (!defined(globe)) {
    return undefined;
  }

  let depthIntersection;
  if (scene.pickPositionSupported) {
    depthIntersection = scene.pickPosition(
      mousePosition,
      scratchDepthIntersection,
    );
  }

  const ray = camera.getPickRay(mousePosition, pickGlobeScratchRay);

  if (!ray) {
    return undefined;
  }

  const rayIntersection = globe?.pick(
    ray,
    scene,
    scratchRayIntersection,
  );

  const pickDistance = defined(depthIntersection)
    ? Cartesian3.distance(depthIntersection as Cartesian3, camera.positionWC)
    : Number.POSITIVE_INFINITY;
  const rayDistance = defined(rayIntersection)
    ? Cartesian3.distance(rayIntersection as Cartesian3, camera.positionWC)
    : Number.POSITIVE_INFINITY;

  if (pickDistance < rayDistance) {
    if (!defined(depthIntersection)) {
      return undefined;
    }
    return Cartesian3.clone(depthIntersection as Cartesian3, result);
  }

  if (!defined(rayIntersection)) {
    return undefined;
  }
  return Cartesian3.clone(rayIntersection as Cartesian3, result);
}

const scratchStrafeRay = new Ray();
const scratchStrafePlane = new Plane(Cartesian3.UNIT_X, 0.0);
const scratchStrafeIntersection = new Cartesian3();
const scratchStrafeDirection = new Cartesian3();
const scratchMousePos = new Cartesian3();
function strafe(controller: CustomScreenSpaceCameraController, startPosition: Cartesian2, movement: Movement) {
  const scene = controller._scene;
  const camera = scene.camera;

  const mouseStartPosition = pickGlobe(
    controller,
    movement.startPosition,
    scratchMousePos,
  );
  if (!defined(mouseStartPosition)) {
    return;
  }

  const mousePosition = movement.endPosition;
  const ray = camera.getPickRay(mousePosition, scratchStrafeRay);

  if (!defined(ray)) {
    return;
  }

  let direction = Cartesian3.clone(camera.direction, scratchStrafeDirection);
  if (scene.mode === SceneMode.COLUMBUS_VIEW) {
    Cartesian3.fromElements(direction.z, direction.x, direction.y, direction);
  }

  const plane = Plane.fromPointNormal(
    mouseStartPosition as Cartesian3,
    direction,
    scratchStrafePlane,
  );
  const intersection = IntersectionTests.rayPlane(
    ray as Ray,
    plane,
    scratchStrafeIntersection,
  );
  if (!defined(intersection)) {
    return;
  }

  direction = Cartesian3.subtract(mouseStartPosition as Cartesian3, intersection, direction);
  if (scene.mode === SceneMode.COLUMBUS_VIEW) {
    Cartesian3.fromElements(direction.y, direction.z, direction.x, direction);
  }

  Cartesian3.add(camera.position, direction, camera.position);
}

const scratchZoomViewOptions = {
  orientation: new HeadingPitchRoll(),
};
function handleZoomPolar(
  object: CustomScreenSpaceCameraController,
  startPosition: Cartesian2,
  movement: Movement,
  zoomFactor: number,
  distanceMeasure: number,
  unitPositionDotDirection: number,
) {
  let percentage = 1.0;
  if (defined(unitPositionDotDirection)) {
    percentage = CesiumMath.clamp(
      Math.abs(unitPositionDotDirection),
      0.25,
      1.0,
    );
  }

  // distanceMeasure should be the height above the ellipsoid.
  // The zoomRate slows as it approaches the surface and stops minimumZoomDistance above it.
  const minHeight = object.minimumZoomDistance * percentage;
  const maxHeight = object.maximumZoomDistance;

  const minDistance = distanceMeasure - minHeight;
  let zoomRate = zoomFactor * minDistance;
  zoomRate = CesiumMath.clamp(
    zoomRate,
    object._minimumZoomRate,
    object._maximumZoomRate,
  );

  const diff = movement.endPosition.y - movement.startPosition.y;
  let rangeWindowRatio = diff / object._scene.canvas.clientHeight;
  rangeWindowRatio = Math.min(rangeWindowRatio, object.maximumMovementRatio);
  let distance = zoomRate * rangeWindowRatio;

  if (distance > 0.0 && Math.abs(distanceMeasure - minHeight) < 1.0) {
    return;
  }

  if (distance < 0.0 && Math.abs(distanceMeasure - maxHeight) < 1.0) {
    return;
  }

  if (distanceMeasure - distance < minHeight) {
    distance = distanceMeasure - minHeight - 1.0;
  } else if (distanceMeasure - distance > maxHeight) {
    distance = distanceMeasure - maxHeight;
  }

  const scene = object._scene;
  const camera = scene.camera;

  const orientation = scratchZoomViewOptions.orientation;
  orientation.heading = camera.heading;
  orientation.pitch = camera.pitch;
  orientation.roll = camera.roll;

  camera.zoomIn(distance);
}

const zoomCVWindowPos = new Cartesian2();
const zoomCVWindowRay = new Ray();
const zoomCVIntersection = new Cartesian3();
const zoom3DCartographic = new Cartographic();
const zoom3DUnitPosition = new Cartesian3();
function zoomPolar(controller: CustomScreenSpaceCameraController, startPosition: Cartesian2, movement: Movement) {
  if (defined(movement.distance)) {
    movement = movement.distance as Movement;
  }

  const ellipsoid = controller._ellipsoid;
  const scene = controller._scene;
  const camera = scene.camera;
  const canvas = scene.canvas;

  const windowPosition = zoomCVWindowPos;
  windowPosition.x = canvas.clientWidth / 2;
  windowPosition.y = canvas.clientHeight / 2;
  const ray = camera.getPickRay(windowPosition, zoomCVWindowRay);

  if (!defined(ray)) {
    return;
  }

  let intersection;
  const height = ellipsoid?.cartesianToCartographic(
    camera.position,
    zoom3DCartographic,
  ).height;
  if (height && height < controller.minimumPickingTerrainHeight) {
    intersection = pickGlobe(controller, windowPosition, zoomCVIntersection);
  }

  let distance;
  if (defined(intersection)) {
    distance = Cartesian3.distance(ray?.origin as Cartesian3, intersection as Cartesian3);
  } else {
    distance = height;
  }

  const unitPosition = Cartesian3.normalize(camera.position, zoom3DUnitPosition);

  if (!defined(distance)) {
    return;
  }

  handleZoomPolar(
    controller,
    startPosition,
    movement,
    controller._zoomFactor,
    distance as number,
    Cartesian3.dot(unitPosition, camera.direction),
  );
}

function updatePolar(controller: CustomScreenSpaceCameraController) {
  controller._horizontalRotationAxis = undefined;
  reactToInput(
    controller,
    true,
    controller.rotateEventTypes,
    strafe,
    controller.inertiaTranslate,
    '_lastInertiaTranslateMovement',
  );
  reactToInput(
    controller,
    true,
    controller.zoomEventTypes,
    zoomPolar,
    controller.inertiaZoom,
    '_lastInertiaZoomMovement',
  );
}

const scratchAdjustHeightTransform = new Matrix4();
const scratchAdjustHeightCartographic = new Cartographic();
function adjustHeightForTerrain(controller: CustomScreenSpaceCameraController) {
  controller._adjustedHeightForTerrain = true;

  const scene = controller._scene;
  const mode = scene.mode;
  const globe = scene.globe;

  if (
    !defined(globe)
      || mode === SceneMode.SCENE2D
      || mode === SceneMode.MORPHING
  ) {
    return;
  }

  const camera = scene.camera;
  const ellipsoid = globe.ellipsoid;
  const projection = scene.mapProjection;

  let transform;
  let mag;
  if (!Matrix4.equals(camera.transform, Matrix4.IDENTITY)) {
    transform = Matrix4.clone(camera.transform, scratchAdjustHeightTransform);
    mag = Cartesian3.magnitude(camera.position);
    camera._setTransform(Matrix4.IDENTITY);
  }

  const cartographic = scratchAdjustHeightCartographic;
  if (mode === SceneMode.SCENE3D) {
    ellipsoid.cartesianToCartographic(camera.position, cartographic);
  } else {
    projection.unproject(camera.position, cartographic);
  }

  let heightUpdated = false;
  if (cartographic.height < controller.minimumCollisionTerrainHeight) {
    let height = globe.getHeight(cartographic);
    if (defined(height)) {
      height = height as number;
      height += controller.minimumZoomDistance;
      if (cartographic.height < height) {
        cartographic.height = height;
        if (mode === SceneMode.SCENE3D) {
          ellipsoid.cartographicToCartesian(cartographic, camera.position);
        } else {
          projection.project(cartographic, camera.position);
        }
        heightUpdated = true;
      }
    }
  }

  if (defined(transform) && mag) {
    camera._setTransform(transform as Matrix4);
    if (heightUpdated) {
      Cartesian3.normalize(camera.position, camera.position);
      Cartesian3.negate(camera.position, camera.direction);
      Cartesian3.multiplyByScalar(
        camera.position,
        Math.max(mag, controller.minimumZoomDistance),
        camera.position,
      );
      Cartesian3.normalize(camera.direction, camera.direction);
      Cartesian3.cross(camera.direction, camera.up, camera.right);
      Cartesian3.cross(camera.right, camera.direction, camera.up);
    }
  }
}

const look3DStartPos = new Cartesian2();
const look3DEndPos = new Cartesian2();
const look3DStartRay = new Ray();
const look3DEndRay = new Ray();
const look3DNegativeRot = new Cartesian3();
const look3DTan = new Cartesian3();

function look3D(controller: CustomScreenSpaceCameraController, startPosition: Cartesian2, movement: Movement, rotationAxis: Cartesian3) {
  const scene = controller._scene;
  const camera = scene.camera;

  const startPos = look3DStartPos;
  startPos.x = movement.startPosition.x;
  startPos.y = 0.0;
  const endPos = look3DEndPos;
  endPos.x = movement.endPosition.x;
  endPos.y = 0.0;

  let startRay = camera.getPickRay(startPos, look3DStartRay);
  let endRay = camera.getPickRay(endPos, look3DEndRay);

  if (!startRay || !endRay) {
    return;
  }

  let angle = 0.0;
  let start;
  let end;

  if (camera.frustum instanceof OrthographicFrustum) {
    start = startRay.origin;
    end = endRay.origin;

    Cartesian3.add(camera.direction, start, start);
    Cartesian3.add(camera.direction, end, end);

    Cartesian3.subtract(start, camera.position, start);
    Cartesian3.subtract(end, camera.position, end);

    Cartesian3.normalize(start, start);
    Cartesian3.normalize(end, end);
  } else {
    start = startRay.direction;
    end = endRay.direction;
  }

  let dot = Cartesian3.dot(start, end);
  if (dot < 1.0) {
    // dot is in [0, 1]
    angle = Math.acos(dot);
  }

  angle = movement.startPosition.x > movement.endPosition.x ? -angle : angle;

  const horizontalRotationAxis = controller._horizontalRotationAxis;
  if (defined(rotationAxis)) {
    camera.look(rotationAxis, -angle);
  } else if (defined(horizontalRotationAxis)) {
    camera.look(horizontalRotationAxis as Cartesian3, -angle);
  } else {
    camera.lookLeft(angle);
  }

  startPos.x = 0.0;
  startPos.y = movement.startPosition.y;
  endPos.x = 0.0;
  endPos.y = movement.endPosition.y;

  startRay = camera.getPickRay(startPos, look3DStartRay);
  endRay = camera.getPickRay(endPos, look3DEndRay);

  if (!startRay || !endRay) {
    return;
  }

  angle = 0.0;

  if (camera.frustum instanceof OrthographicFrustum) {
    start = startRay.origin;
    end = endRay.origin;

    Cartesian3.add(camera.direction, start, start);
    Cartesian3.add(camera.direction, end, end);

    Cartesian3.subtract(start, camera.position, start);
    Cartesian3.subtract(end, camera.position, end);

    Cartesian3.normalize(start, start);
    Cartesian3.normalize(end, end);
  } else {
    start = startRay.direction;
    end = endRay.direction;
  }

  dot = Cartesian3.dot(start, end);
  if (dot < 1.0) {
    // dot is in [0, 1]
    angle = Math.acos(dot);
  }
  angle = movement.startPosition.y > movement.endPosition.y ? -angle : angle;

  rotationAxis = defaultValue(rotationAxis, horizontalRotationAxis);
  if (defined(rotationAxis)) {
    const direction = camera.direction;
    const negativeRotationAxis = Cartesian3.negate(
      rotationAxis,
      look3DNegativeRot,
    );
    const northParallel = Cartesian3.equalsEpsilon(
      direction,
      rotationAxis,
      CesiumMath.EPSILON2,
    );
    const southParallel = Cartesian3.equalsEpsilon(
      direction,
      negativeRotationAxis,
      CesiumMath.EPSILON2,
    );
    if (!northParallel && !southParallel) {
      dot = Cartesian3.dot(direction, rotationAxis);
      let angleToAxis = CesiumMath.acosClamped(dot);
      if (angle > 0 && angle > angleToAxis) {
        angle = angleToAxis - CesiumMath.EPSILON4;
      }

      dot = Cartesian3.dot(direction, negativeRotationAxis);
      angleToAxis = CesiumMath.acosClamped(dot);
      if (angle < 0 && -angle > angleToAxis) {
        angle = -angleToAxis + CesiumMath.EPSILON4;
      }

      const tangent = Cartesian3.cross(rotationAxis, direction, look3DTan);
      camera.look(tangent, angle);
    } else if ((northParallel && angle < 0) || (southParallel && angle > 0)) {
      camera.look(camera.right, -angle);
    }
  } else {
    camera.lookUp(angle);
  }
}

const tilt3DWindowPos = new Cartesian2();
const tilt3DRay = new Ray();
const tilt3DCenter = new Cartesian3();
const tilt3DVerticalCenter = new Cartesian3();
const tilt3DTransform = new Matrix4();
const tilt3DVerticalTransform = new Matrix4();
const tilt3DOldTransform = new Matrix4();
const tilt3DQuaternion = new Quaternion();
const tilt3DMatrix = new Matrix3();
const tilt3DCart = new Cartographic();
const tilt3DLookUp = new Cartesian3();
const tilt3DOnEllipsoidCartographic = new Cartographic();
const tilt3DCartesian3 = new Cartesian3();

function rotate3D(
  controller: CustomScreenSpaceCameraController,
  startPosition: Cartesian2,
  movement: Movement,
  constrainedAxis?: Cartesian3,
  rotateOnlyVertical?: boolean,
  rotateOnlyHorizontal?: boolean,
) {
  rotateOnlyVertical = defaultValue(rotateOnlyVertical, false);
  rotateOnlyHorizontal = defaultValue(rotateOnlyHorizontal, false);

  const scene = controller._scene;
  const camera = scene.camera;
  const canvas = scene.canvas;

  const oldAxis = camera.constrainedAxis;
  if (defined(constrainedAxis)) {
    camera.constrainedAxis = constrainedAxis as Cartesian3;
  }

  const rho = Cartesian3.magnitude(camera.position);

  if (!controller._rotateFactor && !controller._rotateRateRangeAdjustment) {
    controller._rotateFactor = 0.5;
    controller._rotateRateRangeAdjustment = 0.5;
  }

  let rotateRate = controller._rotateFactor as number * (rho - (controller._rotateRateRangeAdjustment as number));

  if (rotateRate > controller._maximumRotateRate) {
    rotateRate = controller._maximumRotateRate;
  }

  if (rotateRate < controller._minimumRotateRate) {
    rotateRate = controller._minimumRotateRate;
  }

  let phiWindowRatio = (movement.startPosition.x - movement.endPosition.x) / canvas.clientWidth;
  let thetaWindowRatio = (movement.startPosition.y - movement.endPosition.y) / canvas.clientHeight;
  phiWindowRatio = Math.min(phiWindowRatio, controller.maximumMovementRatio);
  thetaWindowRatio = Math.min(
    thetaWindowRatio,
    controller.maximumMovementRatio,
  );

  const deltaPhi = rotateRate * phiWindowRatio * Math.PI * 2.0;
  const deltaTheta = rotateRate * thetaWindowRatio * Math.PI;

  if (!rotateOnlyVertical) {
    camera.rotateRight(deltaPhi);
  }

  if (!rotateOnlyHorizontal) {
    camera.rotateUp(deltaTheta);
  }

  camera.constrainedAxis = oldAxis;
}

const scratchRadii = new Cartesian3();
const scratchEllipsoid = new Ellipsoid();
function tilt3DOnEllipsoid(controller: CustomScreenSpaceCameraController, startPosition: Cartesian2, movement: Movement) {
  const ellipsoid = controller._ellipsoid;
  const scene = controller._scene;
  const camera = scene.camera;
  const minHeight = controller.minimumZoomDistance * 0.25;
  const height = ellipsoid?.cartesianToCartographic(
    camera.positionWC,
    tilt3DOnEllipsoidCartographic,
  ).height;
  if (
    !height || (height - minHeight - 1.0 < CesiumMath.EPSILON3
      && movement.endPosition.y - movement.startPosition.y < 0)
  ) {
    return;
  }

  const canvas = scene.canvas;

  const windowPosition = tilt3DWindowPos;
  windowPosition.x = canvas.clientWidth / 2;
  windowPosition.y = canvas.clientHeight / 2;
  const ray = camera.getPickRay(windowPosition, tilt3DRay);

  if (!ray) {
    return;
  }

  let center;
  const intersection = IntersectionTests.rayEllipsoid(ray, ellipsoid);
  if (defined(intersection)) {
    center = Ray.getPoint(ray, intersection.start, tilt3DCenter);
  } else if (height > controller.minimumTrackBallHeight) {
    const grazingAltitudeLocation = IntersectionTests.grazingAltitudeLocation(
      ray,
      ellipsoid,
    );
    if (!defined(grazingAltitudeLocation)) {
      return;
    }
    const grazingAltitudeCart = ellipsoid.cartesianToCartographic(
      grazingAltitudeLocation,
      tilt3DCart,
    );
    grazingAltitudeCart.height = 0.0;
    center = ellipsoid.cartographicToCartesian(
      grazingAltitudeCart,
      tilt3DCenter,
    );
  } else {
    controller._looking = true;
    const up = controller._ellipsoid?.geodeticSurfaceNormal(
      camera.position,
      tilt3DLookUp,
    );
    if (!up) {
      return;
    }
    look3D(controller, startPosition, movement, up);
    Cartesian2.clone(startPosition, controller._tiltCenterMousePosition);
    return;
  }

  const transform = Transforms.eastNorthUpToFixedFrame(
    center,
    ellipsoid,
    tilt3DTransform,
  );

  const oldGlobe = controller._globe;
  const oldEllipsoid = controller._ellipsoid;
  controller._globe = undefined;
  controller._ellipsoid = Ellipsoid.UNIT_SPHERE;
  controller._rotateFactor = 1.0;
  controller._rotateRateRangeAdjustment = 1.0;

  const oldTransform = Matrix4.clone(camera.transform, tilt3DOldTransform);
  camera._setTransform(transform);

  rotate3D(controller, startPosition, movement, Cartesian3.UNIT_Z);

  camera._setTransform(oldTransform);
  controller._globe = oldGlobe;
  controller._ellipsoid = oldEllipsoid;

  const radius = oldEllipsoid?.maximumRadius;
  if (!radius) {
    return;
  }
  controller._rotateFactor = 1.0 / radius;
  controller._rotateRateRangeAdjustment = radius;
}

function tilt3DOnTerrain(controller: CustomScreenSpaceCameraController, startPosition: Cartesian2, movement: Movement) {
  const ellipsoid = controller._ellipsoid;
  if (!ellipsoid) {
    return;
  }
  const scene = controller._scene;
  const camera = scene.camera;

  let center;
  let ray;
  let intersection;

  if (Cartesian2.equals(startPosition, controller._tiltCenterMousePosition)) {
    center = Cartesian3.clone(controller._tiltCenter, tilt3DCenter);
  } else {
    center = pickGlobe(controller, startPosition, tilt3DCenter);

    if (!defined(center)) {
      ray = camera.getPickRay(startPosition, tilt3DRay);
      if (!ray) {
        return;
      }
      intersection = IntersectionTests.rayEllipsoid(ray, ellipsoid);
      if (!defined(intersection)) {
        const cartographic = ellipsoid.cartesianToCartographic(
          camera.position,
          tilt3DCart,
        );
        if (cartographic.height <= controller.minimumTrackBallHeight) {
          controller._looking = true;
          const up = controller._ellipsoid?.geodeticSurfaceNormal(
            camera.position,
            tilt3DLookUp,
          );
          if (!up) {
            return;
          }
          look3D(controller, startPosition, movement, up);
          Cartesian2.clone(startPosition, controller._tiltCenterMousePosition);
        }
        return;
      }
      center = Ray.getPoint(ray, intersection.start, tilt3DCenter);
    }

    Cartesian2.clone(startPosition, controller._tiltCenterMousePosition);
    if (center) {
      Cartesian3.clone(center, controller._tiltCenter);
    }
  }

  const canvas = scene.canvas;

  const windowPosition = tilt3DWindowPos;
  windowPosition.x = canvas.clientWidth / 2;
  windowPosition.y = controller._tiltCenterMousePosition.y;
  ray = camera.getPickRay(windowPosition, tilt3DRay);

  if (!center || !ray) {
    return;
  }

  const mag = Cartesian3.magnitude(center);
  const radii = Cartesian3.fromElements(mag, mag, mag, scratchRadii);
  const newEllipsoid = Ellipsoid.fromCartesian3(radii, scratchEllipsoid);

  intersection = IntersectionTests.rayEllipsoid(ray, newEllipsoid);
  if (!defined(intersection)) {
    return;
  }

  const t = Cartesian3.magnitude(ray.origin) > mag
    ? intersection.start
    : intersection.stop;
  const verticalCenter = Ray.getPoint(ray, t, tilt3DVerticalCenter);

  const transform = Transforms.eastNorthUpToFixedFrame(
    center,
    ellipsoid,
    tilt3DTransform,
  );
  const verticalTransform = Transforms.eastNorthUpToFixedFrame(
    verticalCenter,
    newEllipsoid,
    tilt3DVerticalTransform,
  );

  const oldGlobe = controller._globe;
  const oldEllipsoid = controller._ellipsoid;
  controller._globe = undefined;
  controller._ellipsoid = Ellipsoid.UNIT_SPHERE;
  controller._rotateFactor = 1.0;
  controller._rotateRateRangeAdjustment = 1.0;

  let constrainedAxis: Cartesian3 | undefined = Cartesian3.UNIT_Z;

  const oldTransform = Matrix4.clone(camera.transform, tilt3DOldTransform);
  camera._setTransform(transform);

  const tangent = Cartesian3.cross(
    verticalCenter,
    camera.positionWC,
    tilt3DCartesian3,
  );
  const dot = Cartesian3.dot(camera.rightWC, tangent);

  rotate3D(controller, startPosition, movement, constrainedAxis, false, true);

  camera._setTransform(verticalTransform);

  if (dot < 0.0) {
    if (movement.startPosition.y > movement.endPosition.y) {
      constrainedAxis = undefined;
    }

    const oldConstrainedAxis = camera.constrainedAxis;
    camera.constrainedAxis = Cartesian3.UNIT_Z;

    if (!constrainedAxis) {
      constrainedAxis = Cartesian3.UNIT_Z;
    }

    rotate3D(controller, startPosition, movement, constrainedAxis, true, false);

    camera.constrainedAxis = oldConstrainedAxis;
  } else {
    rotate3D(controller, startPosition, movement, constrainedAxis, true, false);
  }

  if (defined(camera.constrainedAxis)) {
    const right = Cartesian3.cross(
      camera.direction,
      camera.constrainedAxis,
      tilt3DCartesian3,
    );
    if (
      !Cartesian3.equalsEpsilon(right, Cartesian3.ZERO, CesiumMath.EPSILON6)
    ) {
      if (Cartesian3.dot(right, camera.right) < 0.0) {
        Cartesian3.negate(right, right);
      }

      Cartesian3.cross(right, camera.direction, camera.up);
      Cartesian3.cross(camera.direction, camera.up, camera.right);

      Cartesian3.normalize(camera.up, camera.up);
      Cartesian3.normalize(camera.right, camera.right);
    }
  }

  camera._setTransform(oldTransform);
  controller._globe = oldGlobe;
  controller._ellipsoid = oldEllipsoid;

  const radius = oldEllipsoid?.maximumRadius;

  if (!radius) {
    return;
  }

  controller._rotateFactor = 1.0 / radius;
  controller._rotateRateRangeAdjustment = radius;

  const originalPosition = Cartesian3.clone(camera.positionWC, tilt3DCartesian3);

  if (controller.enableCollisionDetection) {
    adjustHeightForTerrain(controller);
  }

  if (!Cartesian3.equals(camera.positionWC, originalPosition)) {
    camera._setTransform(verticalTransform);
    camera.worldToCameraCoordinatesPoint(originalPosition, originalPosition);

    const magSqrd = Cartesian3.magnitudeSquared(originalPosition);
    if (Cartesian3.magnitudeSquared(camera.position) > magSqrd) {
      Cartesian3.normalize(camera.position, camera.position);
      Cartesian3.multiplyByScalar(
        camera.position,
        Math.sqrt(magSqrd),
        camera.position,
      );
    }

    const angle = Cartesian3.angleBetween(originalPosition, camera.position);
    const axis = Cartesian3.cross(
      originalPosition,
      camera.position,
      originalPosition,
    );
    Cartesian3.normalize(axis, axis);

    const quaternion = Quaternion.fromAxisAngle(axis, angle, tilt3DQuaternion);
    const rotation = Matrix3.fromQuaternion(quaternion, tilt3DMatrix);
    Matrix3.multiplyByVector(rotation, camera.direction, camera.direction);
    Matrix3.multiplyByVector(rotation, camera.up, camera.up);
    Cartesian3.cross(camera.direction, camera.up, camera.right);
    Cartesian3.cross(camera.right, camera.direction, camera.up);

    camera._setTransform(oldTransform);
  }
}

function tilt3D(controller: CustomScreenSpaceCameraController, startPosition: Cartesian2, movement: Movement) {
  const scene = controller._scene;
  const camera = scene.camera;

  if (!Matrix4.equals(camera.transform, Matrix4.IDENTITY)) {
    return;
  }

  if (defined(movement.angleAndHeight)) {
    movement = movement.angleAndHeight as Movement;
  }

  if (!Cartesian2.equals(startPosition, controller._tiltCenterMousePosition)) {
    controller._tiltOnEllipsoid = false;
    controller._looking = false;
  }

  if (controller._looking) {
    const up = controller._ellipsoid?.geodeticSurfaceNormal(
      camera.position,
      tilt3DLookUp,
    );

    if (!up) {
      return;
    }

    look3D(controller, startPosition, movement, up);
    return;
  }

  const ellipsoid = controller._ellipsoid;
  const cartographic = ellipsoid?.cartesianToCartographic(
    camera.position,
    tilt3DCart,
  );

  if (
    cartographic && (controller._tiltOnEllipsoid
      || cartographic.height > controller.minimumCollisionTerrainHeight)
  ) {
    controller._tiltOnEllipsoid = true;
    tilt3DOnEllipsoid(controller, startPosition, movement);
  } else {
    tilt3DOnTerrain(controller, startPosition, movement);
  }
}

const scratchZoomPickRay = new Ray();
const scratchPickCartesian = new Cartesian3();
const scratchZoomOffset = new Cartesian2();
const scratchZoomDirection = new Cartesian3();
const scratchCenterPixel = new Cartesian2();
const scratchCenterPosition = new Cartesian3();
const scratchPositionNormal = new Cartesian3();
const scratchPickNormal = new Cartesian3();
const scratchZoomAxis = new Cartesian3();
const scratchCameraPositionNormal = new Cartesian3();

// Scratch variables used in zooming algorithm
const scratchTargetNormal = new Cartesian3();
const scratchCameraPosition = new Cartesian3();
const scratchCameraUpNormal = new Cartesian3();
const scratchCameraRightNormal = new Cartesian3();
const scratchForwardNormal = new Cartesian3();
const scratchPositionToTarget = new Cartesian3();
const scratchPositionToTargetNormal = new Cartesian3();
const scratchPan = new Cartesian3();
const scratchCenterMovement = new Cartesian3();
const scratchCenter = new Cartesian3();
const scratchCartesian = new Cartesian3();
const scratchCartesianTwo = new Cartesian3();
const scratchCartesianThree = new Cartesian3();

function handleZoom(
  object: CustomScreenSpaceCameraController,
  startPosition: Cartesian2,
  movement: Movement,
  zoomFactor: number,
  distanceMeasure: number,
  unitPositionDotDirection?: number,
) {
  let percentage = 1.0;
  if (defined(unitPositionDotDirection)) {
    percentage = CesiumMath.clamp(
      Math.abs(unitPositionDotDirection as number),
      0.25,
      1.0,
    );
  }

  // distanceMeasure should be the height above the ellipsoid.
  // The zoomRate slows as it approaches the surface and stops minimumZoomDistance above it.
  const minHeight = object.minimumZoomDistance * percentage;
  const maxHeight = object.maximumZoomDistance;

  const minDistance = distanceMeasure - minHeight;
  let zoomRate = zoomFactor * minDistance;
  zoomRate = CesiumMath.clamp(
    zoomRate,
    object._minimumZoomRate,
    object._maximumZoomRate,
  );

  const diff = movement.endPosition.y - movement.startPosition.y;
  let rangeWindowRatio = diff / object._scene.canvas.clientHeight;
  rangeWindowRatio = Math.min(rangeWindowRatio, object.maximumMovementRatio);
  let distance = zoomRate * rangeWindowRatio;

  if (distance > 0.0 && Math.abs(distanceMeasure - minHeight) < 1.0) {
    return;
  }

  if (distance < 0.0 && Math.abs(distanceMeasure - maxHeight) < 1.0) {
    return;
  }

  if (distanceMeasure - distance < minHeight) {
    distance = distanceMeasure - minHeight - 1.0;
  } else if (distanceMeasure - distance > maxHeight) {
    distance = distanceMeasure - maxHeight;
  }

  const scene = object._scene;
  const camera = scene.camera;
  const mode = scene.mode;

  const orientation = scratchZoomViewOptions.orientation;
  orientation.heading = camera.heading;
  orientation.pitch = camera.pitch;
  orientation.roll = camera.roll;

  if (camera.frustum instanceof OrthographicFrustum) {
    if (Math.abs(distance) > 0.0) {
      camera.zoomIn(distance);
      // @ts-ignore
      camera._adjustOrthographicFrustum();
    }
    return;
  }

  const sameStartPosition = Cartesian2.equals(
    startPosition,
    object._zoomMouseStart,
  );
  let zoomingOnVector = object._zoomingOnVector;
  let rotatingZoom = object._rotatingZoom;
  let pickedPosition;

  if (!sameStartPosition) {
    object._zoomMouseStart = Cartesian2.clone(
      startPosition,
      object._zoomMouseStart,
    );

    if (defined(object._globe)) {
      if (mode === SceneMode.SCENE2D) {
        pickedPosition = camera.getPickRay(startPosition, scratchZoomPickRay)?.origin;
        if (!pickedPosition) {
          return;
        }
        pickedPosition = Cartesian3.fromElements(
          pickedPosition.y,
          pickedPosition.z,
          pickedPosition.x,
        );
      } else {
        pickedPosition = pickGlobe(object, startPosition, scratchPickCartesian);
      }
    }
    if (defined(pickedPosition)) {
      object._useZoomWorldPosition = true;
      object._zoomWorldPosition = Cartesian3.clone(
        pickedPosition as Cartesian3,
        object._zoomWorldPosition,
      );
    } else {
      object._useZoomWorldPosition = false;
    }

    object._zoomingOnVector = false;
    zoomingOnVector = object._zoomingOnVector;
    object._rotatingZoom = false;
    rotatingZoom = object._rotatingZoom;
  }

  if (!object._useZoomWorldPosition) {
    camera.zoomIn(distance);
    return;
  }

  let zoomOnVector = mode === SceneMode.COLUMBUS_VIEW;

  if (camera.positionCartographic.height < 2000000) {
    rotatingZoom = true;
  }

  if (!sameStartPosition || rotatingZoom) {
    if (mode === SceneMode.SCENE2D) {
      const worldPosition = object._zoomWorldPosition;
      if (!worldPosition) {
        return;
      }
      const endPosition = camera.position;

      if (
        !Cartesian3.equals(worldPosition, endPosition)
          && camera.positionCartographic.height < object._maxCoord.x * 2.0
      ) {
        const savedX = camera.position.x;

        const direction = Cartesian3.subtract(
          worldPosition,
          endPosition,
          scratchZoomDirection,
        );
        Cartesian3.normalize(direction, direction);

        const d = (Cartesian3.distance(worldPosition, endPosition) * distance)
            / (camera.getMagnitude() * 0.5);
        camera.move(direction, d * 0.5);

        if (
          (camera.position.x < 0.0 && savedX > 0.0)
            || (camera.position.x > 0.0 && savedX < 0.0)
        ) {
          pickedPosition = camera.getPickRay(startPosition, scratchZoomPickRay)?.origin;
          if (!pickedPosition) {
            return;
          }
          pickedPosition = Cartesian3.fromElements(
            pickedPosition.y,
            pickedPosition.z,
            pickedPosition.x,
          );
          object._zoomWorldPosition = Cartesian3.clone(
            pickedPosition,
            object._zoomWorldPosition,
          );
        }
      }
    } else if (mode === SceneMode.SCENE3D) {
      const cameraPositionNormal = Cartesian3.normalize(
        camera.position,
        scratchCameraPositionNormal,
      );
      if (
        camera.positionCartographic.height < 3000.0
          && Math.abs(Cartesian3.dot(camera.direction, cameraPositionNormal)) < 0.6
      ) {
        zoomOnVector = true;
      } else {
        const canvas = scene.canvas;

        const centerPixel = scratchCenterPixel;
        centerPixel.x = canvas.clientWidth / 2;
        centerPixel.y = canvas.clientHeight / 2;
        const centerPosition = pickGlobe(
          object,
          centerPixel,
          scratchCenterPosition,
        );
        // If centerPosition is not defined, it means the globe does not cover the center position of screen

        if (
          defined(centerPosition)
            && camera.positionCartographic.height < 1000000
        ) {
          const cameraPosition = scratchCameraPosition;
          Cartesian3.clone(camera.position, cameraPosition);
          const target = object._zoomWorldPosition;

          if (!target) {
            return;
          }

          let targetNormal = scratchTargetNormal;

          targetNormal = Cartesian3.normalize(target, targetNormal);

          if (Cartesian3.dot(targetNormal, cameraPositionNormal) < 0.0) {
            return;
          }

          const center = scratchCenter;
          const forward = scratchForwardNormal;
          Cartesian3.clone(camera.direction, forward);
          Cartesian3.add(
            cameraPosition,
            Cartesian3.multiplyByScalar(forward, 1000, scratchCartesian),
            center,
          );

          const positionToTarget = scratchPositionToTarget;
          const positionToTargetNormal = scratchPositionToTargetNormal;
          Cartesian3.subtract(target, cameraPosition, positionToTarget);

          Cartesian3.normalize(positionToTarget, positionToTargetNormal);

          const alphaDot = Cartesian3.dot(
            cameraPositionNormal,
            positionToTargetNormal,
          );
          if (alphaDot >= 0.0) {
            // We zoomed past the target, and this zoom is not valid anymore.
            // This line causes the next zoom movement to pick a new starting point.
            if (!object._zoomMouseStart) {
              return;
            }
            object._zoomMouseStart.x = -1;
            return;
          }
          const alpha = Math.acos(-alphaDot);
          const cameraDistance = Cartesian3.magnitude(cameraPosition);
          const targetDistance = Cartesian3.magnitude(target);
          const remainingDistance = cameraDistance - distance;
          const positionToTargetDistance = Cartesian3.magnitude(positionToTarget);

          const gamma = Math.asin(
            CesiumMath.clamp(
              (positionToTargetDistance / targetDistance) * Math.sin(alpha),
              -1.0,
              1.0,
            ),
          );
          const delta = Math.asin(
            CesiumMath.clamp(
              (remainingDistance / targetDistance) * Math.sin(alpha),
              -1.0,
              1.0,
            ),
          );
          const beta = gamma - delta + alpha;

          const up = scratchCameraUpNormal;
          Cartesian3.normalize(cameraPosition, up);
          let right = scratchCameraRightNormal;
          right = Cartesian3.cross(positionToTargetNormal, up, right);
          right = Cartesian3.normalize(right, right);

          Cartesian3.normalize(
            Cartesian3.cross(up, right, scratchCartesian),
            forward,
          );

          // Calculate new position to move to
          Cartesian3.multiplyByScalar(
            Cartesian3.normalize(center, scratchCartesian),
            Cartesian3.magnitude(center) - distance,
            center,
          );
          Cartesian3.normalize(cameraPosition, cameraPosition);
          Cartesian3.multiplyByScalar(
            cameraPosition,
            remainingDistance,
            cameraPosition,
          );

          // Pan
          const pMid = scratchPan;
          Cartesian3.multiplyByScalar(
            Cartesian3.add(
              Cartesian3.multiplyByScalar(
                up,
                Math.cos(beta) - 1,
                scratchCartesianTwo,
              ),
              Cartesian3.multiplyByScalar(
                forward,
                Math.sin(beta),
                scratchCartesianThree,
              ),
              scratchCartesian,
            ),
            remainingDistance,
            pMid,
          );
          Cartesian3.add(cameraPosition, pMid, cameraPosition);

          Cartesian3.normalize(center, up);
          Cartesian3.normalize(
            Cartesian3.cross(up, right, scratchCartesian),
            forward,
          );

          const cMid = scratchCenterMovement;
          Cartesian3.multiplyByScalar(
            Cartesian3.add(
              Cartesian3.multiplyByScalar(
                up,
                Math.cos(beta) - 1,
                scratchCartesianTwo,
              ),
              Cartesian3.multiplyByScalar(
                forward,
                Math.sin(beta),
                scratchCartesianThree,
              ),
              scratchCartesian,
            ),
            Cartesian3.magnitude(center),
            cMid,
          );
          Cartesian3.add(center, cMid, center);

          // Update camera

          // Set new position
          Cartesian3.clone(cameraPosition, camera.position);

          // Set new direction
          Cartesian3.normalize(
            Cartesian3.subtract(center, cameraPosition, scratchCartesian),
            camera.direction,
          );
          Cartesian3.clone(camera.direction, camera.direction);

          // Set new right & up vectors
          Cartesian3.cross(camera.direction, camera.up, camera.right);
          Cartesian3.cross(camera.right, camera.direction, camera.up);

          camera.setView(scratchZoomViewOptions);
          return;
        }

        if (defined(centerPosition)) {
          const positionNormal = Cartesian3.normalize(
            centerPosition as Cartesian3,
            scratchPositionNormal,
          );

          if (!object._zoomWorldPosition) {
            return;
          }

          const pickedNormal = Cartesian3.normalize(
            object._zoomWorldPosition,
            scratchPickNormal,
          );
          const dotProduct = Cartesian3.dot(pickedNormal, positionNormal);

          if (dotProduct > 0.0 && dotProduct < 1.0) {
            const angle = CesiumMath.acosClamped(dotProduct);
            const axis = Cartesian3.cross(
              pickedNormal,
              positionNormal,
              scratchZoomAxis,
            );

            const denom = Math.abs(angle) > CesiumMath.toRadians(20.0)
              ? camera.positionCartographic.height * 0.75
              : camera.positionCartographic.height - distance;
            const scalar = distance / denom;
            camera.rotate(axis, angle * scalar);
          }
        } else {
          zoomOnVector = true;
        }
      }
    }

    object._rotatingZoom = !zoomOnVector;
  }

  if ((!sameStartPosition && zoomOnVector) || zoomingOnVector) {
    let ray;
    if (!object._zoomWorldPosition) {
      return;
    }
    const zoomMouseStart = SceneTransforms.wgs84ToWindowCoordinates(
      scene,
      object._zoomWorldPosition,
      scratchZoomOffset,
    );
    if (
      mode !== SceneMode.COLUMBUS_VIEW
        && Cartesian2.equals(startPosition, object._zoomMouseStart)
        && defined(zoomMouseStart)
    ) {
      ray = camera.getPickRay(zoomMouseStart, scratchZoomPickRay);
    } else {
      ray = camera.getPickRay(startPosition, scratchZoomPickRay);
    }

    const rayDirection = ray?.direction;
    if (!rayDirection) {
      return;
    }
    if (mode === SceneMode.COLUMBUS_VIEW || mode === SceneMode.SCENE2D) {
      Cartesian3.fromElements(
        rayDirection.y,
        rayDirection.z,
        rayDirection.x,
        rayDirection,
      );
    }

    camera.move(rayDirection, distance);

    object._zoomingOnVector = true;
  } else {
    camera.zoomIn(distance);
  }

  camera.setView(scratchZoomViewOptions);
}

function zoom3D(controller: CustomScreenSpaceCameraController, startPosition: Cartesian2, movement: Movement) {
  if (defined(movement.distance)) {
    movement = movement.distance as Movement;
  }

  const ellipsoid = controller._ellipsoid;
  const scene = controller._scene;
  const camera = scene.camera;
  const canvas = scene.canvas;

  const windowPosition = zoomCVWindowPos;
  windowPosition.x = canvas.clientWidth / 2;
  windowPosition.y = canvas.clientHeight / 2;
  const ray = camera.getPickRay(windowPosition, zoomCVWindowRay);

  if (!ray) {
    return;
  }

  let intersection;
  const height = ellipsoid?.cartesianToCartographic(
    camera.position,
    zoom3DCartographic,
  ).height;
  if (height && height < controller.minimumPickingTerrainHeight) {
    intersection = pickGlobe(controller, windowPosition, zoomCVIntersection);
  }

  let distance;
  if (defined(intersection)) {
    distance = Cartesian3.distance(ray.origin, intersection as Cartesian3);
  } else {
    distance = height;
  }

  const unitPosition = Cartesian3.normalize(camera.position, zoom3DUnitPosition);
  handleZoom(
    controller,
    startPosition,
    movement,
    controller._zoomFactor,
    distance as number,
    Cartesian3.dot(unitPosition, camera.direction),
  );
}

const pan3DP0 = Cartesian4.clone(Cartesian4.UNIT_W);
const pan3DP1 = Cartesian4.clone(Cartesian4.UNIT_W);
const pan3DTemp0 = new Cartesian3();
const pan3DTemp1 = new Cartesian3();
const pan3DTemp2 = new Cartesian3();
const pan3DTemp3 = new Cartesian3();
const pan3DStartMousePosition = new Cartesian2();
const pan3DEndMousePosition = new Cartesian2();

function pan3D(controller: CustomScreenSpaceCameraController, startPosition: Cartesian2, movement: Movement, ellipsoid: Ellipsoid) {
  const scene = controller._scene;
  const camera = scene.camera;

  const startMousePosition = Cartesian2.clone(
    movement.startPosition,
    pan3DStartMousePosition,
  );
  const endMousePosition = Cartesian2.clone(
    movement.endPosition,
    pan3DEndMousePosition,
  );

  let p0 = camera.pickEllipsoid(startMousePosition, ellipsoid, pan3DP0);
  let p1 = camera.pickEllipsoid(endMousePosition, ellipsoid, pan3DP1);

  if (!defined(p0) || !defined(p1)) {
    controller._rotating = true;
    rotate3D(controller, startPosition, movement);
    return;
  }

  p0 = camera.worldToCameraCoordinates(p0 as Cartesian4, p0 as Cartesian4);
  p1 = camera.worldToCameraCoordinates(p1 as Cartesian4, p1 as Cartesian4);

  if (!defined(camera.constrainedAxis)) {
    Cartesian3.normalize(p0, p0);
    Cartesian3.normalize(p1, p1);
    const dot = Cartesian3.dot(p0, p1);
    const axis = Cartesian3.cross(p0, p1, pan3DTemp0);

    if (
      dot < 1.0
        && !Cartesian3.equalsEpsilon(axis, Cartesian3.ZERO, CesiumMath.EPSILON14)
    ) {
      // dot is in [0, 1]
      const angle = Math.acos(dot);
      camera.rotate(axis, angle);
    }
  } else {
    const basis0 = camera.constrainedAxis;
    const basis1 = Cartesian3.mostOrthogonalAxis(basis0, pan3DTemp0);
    Cartesian3.cross(basis1, basis0, basis1);
    Cartesian3.normalize(basis1, basis1);
    const basis2 = Cartesian3.cross(basis0, basis1, pan3DTemp1);

    const startRho = Cartesian3.magnitude(p0);
    const startDot = Cartesian3.dot(basis0, p0);
    const startTheta = Math.acos(startDot / startRho);
    const startRej = Cartesian3.multiplyByScalar(basis0, startDot, pan3DTemp2);
    Cartesian3.subtract(p0, startRej, startRej);
    Cartesian3.normalize(startRej, startRej);

    const endRho = Cartesian3.magnitude(p1);
    const endDot = Cartesian3.dot(basis0, p1);
    const endTheta = Math.acos(endDot / endRho);
    const endRej = Cartesian3.multiplyByScalar(basis0, endDot, pan3DTemp3);
    Cartesian3.subtract(p1, endRej, endRej);
    Cartesian3.normalize(endRej, endRej);

    let startPhi = Math.acos(Cartesian3.dot(startRej, basis1));
    if (Cartesian3.dot(startRej, basis2) < 0) {
      startPhi = CesiumMath.TWO_PI - startPhi;
    }

    let endPhi = Math.acos(Cartesian3.dot(endRej, basis1));
    if (Cartesian3.dot(endRej, basis2) < 0) {
      endPhi = CesiumMath.TWO_PI - endPhi;
    }

    const deltaPhi = startPhi - endPhi;

    let east;
    if (
      Cartesian3.equalsEpsilon(basis0, camera.position, CesiumMath.EPSILON2)
    ) {
      east = camera.right;
    } else {
      east = Cartesian3.cross(basis0, camera.position, pan3DTemp0);
    }

    const planeNormal = Cartesian3.cross(basis0, east, pan3DTemp0);
    const side0 = Cartesian3.dot(
      planeNormal,
      Cartesian3.subtract(p0, basis0, pan3DTemp1),
    );
    const side1 = Cartesian3.dot(
      planeNormal,
      Cartesian3.subtract(p1, basis0, pan3DTemp1),
    );

    let deltaTheta;
    if (side0 > 0 && side1 > 0) {
      deltaTheta = endTheta - startTheta;
    } else if (side0 > 0 && side1 <= 0) {
      if (Cartesian3.dot(camera.position, basis0) > 0) {
        deltaTheta = -startTheta - endTheta;
      } else {
        deltaTheta = startTheta + endTheta;
      }
    } else {
      deltaTheta = startTheta - endTheta;
    }

    camera.rotateRight(deltaPhi);
    camera.rotateUp(deltaTheta);
  }
}

const spin3DPick = new Cartesian3();
const scratchCartographic = new Cartographic();
const scratchLookUp = new Cartesian3();

function spin3D(controller: CustomScreenSpaceCameraController, startPosition: Cartesian2, movement: Movement) {
  const scene = controller._scene;
  const camera = scene.camera;

  if (!Matrix4.equals(camera.transform, Matrix4.IDENTITY)) {
    rotate3D(controller, startPosition, movement);
    return;
  }

  let magnitude;
  let radii;
  let ellipsoid;

  if (!controller._ellipsoid) {
    return;
  }

  const up = controller._ellipsoid.geodeticSurfaceNormal(
    camera.position,
    scratchLookUp,
  );

  const height = controller._ellipsoid.cartesianToCartographic(
    camera.positionWC,
    scratchCartographic,
  ).height;
  const globe = controller._globe;

  let mousePos;
  let tangentPick = false;
  if (defined(globe) && height < controller.minimumPickingTerrainHeight) {
    mousePos = pickGlobe(controller, movement.startPosition, scratchMousePos);
    if (defined(mousePos)) {
      const ray = camera.getPickRay(movement.startPosition, pickGlobeScratchRay);
      if (!ray) {
        return;
      }
      const normal = controller._ellipsoid.geodeticSurfaceNormal(mousePos as Cartesian3);
      tangentPick = Math.abs(Cartesian3.dot(ray.direction, normal)) < 0.05;

      if (tangentPick && !controller._looking) {
        controller._rotating = false;
        controller._strafing = true;
      }
    }
  }

  if (Cartesian2.equals(startPosition, controller._rotateMousePosition)) {
    if (controller._looking) {
      look3D(controller, startPosition, movement, up);
    } else if (controller._rotating) {
      rotate3D(controller, startPosition, movement);
    } else if (controller._strafing) {
      if (!mousePos) {
        return;
      }
      Cartesian3.clone(mousePos, controller._strafeStartPosition);
      strafe(controller, startPosition, movement);
    } else {
      if (!controller._rotateStartPosition) {
        return;
      }
      magnitude = Cartesian3.magnitude(controller._rotateStartPosition);
      radii = scratchRadii;
      radii.x = magnitude;
      radii.y = magnitude;
      radii.z = magnitude;
      ellipsoid = Ellipsoid.fromCartesian3(radii, scratchEllipsoid);
      pan3D(controller, startPosition, movement, ellipsoid);
    }
    return;
  }
  controller._looking = false;
  controller._rotating = false;
  controller._strafing = false;

  if (defined(globe) && height < controller.minimumPickingTerrainHeight) {
    if (defined(mousePos)) {
      if (
        Cartesian3.magnitude(camera.position) < Cartesian3.magnitude(mousePos as Cartesian3)
      ) {
        Cartesian3.clone(mousePos as Cartesian3, controller._strafeStartPosition);

        controller._strafing = true;
        strafe(controller, startPosition, movement);
      } else {
        magnitude = Cartesian3.magnitude(mousePos as Cartesian3);
        radii = scratchRadii;
        radii.x = magnitude;
        radii.y = magnitude;
        radii.z = magnitude;
        ellipsoid = Ellipsoid.fromCartesian3(radii, scratchEllipsoid);
        pan3D(controller, startPosition, movement, ellipsoid);

        Cartesian3.clone(mousePos as Cartesian3, controller._rotateStartPosition);
      }
    } else {
      controller._looking = true;
      look3D(controller, startPosition, movement, up);
    }
  } else if (
    defined(
      camera.pickEllipsoid(
        movement.startPosition,
        controller._ellipsoid,
        spin3DPick,
      ),
    )
  ) {
    pan3D(controller, startPosition, movement, controller._ellipsoid);
    Cartesian3.clone(spin3DPick, controller._rotateStartPosition);
  } else if (height > controller.minimumTrackBallHeight) {
    controller._rotating = true;
    rotate3D(controller, startPosition, movement);
  } else {
    controller._looking = true;
    look3D(controller, startPosition, movement, up);
  }

  Cartesian2.clone(startPosition, controller._rotateMousePosition);
}

function update3D(controller: CustomScreenSpaceCameraController) {
  reactToInput(
    controller,
    controller.enableRotate,
    controller.rotateEventTypes,
    spin3D,
    controller.inertiaSpin,
    '_lastInertiaSpinMovement',
  );
  reactToInput(
    controller,
    controller.enableZoom,
    controller.zoomEventTypes,
    zoom3D,
    controller.inertiaZoom,
    '_lastInertiaZoomMovement',
  );
  reactToInput(
    controller,
    controller.enableTilt,
    controller.tiltEventTypes,
    tilt3D,
    controller.inertiaSpin,
    '_lastInertiaTiltMovement',
  );
  reactToInput(
    controller,
    controller.enableLook,
    controller.lookEventTypes,
    look3D,
  );
}

const translate2DStart = new Ray();
const translate2DEnd = new Ray();
const scratchTranslateP0 = new Cartesian3();
function translate2D(controller: CustomScreenSpaceCameraController, startPosition: Cartesian3, movement: Movement) {
  const scene = controller._scene;
  const camera = scene.camera;
  let start = camera.getPickRay(movement.startPosition, translate2DStart)?.origin;
  let end = camera.getPickRay(movement.endPosition, translate2DEnd)?.origin;

  if (!start || !end) {
    return;
  }

  start = Cartesian3.fromElements(start.y, start.z, start.x, start);
  end = Cartesian3.fromElements(end.y, end.z, end.x, end);

  const direction = Cartesian3.subtract(start, end, scratchTranslateP0);
  const distance = Cartesian3.magnitude(direction);

  if (distance > 0.0) {
    Cartesian3.normalize(direction, direction);
    camera.move(direction, distance);
  }
}

function singleAxisTwist2D(controller: CustomScreenSpaceCameraController, startPosition: Cartesian3, movement: Movement) {
  if (!controller._rotateFactor || !controller._rotateRateRangeAdjustment) {
    return;
  }
  let rotateRate = controller._rotateFactor * controller._rotateRateRangeAdjustment;

  if (rotateRate > controller._maximumRotateRate) {
    rotateRate = controller._maximumRotateRate;
  }

  if (rotateRate < controller._minimumRotateRate) {
    rotateRate = controller._minimumRotateRate;
  }

  const scene = controller._scene;
  const camera = scene.camera;
  const canvas = scene.canvas;

  let phiWindowRatio = (movement.endPosition.x - movement.startPosition.x) / canvas.clientWidth;
  phiWindowRatio = Math.min(phiWindowRatio, controller.maximumMovementRatio);

  const deltaPhi = rotateRate * phiWindowRatio * Math.PI * 4.0;

  camera.twistRight(deltaPhi);
}

const twist2DStart = new Cartesian2();
const twist2DEnd = new Cartesian2();

function twist2D(controller: CustomScreenSpaceCameraController, startPosition: Cartesian3, movement: Movement) {
  if (defined(movement.angleAndHeight)) {
    singleAxisTwist2D(controller, startPosition, movement.angleAndHeight as Movement);
    return;
  }

  const scene = controller._scene;
  const camera = scene.camera;
  const canvas = scene.canvas;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  let start = twist2DStart;
  start.x = (2.0 / width) * movement.startPosition.x - 1.0;
  start.y = (2.0 / height) * (height - movement.startPosition.y) - 1.0;
  start = Cartesian2.normalize(start, start);

  let end = twist2DEnd;
  end.x = (2.0 / width) * movement.endPosition.x - 1.0;
  end.y = (2.0 / height) * (height - movement.endPosition.y) - 1.0;
  end = Cartesian2.normalize(end, end);

  let startTheta = CesiumMath.acosClamped(start.x);
  if (start.y < 0) {
    startTheta = CesiumMath.TWO_PI - startTheta;
  }
  let endTheta = CesiumMath.acosClamped(end.x);
  if (end.y < 0) {
    endTheta = CesiumMath.TWO_PI - endTheta;
  }
  const theta = endTheta - startTheta;

  camera.twistRight(theta);
}

function zoom2D(controller: CustomScreenSpaceCameraController, startPosition: Cartesian3, movement: Movement) {
  if (defined(movement.distance)) {
    movement = movement.distance as Movement;
  }

  const scene = controller._scene;
  const camera = scene.camera;

  handleZoom(
    controller,
    startPosition,
    movement,
    controller._zoomFactor,
    camera.getMagnitude(),
  );
}

function update2D(controller: CustomScreenSpaceCameraController) {
  const rotatable2D = controller._scene.mapMode2D === MapMode2D.ROTATE;
  if (!Matrix4.equals(Matrix4.IDENTITY, controller._scene.camera.transform)) {
    reactToInput(
      controller,
      controller.enableZoom,
      controller.zoomEventTypes,
      zoom2D,
      controller.inertiaZoom,
      '_lastInertiaZoomMovement',
    );
    if (rotatable2D) {
      reactToInput(
        controller,
        controller.enableRotate,
        controller.translateEventTypes,
        twist2D,
        controller.inertiaSpin,
        '_lastInertiaSpinMovement',
      );
    }
  } else {
    reactToInput(
      controller,
      controller.enableTranslate,
      controller.translateEventTypes,
      translate2D,
      controller.inertiaTranslate,
      '_lastInertiaTranslateMovement',
    );
    reactToInput(
      controller,
      controller.enableZoom,
      controller.zoomEventTypes,
      zoom2D,
      controller.inertiaZoom,
      '_lastInertiaZoomMovement',
    );
    if (rotatable2D) {
      reactToInput(
        controller,
        controller.enableRotate,
        controller.tiltEventTypes,
        twist2D,
        controller.inertiaSpin,
        '_lastInertiaTiltMovement',
      );
    }
  }
}

class CustomCamera extends Camera {
  private _transform: Matrix4;

  constructor(scene: Scene) {
    super(scene);
    this._transform = Matrix4.IDENTITY;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  get transform(): Matrix4 {
    return this._transform;
  }

  public _setTransform(transform: Matrix4): void {
    this._transform = transform;
  }
}

class CustomScene extends Scene {
  public readonly _camera: CustomCamera;
  public _screenSpaceCameraController?: CustomScreenSpaceCameraController;

  constructor(options: never) {
    super(options);
    this._camera = new CustomCamera(this);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  get camera(): CustomCamera {
    return this._camera;
  }

  // @ts-ignore
  get screenSpaceCameraController(): CustomScreenSpaceCameraController {
    if (!defined(this._screenSpaceCameraController)) {
      throw new DeveloperError('screenSpaceCameraController is not supported.');
    }
    return this._screenSpaceCameraController as CustomScreenSpaceCameraController;
  }
}

class CustomScreenSpaceCameraController extends ScreenSpaceCameraController {
  private readonly _scratchPreviousPosition: Cartesian3;
  private readonly _scratchPreviousDirection: Cartesian3;
  private _polar;
  public readonly _scene: CustomScene;
  public readonly _aggregator: CameraEventAggregator;
  public readonly _zoomFactor: number;
  public readonly _minimumZoomRate: number;
  public readonly _maximumZoomRate: number;
  public readonly _maximumRotateRate: number;
  public readonly _minimumRotateRate: number;
  public _globe?: Globe;
  public _ellipsoid?: Ellipsoid;
  public _rotateFactor?: number;
  public _rotateRateRangeAdjustment?: number;
  public _horizontalRotationAxis?: Cartesian3;
  public _adjustedHeightForTerrain?: boolean;
  public _looking: boolean;
  public _tiltCenterMousePosition: Cartesian2;
  public _tiltCenter: Cartesian3;
  public _tiltOnEllipsoid?: boolean;
  public _zoomMouseStart?: Cartesian2;
  public _zoomingOnVector?: boolean;
  public _rotatingZoom?: boolean;
  public _useZoomWorldPosition?: boolean;
  public _zoomWorldPosition?: Cartesian3;
  public _maxCoord: Cartesian3;
  public _rotating?: boolean;
  public _strafing?: boolean;
  public _rotateMousePosition?: Cartesian2;
  public _strafeStartPosition?: Cartesian3;
  public _rotateStartPosition?: Cartesian3;

  constructor(scene: CustomScene) {
    super(scene);
    this._scene = scene as CustomScene;
    this._polar = false;
    this._aggregator = new CameraEventAggregator(scene.canvas);
    this._scratchPreviousPosition = new Cartesian3();
    this._scratchPreviousDirection = new Cartesian3();

    this._zoomFactor = 5.0;
    this._rotateFactor = undefined;
    this._rotateRateRangeAdjustment = undefined;
    this._minimumZoomRate = 20.0;
    this._maximumZoomRate = 5906376272000.0; // distance from the Sun to Pluto in meters.
    this._maximumRotateRate = 1.77;
    this._minimumRotateRate = 1.0 / 5000.0;
    this._looking = false;
    this._tiltCenterMousePosition = new Cartesian2();
    this._tiltCenter = new Cartesian3();

    const projection = scene.mapProjection;
    this._maxCoord = projection.project(
      new Cartographic(Math.PI, CesiumMath.PI_OVER_TWO),
    );
  }

  get polar(): boolean {
    return this._polar;
  }

  set polar(value: boolean) {
    this._polar = value;
  }

  public update(): void {
    const camera = this._scene.camera;
    if (!Matrix4.equals(camera.transform, Matrix4.IDENTITY)) {
      this._globe = undefined;
      this._ellipsoid = Ellipsoid.UNIT_SPHERE;
    } else {
      this._globe = this._scene.globe;
      this._ellipsoid = defined(this._globe)
        ? this._globe.ellipsoid
        : this._scene.mapProjection.ellipsoid;
    }

    this.minimumCollisionTerrainHeight *= this._scene.globe.terrainExaggeration;
    this.minimumPickingTerrainHeight *= this._scene.globe.terrainExaggeration;
    this.minimumTrackBallHeight *= this._scene.globe.terrainExaggeration;

    const radius = this._ellipsoid.maximumRadius;
    this._rotateFactor = 1.0 / radius;
    this._rotateRateRangeAdjustment = radius;

    this._adjustedHeightForTerrain = false;
    const previousPosition = Cartesian3.clone(
      camera.positionWC,
      this._scratchPreviousPosition,
    );
    const previousDirection = Cartesian3.clone(
      camera.directionWC,
      this._scratchPreviousDirection,
    );

    const scene = this._scene;
    const mode = scene.mode;
    if (this.polar) {
      updatePolar(this);
    } else if (mode === SceneMode.SCENE2D) {
      update2D(this);
    } else if (mode === SceneMode.SCENE3D) {
      this._horizontalRotationAxis = undefined;
      update3D(this);
    }

    if (this.enableCollisionDetection && !this._adjustedHeightForTerrain) {
      // Adjust the camera height if the camera moved at all (user input or inertia) and an action didn't already adjust the camera height
      const cameraChanged = !Cartesian3.equals(previousPosition, camera.positionWC)
          || !Cartesian3.equals(previousDirection, camera.directionWC);
      if (cameraChanged) {
        adjustHeightForTerrain(this);
      }
    }

    this._aggregator.reset();
  }
}

export class CustomViewer extends Viewer {
  private readonly _scene: CustomScene;

  constructor(container: HTMLElement, options?: never) {
    super(container, options);
    this._scene = this.scene as CustomScene;
    this._scene._screenSpaceCameraController = new CustomScreenSpaceCameraController(this._scene);
  }
}
