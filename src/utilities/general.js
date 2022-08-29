export function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)]
}

export function objectShallowEquals(objA, objB, excludedKeys=[]) {
  const entriesA = Object.entries(objA)

  for (const [keyA, valueA] of entriesA) {
    if (!excludedKeys.includes(keyA) && objB[keyA] !== valueA) {
      return false
    }
  }

  return true
}

export function arrayShallowEquals(arrA, arrB) {
  return arrA.every((valueA, idx) => valueA === arrB[idx])
}

export function distance([ax, ay], [bx, by]) {
  return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2))
}

export function getNearestPoint(pointA, otherPoints) {
  let nearestPointIdx = null, nearestPointDistance = Infinity, idx = -1

  for (const pointB of otherPoints) {
    idx += 1

    const pointDistance = distance(pointA, pointB)

    if (pointDistance <= nearestPointDistance) {
      nearestPointIdx = idx
      nearestPointDistance = pointDistance
    }
  }

  return { nearestPointIdx, nearestPointDistance }
}
