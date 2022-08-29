import React, { useState } from 'react'
import {
  MdAddCircleOutline,
  MdRemoveCircleOutline,
  MdSettings,
  MdSave,
} from 'react-icons/md'
import { IoLibrary } from 'react-icons/io5'
import ToggleButtonControl from './ToggleButtonControl'
import ActionButtonControl from './ActionButtonControl'
import KeypressActions from './KeypressActions'
import { generatePath } from '../generators/path'

export default function EditorMainControls({
  paths,
  setPaths,
  editorMode,
  setEditorMode,
}) {
  function toggleAddingPath(e) {
    const { addingPath } = editorMode
    let addedPath = null
    let addedPathId = null

    if (!addingPath) {
      addedPath = generatePath()
      addedPathId = addedPath.id

      setPaths([addedPath, ...paths])
    }
    else {
      removeEmptyEditPath()
    }

    setEditorMode({
      ...editorMode,
      editPathId: addedPathId,
      selectedPointIds: [],
      removePathId: null,
      editingPath: !addingPath,
      addingPath: !addingPath,
      removingPath: false,
      addingPathPoint: !addingPath,
      removingPathPoint: false,
      canvasActive: !addingPath,
    })
  }

  function toggleRemovingPath(e) {
    if (allPathsEmpty()) {
      return
    }

    removeEmptyEditPath()

    setEditorMode({
      ...editorMode,
      editPathId: null,
      selectedPointIds: [],
      removePathId: null,
      editingPath: false,
      addingPath: false,
      removingPath: !editorMode.removingPath,
      addingPathPoint: false,
      removingPathPoint: false,
      canvasActive: !editorMode.removingPath,
    })
  }

  function removeEmptyEditPath() {
    const { editPathId } = editorMode
    const editPath = paths.find(({ id }) => id === editPathId)

    if (editPath !== undefined && editPath.points.length === 0) {
      setPaths(paths.filter(({ id }) => id !== editPathId))
    }
  }

  function allPathsEmpty() {
    return paths.length === 0 || 
      (paths.length === 1 && paths[0].points.length === 0)
  }

  return (
    <ul className='editor-main-controls controls large'>
      <ToggleButtonControl
        value={editorMode.addingPath}
        toggleValueHandler={toggleAddingPath}
        label='Add Path'
        icon={<MdAddCircleOutline />}
      />
      <ToggleButtonControl
        value={editorMode.removingPath}
        toggleValueHandler={toggleRemovingPath}
        label='Remove Path'
        icon={<MdRemoveCircleOutline />}
        enabled={!allPathsEmpty()}
      />
      <ActionButtonControl
        action={() => console.log('save face')}
        label='Save Face'
        icon={<MdSave />}
      />
      <ToggleButtonControl
        value={false}
        toggleValueHandler={() => console.log('face library')}
        label='Open/Close Face Library'
        icon={<IoLibrary />}
      />
      <ToggleButtonControl
        value={false}
        toggleValueHandler={() => console.log('editor settings')}
        label='Open/Close Editor Settings'
        icon={<MdSettings />}
      />
      <KeypressActions
        keymap={[
          {
            key: 'a',
            shift: true,
            action: toggleAddingPath,
          },
          {
            key: 'x',
            shift: true,
            action: toggleRemovingPath,
          },
        ]}
      />
    </ul>
  )
}
