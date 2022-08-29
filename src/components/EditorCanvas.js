import React, { useState, useEffect, useRef, useContext } from 'react'
import { FaceModelContext } from './FaceModel'
import { generatePoint } from '../generators/point'
import {
  objectShallowEquals,
  getNearestPoint,
} from '../utilities/general'
import {
  transformFacepoints,
  calculatePointXYs,
  calculateScaledPathValue,
  randomFace,
} from '../utilities/facepoint'
import { Canvas2D } from '../utilities/canvas'
import { UI_COLORS } from '../config/colors'
import {
  DEFAULT_POINT_RADIUS,
  DEFAULT_POINT_COLOR,
  SELECTED_POINT_RADIUS,
  SELECTED_POINT_COLOR,
  REMOVAL_POINT_COLOR,
} from '../config/point'

export default function EditorCanvas({
  paths,
  setPaths,
  editorMode,
  setEditorMode,
  viewSettings,
}) {
  const { animationFrameId, facepoints } = useContext(FaceModelContext)
  const [currentFacepoints, setCurrentFacepoints] = useState([])
  const [transformedFacepoints, setTransformedFacepoints] = useState([])
  const [facebounds, setFacebounds] = useState({
    xMin: null,
    yMin: null,
    xMax: null,
    yMax: null,
    width: null,
    height: null,
  })
  const [calculatedPathPoints, setCalculatedPathPoints] = useState([])
  const [draggingPathPointId, setDraggingPathPointId] = useState(null)
  const [selectedFacepointIdx, setSelectedFacepointIdx] = useState(null)
  const [pointDistanceThreshold, setPointDistanceThreshold] =
    useState(SELECTED_POINT_RADIUS * 1.25)

  const [fps, setFps] = useState(0)
  const [fpsConfig, setFpsConfig] = useState({
    xy: [10, 18],
    sampleIntervalFrames: 30,
    lowThreshold: 15,
  })
  const [fpsSampleIntervalSum, setFpsSampleIntervalSum] = useState(0)
  const [
    previousFrameTimestamp,
    setPreviousFrameTimestamp,
  ] = useState(new Date())

  const [canvasDimensions, setCanvasDimensions] = useState([640, 480])
  const [canvasBorderWidth, setCanvasBorderWidth] = useState(8)
  const canvasRef = useRef()
  const canvas = new Canvas2D(canvasRef)

  useEffect(() => canvas.updateRef(canvasRef), [canvasRef])

  useEffect(() => {
    if (editorMode.addingPathPoint) {
      canvas.element.addEventListener('click', addPathPoint)
    }
    else {
      canvas.element.removeEventListener('click', addPathPoint)
    }

    if (editorMode.removingPathPoint) {
      canvas.element.addEventListener('click', removePathPoint)
    }
    else {
      canvas.element.removeEventListener('click', removePathPoint)
    }

    if (editorMode.removingPath) {
      canvas.element.addEventListener('click', removePath)
    }
    else {
      canvas.element.removeEventListener('click', removePath)
    }

    if (editorMode.canvasActive) {
      window.addEventListener('mousemove', canvasMouseMove)
      window.addEventListener('mousedown', canvasMouseDown)
      window.addEventListener('mouseup', canvasMouseUp)
      window.addEventListener('mouseout', canvasMouseOut)
    }
    else {
      window.removeEventListener('mousemove', canvasMouseMove)
      window.removeEventListener('mousedown', canvasMouseDown)
      window.removeEventListener('mouseup', canvasMouseUp)
      window.removeEventListener('mouseout', canvasMouseOut)
    }

    return () => {
      canvas.element.removeEventListener('click', addPathPoint)
      canvas.element.removeEventListener('click', removePathPoint)
      canvas.element.removeEventListener('click', removePath)
      window.removeEventListener('mousemove', canvasMouseMove)
      window.removeEventListener('mousedown', canvasMouseDown)
      window.removeEventListener('mouseup', canvasMouseUp)
      window.removeEventListener('mouseout', canvasMouseOut)
    }
  }, [calculatedPathPoints, editorMode, viewSettings])

  useEffect(() => {
    if (!viewSettings.pause && facepoints.length > 0) {
      setCurrentFacepoints(facepoints.slice())
    }

    const {
      transformedFacepoints: latestTransformedFacepoints,
      facebounds: latestFacebounds,
    } = transformFacepoints(currentFacepoints, canvas, viewSettings)

    const latestCalculatedPathPoints = drawFrame()
    
    setTransformedFacepoints(latestTransformedFacepoints)
    setFacebounds(latestFacebounds)
    setCalculatedPathPoints(latestCalculatedPathPoints)

    updateFpsData()

    function drawFrame() {
      canvas.clear()

      drawBorder()

      if (
        viewSettings.showFps &&
        animationFrameId > fpsConfig.sampleIntervalFrames
      ) {
        drawFps(fpsConfig.xy)
      }

      if (viewSettings.showFacepoints) {
        drawFacepoints()
      }

      const frameCalculatedPathPoints = drawPaths()

      drawSelectedPathPoints(frameCalculatedPathPoints)

      if (
        viewSettings.showFacepoints &&
        !(editorMode.removingPathPoint || editorMode.removingPath)
      ) {
        drawSelectedFacepoint()
      }

      return frameCalculatedPathPoints
    }

    function drawBorder() {
      const borderColor = editorMode.canvasActive ?
        UI_COLORS.editor.canvas.border.active :
        UI_COLORS.editor.canvas.border.default

      canvas.drawBorder(canvasBorderWidth, borderColor)
    }
    
    function drawFps([x, y]) {
      const textColor = fps >= fpsConfig.lowThreshold ?
        UI_COLORS.editor.canvas.fps.normal :
        UI_COLORS.editor.canvas.fps.low

      canvas.drawText([x, y], `FPS: ${fps}`, textColor)
    }

    function drawPaths() {
      return paths.slice()
        .reverse()
        .map((path, idx) => {
          const calculatedPoints = calculatePointXYs(
            path.points,
            latestTransformedFacepoints,
            latestFacebounds,
          )

          if (path.visible) {
            const calculatedFillRadius = path.points.length === 1 ?
              calculateScaledPathValue(path.fillRadius, latestFacebounds) :
              null
            const calculatedStrokeWidth =
              calculateScaledPathValue(path.strokeWidth, latestFacebounds)

            const drawPointMarks = viewSettings.showPathPointMarks &&
              path.id === editorMode.editPathId
            const drawControlPoints = viewSettings.showPathControlPoints &&
              path.id === editorMode.editPathId

            canvas.drawPath({
              ...path,
              calculatedPoints,
              calculatedFillRadius,
              calculatedStrokeWidth,
            }, drawPointMarks, drawControlPoints)
          }

          return {
            id: path.id,
            points: calculatedPoints.map(([x, y], idx) => {
              return {
                id: path.points[idx].id,
                xy: [x, y],
              }
            }),
          }
        })
        .reverse()
    }

    function drawFacepoints() {
      const facepointsToDraw =
        animationFrameId > -1 ?
        transformedFacepoints :
        randomFace()

      for (const facepoint of facepointsToDraw) {
        const pointRadius = DEFAULT_POINT_RADIUS
        const pointColor = DEFAULT_POINT_COLOR

        canvas.drawPoint(facepoint, pointRadius, pointColor)
      }
    }

    function drawSelectedPathPoints(frameCalculatedPathPoints) {
      editorMode.selectedPointIds.map((selectedPointId) => {
        const selectedPath = frameCalculatedPathPoints.find(({ points }) => {
          return points.find(({ id }) => id == selectedPointId)
        })

        if (selectedPath === undefined) {
          return
        }

        const selectedPathPoint = selectedPath.points.find(({ id }) => {
          return id === selectedPointId
        })

        if (selectedPathPoint === undefined) {
          return
        }

        const inRemovalMode = editorMode.removingPathPoint ||
          editorMode.removingPath

        const pointRadius = SELECTED_POINT_RADIUS
        const pointColor = !inRemovalMode ?
          SELECTED_POINT_COLOR :
          REMOVAL_POINT_COLOR

        canvas.drawPoint(selectedPathPoint.xy, pointRadius, pointColor)

        if (inRemovalMode) {
          const xSize = pointRadius / 4
          const xColor = DEFAULT_POINT_COLOR
          canvas.drawX(selectedPathPoint.xy, xSize, xColor)
        }
      })
    }

    function drawSelectedFacepoint() {
      const selectedFacepoint = transformedFacepoints[selectedFacepointIdx]

      if (selectedFacepoint === undefined) {
        return
      }

      const pointRadius = SELECTED_POINT_RADIUS
      const pointColor = SELECTED_POINT_COLOR

      canvas.drawPoint(selectedFacepoint, pointRadius, pointColor)
    }

    function updateFpsData() {
      const frameTimestamp = new Date()
      const latestFps = 1 / ((frameTimestamp - previousFrameTimestamp) / 1000)

      if (animationFrameId % fpsConfig.sampleIntervalFrames === 0) {
        const sampleMeanFps = Math.round(
          fpsSampleIntervalSum / fpsConfig.sampleIntervalFrames
        )
        setFps(sampleMeanFps)
        setFpsSampleIntervalSum(latestFps)
      }
      else {
        setFpsSampleIntervalSum(fpsSampleIntervalSum + latestFps)
      }

      setPreviousFrameTimestamp(frameTimestamp)
    }
  }, [animationFrameId])

  function addPathPoint(e) {
    if (draggingPathPointId !== null) {
      return
    }

    const [mouseX, mouseY] = canvas.getMouseXY(e)

    const addedPointData = getNearestPointData([mouseX, mouseY])

    if (addedPointData === null) {
      return
    }

    const addedPoint = generatePoint(addedPointData)

    const { editPathId } = editorMode 
    const editPath = paths.find(({ id }) => id === editPathId)

    if (editPath !== undefined) {
      const addedPointIsRepeat = editPath.points.length !== 0 &&
        objectShallowEquals(
          editPath.points[editPath.points.length - 1],
          addedPoint,
          ['id'],
        )

      if (!addedPointIsRepeat) {
        setPaths(paths.map((path) => {
          if (editPathId === path.id) {
            return { ...path, points: [...path.points, addedPoint] }
          }
          else {
            return path
          }
        }))
      }
    }

    setEditorMode({ ...editorMode, addingPath: false })
  }

  function removePathPoint(e) {
    const [mouseX, mouseY] = canvas.getMouseXY(e)

    const { editPathId } = editorMode 
    const editPath = paths.find(({ id }) => id === editPathId)

    if (editPath === undefined) {
      return
    }

    const {
      nearestPathPointId,
      nearestPathPointDistance,
    } = getNearestPathPoint([mouseX, mouseY])

    if (nearestPathPointDistance <= pointDistanceThreshold) {
      if (editPath.points.length === 1) {
        setEditorMode({
          ...editorMode,
          selectedPointIds: [],
          removalPathId: null,
          removingPathPoint: false,
        })
      }

      setPaths(paths.map((path) => {
        if (editPathId === path.id) {
          return {
            ...path,
            points: path.points.filter(({ id }) => id !== nearestPathPointId),
          }
        }
        else {
          return path
        }
      }))
    }
  }

  function removePath(e) {
    const [mouseX, mouseY] = canvas.getMouseXY(e)

    const {
      nearestPathId,
      nearestPathPointId,
      nearestPathPointDistance,
    } = getNearestPathPoint([mouseX, mouseY])

    const nearestPath = paths.find(({ id }) => id === nearestPathId)

    if (nearestPath === undefined) {
      return
    }

    if (nearestPathPointDistance <= pointDistanceThreshold) {
      if (paths.length === 1) {
        setEditorMode({
          ...editorMode,
          selectedPointIds: [],
          removePathId: null,
          removingPath: false,
          canvasActive: false,
        })
      }

      setPaths(paths.filter(({ id }) => id !== nearestPathId))
    }
  }

  const canvasMouseMoveRate = 10000
  let canvasMouseMoveCounter = canvasMouseMoveRate

  function canvasMouseMove(e) {
    const mouseMoveOnCanvas = e.target === canvas.element
    const skipMouseMove = canvasMouseMoveCounter < canvasMouseMoveRate

    if (!mouseMoveOnCanvas || skipMouseMove) {
      canvasMouseMoveCounter += 1
      return
    }

    canvasMouseMoveCounter = 0

    const mouseX = e.clientX - canvas.boundingRect.left
    const mouseY = e.clientY - canvas.boundingRect.top

    const {
      nearestPathId,
      nearestPathPointId,
      nearestPathPointDistance,
    } = getNearestPathPoint([mouseX, mouseY])

    if (draggingPathPointId !== null) {
      const { editPathId } = editorMode 
      const editPath = paths.find(({ id }) => id === editPathId)

      if (editPath !== undefined) {
        const updatedPointData = getNearestPointData(
          [mouseX, mouseY],
          [draggingPathPointId],
        )

        setPaths(paths.map((path) => {
          if (editPathId === path.id) {
            return {
              ...path,
              points: path.points.map((point) => {
                if (point.id === draggingPathPointId) {
                  return { ...point, ...updatedPointData }
                }
                else {
                  return point
                }
              }),
            }
          }
          else {
            return path
          }
        }))

        return
      }
    }
    else {
      setDraggingPathPointId(null)
    }

    if (editorMode.addingPathPoint) {
      const {
        nearestPointIdx: nearestFacepointIdx,
        nearestPointDistance: nearestFacepointDistance,
      } = getNearestPoint([mouseX, mouseY], transformedFacepoints)

      if (nearestPathPointDistance <= pointDistanceThreshold) {
        setSelectedFacepointIdx(null)
        setEditorMode({
          ...editorMode,
          selectedPointIds: [nearestPathPointId],
        })
      }
      else if (nearestFacepointDistance <= pointDistanceThreshold) {
        setSelectedFacepointIdx(nearestFacepointIdx)
        setEditorMode({
          ...editorMode,
          selectedPointIds: [],
        })
      }
      else if (
        selectedFacepointIdx !== null ||
        editorMode.selectedPointIds.length > 0
      ) {
        setSelectedFacepointIdx(null)
        setEditorMode({
          ...editorMode,
          selectedPointIds: [],
        })
      }
    }
    else if (editorMode.removingPath) {
      if (nearestPathPointDistance <= pointDistanceThreshold) {
        const removePointIds = calculatedPathPoints
          .find(({ id }) => id === nearestPathId)
          .points.map(({ id }) => id)

        setEditorMode({
          ...editorMode,
          selectedPointIds: removePointIds,
          removePathId: nearestPathId,
        })
      }
      else if (
        editorMode.removePathId !== null ||
        editorMode.selectedPointIds.length > 0
      ) {
        setEditorMode({
          ...editorMode,
          selectedPointIds: [],
          removePathId: null,
        })
      }
    }
    else if (editorMode.editingPath) {
      if (nearestPathPointDistance <= pointDistanceThreshold) {
        setEditorMode({
          ...editorMode,
          selectedPointIds: [nearestPathPointId],
        })
      }
      else if (editorMode.selectedPointIds.length > 0) {
        setEditorMode({
          ...editorMode,
          selectedPointIds: [],
        })
      }
    }
  }

  function canvasMouseDown(e) {
    const mouseMoveOnCanvas = e.target === canvas.element
    const canDragPathPoints = editorMode.editingPath &&
      !editorMode.removingPath && !editorMode.removingPathPoint

    if (!mouseMoveOnCanvas || !canDragPathPoints) {
      return false
    }

    const mouseX = e.clientX - canvas.boundingRect.left
    const mouseY = e.clientY - canvas.boundingRect.top

    const {
      nearestPathId,
      nearestPathPointId,
      nearestPathPointDistance,
    } = getNearestPathPoint([mouseX, mouseY])

    if (nearestPathPointDistance <= pointDistanceThreshold) {
      setDraggingPathPointId(nearestPathPointId)
    }
  }

  function canvasMouseUp(e) {
    setDraggingPathPointId(null)
  }

  function canvasMouseOut(e) {
    setSelectedFacepointIdx(null)
    setEditorMode({
      ...editorMode,
      selectedPointIds: draggingPathPointId !== null ?
        editorMode.selectedPointIds :
        [],
      removePathId: null,
    })
  }

  function getNearestPointData([mouseX, mouseY], excludeIds=[]) {
    let {
      nearestPointIdx: nearestFacepointIdx,
      nearestPointDistance: nearestFacepointDistance,
    } = getNearestPoint([mouseX, mouseY], transformedFacepoints)

    const nearestFacepoint = transformedFacepoints[nearestFacepointIdx]

    if (nearestFacepoint === undefined) {
      return null
    }

    const { editPathId } = editorMode
    const editPath = paths.find(({ id }) => id === editPathId)

    if (editPath === undefined) {
      return null
    }

    const {
      nearestPathPointId,
      nearestPathPointDistance,
    } = getNearestPathPoint([mouseX, mouseY], excludeIds)

    const nearestPathPoint = editPath.points.find(({ id }) => {
      return id === nearestPathPointId
    })

    let faceX = 0, faceY = 0

    if (nearestPathPointDistance <= pointDistanceThreshold) {
      nearestFacepointIdx = nearestPathPoint.facepointIdx
      faceX = nearestPathPoint.faceX
      faceY = nearestPathPoint.faceY
    }
    else if (!viewSettings.showFacepoints ||
      nearestFacepointDistance > pointDistanceThreshold
    ) {
      const [pointX, pointY] = nearestFacepoint
      faceX = (mouseX - pointX) / (facebounds.width / 2)
      faceY = (mouseY - pointY) / (facebounds.height / 2)
    }

    return {
      facepointIdx: nearestFacepointIdx,
      faceX,
      faceY,
    }
  }

  function getNearestPathPoint([mouseX, mouseY], excludeIds=[]) {
    const { editPathId } = editorMode

    let nearestPath = null,
      nearestPathId = null,
      nearestPathPoint = null,
      nearestPathPointId = null,
      nearestPathPointDistance = Infinity

    for (const { id: pathId, points } of calculatedPathPoints) {
      if (editPathId !== null && pathId !== editPathId) {
        continue
      }

      const filteredPoints = points
        .filter(({ id }) => !excludeIds.includes(id))

      const {
        nearestPointIdx,
        nearestPointDistance,
      } = getNearestPoint([mouseX, mouseY], filteredPoints.map(({ xy }) => xy))

      if (nearestPointDistance < nearestPathPointDistance) {
        const { id: nearestPointId } = filteredPoints[nearestPointIdx]
        nearestPathId = pathId
        nearestPathPointId = nearestPointId
        nearestPathPointDistance = nearestPointDistance
      }
    }

    return {
      nearestPathId,
      nearestPathPointId,
      nearestPathPointDistance,
    }
  }

  const classList = [
    'editor-canvas',
    editorMode.canvasActive ? 'active' : '',
  ].join(' ').trim()

  return (
    <canvas
      width={canvasDimensions[0]}
      height={canvasDimensions[1]}
      className={classList}
      ref={canvasRef}
    ></canvas>
  )
}
