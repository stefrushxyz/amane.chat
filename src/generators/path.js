import { v4 as uuid } from 'uuid'
import {
  DEFAULT_FILL_RADIUS,
  DEFAULT_FILL_COLOR,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_STROKE_COLOR,
  DEFAULT_QUADRATIC,
} from '../config/path'

export function generatePath({
  points=[],
  fillRadius=DEFAULT_FILL_RADIUS,
  fillColor=DEFAULT_FILL_COLOR,
  strokeWidth=DEFAULT_STROKE_WIDTH,
  strokeColor=DEFAULT_STROKE_COLOR,
  quadratic=DEFAULT_QUADRATIC,
  visible=true,
}={}) {
  return {
    id: uuid(),
    points,
    fillRadius,
    fillColor,
    strokeWidth,
    strokeColor,
    quadratic,
    visible,
  }
}
