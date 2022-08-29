import React from 'react'
import { MdAddCircle, MdRemoveCircle } from 'react-icons/md'
import ToggleButtonControl from './ToggleButtonControl'
import PathPointItem from './PathPointItem'

export default function PathItemPointsList({
  path,
  setPaths,
  editorMode,
  setEditorMode,
  toggleAddingPathPoint,
  toggleRemovingPathPoint,
}) {
  return (
    <div className='path-points-editor'>
      <ul className='left-path-points-controls controls medium'>
        <ToggleButtonControl
          value={editorMode.addingPathPoint}
          toggleValueHandler={toggleAddingPathPoint}
          label='Add Path Point'
          icon={<MdAddCircle />}
        />
      </ul>
      <div className='path-points-list-container'>
        <ol className='path-points-list'>
          {path.points.map((point) => {
            return <PathPointItem
              point={point}
              path={path}
              setPaths={setPaths}
              editorMode={editorMode}
              setEditorMode={setEditorMode}
              key={point.id}
            />
          })}
        </ol>
      </div>
      <ul className='right-path-points-controls controls medium'>
        <ToggleButtonControl
          value={editorMode.removingPathPoint}
          toggleValueHandler={toggleRemovingPathPoint}
          label='Remove Path Point'
          icon={<MdRemoveCircle />}
          enabled={path.points.length > 0}
        />
      </ul>
    </div>
  )
}
