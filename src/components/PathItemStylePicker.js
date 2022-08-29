import React, { useState, useEffect } from 'react'
import Tabs from './Tabs'
import { rgbaToHex, hexToRgba } from '../utilities/color'

export default function PathItemStylePicker({
  path,
  setPaths,
}) {
  return (
    <Tabs
      classList='path-style-picker'
      tabs={[
        {
          title: 'Fill',
          contents: <FillStyle
            path={path}
            setPaths={setPaths}
          />,
        },
        {
          title: 'Stroke',
          contents: <StrokeStyle
            path={path}
            setPaths={setPaths}
          />,
        },
      ]}
    />
  )
}

function FillStyle({
  path,
  setPaths,
}) {
  function updateFillRadius(fillRadius) {
    setPaths((pathItem) => {
      if (pathItem.id === path.id) {
        return { ...pathItem, fillRadius }
      }
      else {
        return pathItem
      }
    })
  }

  function updateFillColor(fillColor) {
    setPaths((pathItem) => {
      if (pathItem.id === path.id) {
        return { ...pathItem, fillColor }
      }
      else {
        return pathItem
      }
    })
  }

  return (
    <div className='fill-style style-input'>
      <NumberInput
        label='Radius'
        value={path.fillRadius}
        valueChangeHandler={updateFillRadius}
        minValue={1}
        maxValue={999}
        enabled={path.points.length < 2}
      />
      <ColorInput
        value={path.fillColor}
        valueChangeHandler={updateFillColor}
      />
    </div>
  )
}

function StrokeStyle({
  path,
  setPaths,
}) {
  function updateStrokeWidth(strokeWidth) {
    setPaths((pathItem) => {
      if (pathItem.id === path.id) {
        return { ...pathItem, strokeWidth }
      }
      else {
        return pathItem
      }
    })
  }

  function updateStrokeColor(strokeColor) {
    setPaths((pathItem) => {
      if (pathItem.id === path.id) {
        return { ...pathItem, strokeColor }
      }
      else {
        return pathItem
      }
    })
  }

  return (
    <div className='stroke-style style-input'>
      <NumberInput
        label='Width'
        value={path.strokeWidth}
        valueChangeHandler={updateStrokeWidth}
        minValue={0}
        maxValue={999}
      />
      <ColorInput
        value={path.strokeColor}
        valueChangeHandler={updateStrokeColor}
      />
    </div>
  )
}

function NumberInput({
  label,
  value,
  valueChangeHandler,
  minValue,
  maxValue,
  enabled=true,
}) {
  const classList = [
    'input',
    !enabled ? 'disabled' : '',
  ].join(' ').trim()

  return (
    <div className={classList}>
      <label>{label}</label>
      <input 
        type='number'
        min={minValue}
        max={maxValue}
        value={value}
        onChange={(e) => valueChangeHandler(e.target.value)}
      />
    </div>
  )
}

function ColorInput({ value, valueChangeHandler }) {
  const [rgba, setRgba] = useState(hexToRgba(value))
  const [inputMode, setInputMode] = useState({
    changingRgba: false,
    changingHex: false,
  })

  useEffect(() => {
    if (inputMode.changingHex) {
      setRgba(hexToRgba(value))
    }
    else if (inputMode.changingRgba) {
      valueChangeHandler(rgbaToHex(rgba))
    }

    setInputMode({ ...inputMode, changingHex: false, changingRgba: false })
  }, [value, rgba])

  return (
    <>
      <div className='input'>
        <label>R</label>
        <input
          type='number'
          min={0}
          max={255}
          value={rgba.red}
          onChange={(e) => {
            setInputMode({ ...inputMode, changingRgba: true })
            setRgba({ ...rgba, red: Number.parseInt(e.target.value, 10) })
          }}
        />
      </div>
      <div className='input'>
        <label>G</label>
        <input
          type='number'
          min={0}
          max={255}
          value={rgba.green}
          onChange={(e) => {
            setInputMode({ ...inputMode, changingRgba: true })
            setRgba({ ...rgba, green: Number.parseInt(e.target.value, 10) })
          }}
        />
      </div>
      <div className='input'>
        <label>B</label>
        <input
          type='number'
          min={0}
          max={255}
          value={rgba.blue}
          onChange={(e) => {
            setInputMode({ ...inputMode, changingRgba: true })
            setRgba({ ...rgba, blue: Number.parseInt(e.target.value, 10) })
          }}
        />
      </div>
      <div className='input'>
        <label>A</label>
        <input
          type='number'
          min={0}
          max={255}
          value={rgba.alpha}
          onChange={(e) => {
            setInputMode({ ...inputMode, changingRgba: true })
            setRgba({ ...rgba, alpha: Number.parseInt(e.target.value, 10) })
          }}
        />
      </div>
      <div className='input'>
        <label>#</label>
        <input
          type='text'
          spellCheck={false}
          value={value}
          onChange={(e) => {
            setInputMode({ ...inputMode, changingHex: true })
            valueChangeHandler(e.target.value)
          }}
        />
      </div>
    </>
  )
}
