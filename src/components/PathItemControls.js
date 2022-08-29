import React from 'react'
import { MdDragHandle, MdEdit, MdContentCopy } from 'react-icons/md'
import { IoMdEye, IoMdEyeOff } from 'react-icons/io'
import { v4 as uuid } from 'uuid'
import ToggleButtonControl from './ToggleButtonControl'
import ActionButtonControl from './ActionButtonControl'

export default function PathItemControls({
  path,
  paths,
  setPaths,
  editorMode,
  setEditorMode,
  sortHandleData,
}) {
  function toggleEditingPath(e) {
    const { editPathId } = editorMode
    const editPath = paths.find(({ id }) => id === editPathId)

    if (editPath !== undefined && editPath.points.length === 0) {
      setPaths(paths.filter(({ id }) => id !== editPathId))
    }

    setEditorMode({
      ...editorMode,
      editPathId: path.id !== editPathId ? path.id : null,
      selectedPointIds: [],
      removePathId: null,
      editingPath: path.id !== editPathId,
      addingPath: false,
      removingPath: false,
      addingPathPoint: false,
      removingPathPoint: false,
      canvasActive: path.id !== editPathId,
    })
  }

  function togglePathVisible(e) {
    setPaths(paths.map((pathItem) => {
      if (pathItem.id === path.id) {
        return {
          ...pathItem,
          visible: !pathItem.visible,
        }
      }
      else {
        return pathItem
      }
    }))
  }

  function duplicatePath(e) {
    const duplicatedPathIdx = paths.findIndex(({ id }) => id === path.id)

    if (duplicatedPathIdx !== -1) {
      const newPathId = uuid()

      setPaths([
        ...paths.slice(0, duplicatedPathIdx),
        {
          ...path,
          id: newPathId,
          points: path.points.map((point) => {
            return { ...point, id: uuid() }
          }),
        },
        ...paths.slice(duplicatedPathIdx),
      ])

      setEditorMode({
        ...editorMode,
        editPathId: editorMode.editingPath ? newPathId : null,
        selectedPointIds: [],
        removePathId: null,
        addingPath: false,
        removingPath: false,
      })
    }
  }

  const {
    attributes: sortAttributes,
    listeners: sortListeners,
  } = sortHandleData

  const classList = [
    'path-item-controls controls',
    path.id === editorMode.editPathId ? 'large' : 'medium',
  ].join(' ').trim()

  return (
    <ul className={classList}>
      <li className='sort-handle' {...sortAttributes} {...sortListeners}>
        <MdDragHandle />
      </li>
      <li className='path-preview'></li>
      <ToggleButtonControl
        value={path.id === editorMode.editPathId}
        toggleValueHandler={toggleEditingPath}
        label='Edit Path'
        icon={<MdEdit />}
      />
      <ToggleButtonControl
        value={false}
        toggleValueHandler={togglePathVisible}
        label='Show/Hide Path'
        icon={<IoMdEye />}
        enabled={path.visible}
        iconDisabled={<IoMdEyeOff />}
      />
      <ActionButtonControl
        action={duplicatePath}
        label='Duplicate Path'
        icon={<MdContentCopy />}
        enabled={path.points.length > 0}
      />
    </ul>
  )
}
