import React from 'react'
import { MdClear } from 'react-icons/md'

export default function PathPointItem({
  point,
  path,
  paths,
  setPaths,
  editorMode,
  setEditorMode,
}) {
  function selectPathPoint(e) {
    setEditorMode({
      ...editorMode,
      selectedPointIds: [point.id],
    })
  }

  function deselectPathPoint(e) {
    setEditorMode({
      ...editorMode,
      selectedPointIds: [],
    })
  }

  function handlePathPointClick(e) {
    if (editorMode.addingPathPoint) {
      toggleInsertAfterPathPoint(e)
    }
    else if (editorMode.removingPathPoint) {
      removePathPoint(e)
    }
  }

  function toggleInsertAfterPathPoint(e) {}

  function removePathPoint(e) {
    if (path.points.length === 1) {
      setEditorMode({
        ...editorMode,
        removingPathPoint: false,
      })
    }

    setPaths((paths) => {
      return paths.map((pathItem) => {
        if (pathItem.id === path.id) {
          return {
            ...pathItem,
            points: pathItem.points.filter(({ id }) => id !== point.id),
          }
        }
        else {
          return pathItem
        }
      })
    })
  }

  const pointSelected = editorMode.selectedPointIds.includes(point.id)

  const classList = [
    'path-point-item',
    pointSelected ? 'selected' : '',
    pointSelected && editorMode.removingPathPoint ? 'for-removal' : '',
  ].join(' ').trim()

  return (
    <li
      className={classList}
      onMouseOver={selectPathPoint}
      onMouseOut={deselectPathPoint}
      onClick={handlePathPointClick}
    ><MdClear /></li>
  )
}
