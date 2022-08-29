import React, { useState, useEffect } from 'react'
import PathItemControls from './PathItemControls'
import PathItemPointsList from './PathItemPointsList'
import PathItemStylePicker from './PathItemStylePicker'

export default function PathItem({
  path,
  paths,
  setPaths,
  editorMode,
  setEditorMode,
  toggleAddingPathPoint,
  toggleRemovingPathPoint,
  sortHandleData,
}) {
  return (
    <div className='path-item'>
      <PathItemControls
        path={path}
        paths={paths}
        setPaths={setPaths}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
        sortHandleData={sortHandleData}
      />
      <div className='path-item-details'>
        <PathItemPointsList 
          path={path}
          setPaths={setPaths}
          editorMode={editorMode}
          setEditorMode={setEditorMode}
          toggleAddingPathPoint={toggleAddingPathPoint}
          toggleRemovingPathPoint={toggleRemovingPathPoint}
        />
        <PathItemStylePicker
          path={path}
          setPaths={setPaths}
        />
      </div>
    </div>
  )
}
