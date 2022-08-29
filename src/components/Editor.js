import React, { useState } from 'react'
import EditorViewControls from './EditorViewControls'
import EditorCanvas from './EditorCanvas'
import EditorMainControls from './EditorMainControls'
import PathList from './PathList'

export default function Editor({}) {
  const [paths, setPaths] = useState([])
  const [editorMode, setEditorMode] = useState({
    editPathId: null,
    removePathId: null,
    selectedPointIds: [],
    editingPath: false,
    addingPath: false,
    removingPath: false,
    addingPathPoint: false,
    removingPathPoint: false,
    canvasActive: false,
  })
  const [viewSettings, setViewSettings] = useState({
    center: true,
    zoom: false,
    zoomLevel: 0.5,
    showFacepoints: true,
    pause: false,
    showFps: true,
    showPathPointMarks: true,
    showPathControlPoints: true,
  })

  return (
    <div className='editor'>
      <EditorViewControls
        viewSettings={viewSettings}
        setViewSettings={setViewSettings}
      />
      <EditorCanvas
        paths={paths}
        setPaths={setPaths}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
        viewSettings={viewSettings}
      />
      <div className='editor-right-pane'>
        <EditorMainControls
          paths={paths}
          setPaths={setPaths}
          editorMode={editorMode}
          setEditorMode={setEditorMode}
        />
        <PathList
          paths={paths}
          setPaths={setPaths}
          editorMode={editorMode}
          setEditorMode={setEditorMode}
        />
      </div>
    </div>
  )
}
