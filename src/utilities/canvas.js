import { arrayShallowEquals } from './general'
import { CONTROL_POINT_RADIUS, CONTROL_POINT_COLOR } from '../config/point'

export class Canvas2D {
  constructor(ref) {
    this.updateRef(ref)
  }

  updateRef(ref) {
    this.ref = ref
    this.element = this.ref.current
    this.context = this.element !== undefined ?
      this.element.getContext('2d') :
      undefined
  }

  clear() {
    this.context.clearRect(0, 0, this.width, this.height)
  }

  drawBorder(width, color) {
    this.context.beginPath()
    this.context.lineWidth = width * 2
    this.context.strokeStyle = color
    this.context.strokeRect(0, 0, this.width, this.height)
  }
  
  drawPoint([x, y], radius, color) {
    this.context.beginPath()
    this.context.fillStyle = color
    this.context.arc(x, y, radius, 0, 2 * Math.PI)
    this.context.fill()
  }

  drawPath({
    calculatedPoints,
    calculatedFillRadius,
    fillColor,
    calculatedStrokeWidth,
    strokeColor,
    lineCap='round',
    lineJoin='round',
    quadratic=true,
  }, drawPointMarks=false, drawControlPoints=false) {
    if (calculatedPoints.length === 0) {
      return
    }

    quadratic = quadratic && calculatedPoints.length > 2
    drawControlPoints = drawControlPoints && quadratic

    this.context.fillStyle = fillColor
    this.context.lineWidth = calculatedStrokeWidth
    this.context.strokeStyle = strokeColor
    this.context.lineCap = lineCap
    this.context.lineJoin = lineJoin

    this.context.beginPath()

    if (calculatedPoints.length === 1 && calculatedFillRadius !== null) {
      const [x, y] = calculatedPoints[0]
      this.context.arc(x, y, calculatedFillRadius, 0, 2 * Math.PI)
    }
    else if (calculatedPoints.length === 2) {
      this.context.moveTo(...calculatedPoints[0])
      this.context.lineTo(...calculatedPoints[1])
    }
    else {
      let pointIdx = -1

      for (const [x, y] of calculatedPoints) {
        pointIdx += 1

        if (pointIdx === 0) {
          this.context.moveTo(x, y)
          continue
        }
        else if (quadratic && pointIdx % 2 === 1) {
          continue
        }
        
        if (quadratic) {
          const [cx, cy] = calculatedPoints[pointIdx - 1]
          this.context.quadraticCurveTo(cx, cy, x, y)
        }
        else {
          this.context.lineTo(x, y)
        }
      }

      if (arrayShallowEquals(
        calculatedPoints[0], 
        calculatedPoints[pointIdx - 1],
      )) {
        this.context.closePath()
      }
    }

    if (calculatedStrokeWidth > 0) {
      this.context.stroke()
    }
    this.context.fill()

    let pointIdx = -1

    for (const [x, y] of calculatedPoints) {
      pointIdx += 1

      const drawPointMark = (quadratic && pointIdx % 2 === 1) ?
        drawControlPoints :
        drawPointMarks

      if (drawPointMark) {
        this.drawX([x, y], CONTROL_POINT_RADIUS / 2, CONTROL_POINT_COLOR)
      }
    }
  }

  drawText([x, y], text, color) {
    this.context.fillStyle = color
    this.context.fillText(text, x, y)
  }

  drawX([x, y], size, color, lineWidth=1, lineCap='square') {
    this.context.strokeStyle = color
    this.context.lineWidth = lineWidth
    this.context.lineCap = lineCap

    const xLines = [
      [[x - size, y + size], [x + size, y - size]],
      [[x - size, y - size], [x + size, y + size]],
    ]

    xLines.map(([a, b]) => {
      this.context.beginPath()
      this.context.moveTo(a[0], a[1])
      this.context.lineTo(b[0], b[1])
      this.context.stroke()
    })
  }

  getMouseXY({ clientX, clientY }) {
    return [clientX - this.boundingRect.left, clientY - this.boundingRect.top]
  }

  get width() {
    return this.element.width
  }

  get height() {
    return this.element.height
  }

  get boundingRect() {
    return this.element.getBoundingClientRect()
  }
}
