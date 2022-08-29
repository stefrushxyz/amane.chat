import React from 'react'
import {
  MdTagFaces,
  MdCenterFocusWeak,
  MdPauseCircleOutline,
  MdAllOut,
} from 'react-icons/md'
import ToggleButtonControl from './ToggleButtonControl'
import SliderControl from './SliderControl'
import KeypressActions from './KeypressActions'

export default function EditorViewControls({
  viewSettings,
  setViewSettings,
}) {
  function toggleCentered() {
    setViewSettings({ ...viewSettings, center: !viewSettings.center })
  }

  function toggleZoomed() {
    setViewSettings({ ...viewSettings, zoom: !viewSettings.zoom })
  }

  function updateZoomLevel(zoomLevel) {
    setViewSettings({ ...viewSettings, zoomLevel })
  }

  function toggleShowFacepoints() {
    setViewSettings({
      ...viewSettings,
      showFacepoints: !viewSettings.showFacepoints,
    })
  }

  function togglePaused() {
    setViewSettings({ ...viewSettings, pause: !viewSettings.pause })
  }

  return (
    <ul className='editor-view-controls controls large vertical'>
      <ToggleButtonControl
        value={viewSettings.showFacepoints}
        toggleValueHandler={toggleShowFacepoints}
        label='Show/Hide Facepoints'
        icon={<MdTagFaces />}
      />
      <ToggleButtonControl
        value={viewSettings.center}
        toggleValueHandler={toggleCentered}
        label='Center/Uncenter'
        icon={<MdCenterFocusWeak />}
      />
      <ToggleButtonControl
        value={viewSettings.zoom}
        toggleValueHandler={toggleZoomed}
        label='Zoom/Unzoom'
        icon={<MdAllOut />}
        enabled={viewSettings.center}
      />
      <SliderControl
        value={viewSettings.zoomLevel}
        valueUpdateHandler={updateZoomLevel}
        label='Zoom Level'
        active={viewSettings.zoom}
        enabled={viewSettings.center}
      />
      <ToggleButtonControl
        value={viewSettings.pause}
        toggleValueHandler={togglePaused}
        label='Pause/Play'
        icon={<MdPauseCircleOutline />}
      />
      <KeypressActions
        keymap={[
          {
            key: 'f',
            shift: false,
            action: toggleShowFacepoints,
          },
          {
            key: 'c',
            shift: false,
            action: toggleCentered,
          },
          {
            key: 'z',
            shift: false,
            action: toggleZoomed,
          },
          {
            key: 'p',
            shift: false,
            action: togglePaused,
          },
        ]}
      />
    </ul>
  )
}
