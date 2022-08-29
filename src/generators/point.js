import { v4 as uuid } from 'uuid'

export function generatePoint({
  facepointIdx=null,
  faceX=0,
  faceY=0,
}={}) {
  return {
    id: uuid(),
    facepointIdx,
    faceX,
    faceY,
  }
}
