import React from 'react'
import ScrollList from './ScrollList'
import PathItem from './PathItem'
import KeypressActions from './KeypressActions'

export default function PathList({
  paths,
  setPaths,
  editorMode,
  setEditorMode,
}) {
  function toggleAddingPathPoint(e) {
    const { editPathId } = editorMode
    const editPath = paths.find(({ id }) => id === editPathId)

    if (editPath !== undefined) {
      setEditorMode({
        ...editorMode,
        addingPathPoint: !editorMode.addingPathPoint,
        removingPathPoint: false,
        addingPath: false,
      })
    }
  }

  function toggleRemovingPathPoint(e) {
    const { editPathId } = editorMode
    const editPath = paths.find(({ id }) => id === editPathId)

    if (editPath !== undefined && editPath.points.length > 0) {
      setEditorMode({
        ...editorMode,
        removingPathPoint: !editorMode.removingPathPoint,
        addingPathPoint: false,
        addingPath: false,
      })
    }
  }

  return (
    <>
    <ScrollList
      items={paths}
      setItems={setPaths}
      expandedItemId={editorMode.editPathId}
      listClassName='path-list'
    >
      {paths.map((path) => {
        return <PathItem
          path={path}
          paths={paths}
          setPaths={setPaths}
          editorMode={editorMode}
          setEditorMode={setEditorMode}
          toggleAddingPathPoint={toggleAddingPathPoint}
          toggleRemovingPathPoint={toggleRemovingPathPoint}
          key={path.id}
        />
      })}
    </ScrollList>
    <KeypressActions
      keymap={[
        {
          key: 'a',
          shift: false,
          action: toggleAddingPathPoint,
        },
        {
          key: 'x',
          shift: false,
          action: toggleRemovingPathPoint,
        },
      ]}
    />
    </>
  )
}
