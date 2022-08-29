import React, { useState, useRef } from 'react'

export default function SliderControl({
  value,
  valueUpdateHandler,
  label,
  active=true,
  enabled=true,
  vertical=true,
  tag='li',
}) {
  const [dragging, setDragging] = useState(false)
  const sliderRef = useRef()

  function onMouseDown(e) {
    document.activeElement.blur()
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    onMouseMove(e)
  }

  const mouseMoveRate = 10
  let mouseMoveCounter = mouseMoveRate

  function onMouseMove(e) {
    e.preventDefault()

    if (mouseMoveCounter >= mouseMoveRate) {
      updateSliderOnDrag(e)
      mouseMoveCounter = 0
    }
    else {
      mouseMoveCounter += 1
    }
  }

  function onMouseUp(e) {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  function onTouchStart(e) {
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onTouchEnd)
    onTouchMove(e)
  }

  function onTouchMove(e) {
    if (e.touches.length !== 1) return
    const { clientX, clientY } = e.touches[0]
    updateSliderOnDrag({ ...e, clientX, clientY })
  }

  function onTouchEnd(e) {
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
  }

  function updateSliderOnDrag(e) {
    const slider = sliderRef.current
    const valueContainer = slider.children[0]

    const {
      top: sliderTop,
      left: sliderLeft,
    } = slider.getBoundingClientRect()

    const {
      width: valueContainerWidth,
      height: valueContainerHeight,
    } = valueContainer.getBoundingClientRect()

    const selectedPosition = vertical ?
      (e.clientY - sliderTop) / valueContainerHeight :
      (e.clientX - sliderLeft) / valueContainerWidth

    const sliderValue = 1 - Math.max(0, Math.min(0.999, selectedPosition))

    valueUpdateHandler(sliderValue)
  }

  function onWheel(e) {
    const wheelUp = e.deltaY < 0

    const wheelPosition = (value * 100 % 10 === 0) ?
      (wheelUp ? value + 0.1 : value - 0.1) :
      (wheelUp ? Math.ceil(value / 0.1) * 0.1 : Math.floor(value / 0.1) * 0.1)

    const sliderValue = Math.max(0.001, Math.min(1,
      Math.round(wheelPosition * 10) / 10
    ))

    valueUpdateHandler(sliderValue)
  }

  const SliderTag = tag
  const width = !vertical ? `${(1 - value) * 100}%` : 'inherit'
  const height = vertical ? `${(1 - value) * 100}%` : 'inherit'
  const classList = [
    'slider',
    active ? 'active' : '',
    enabled ? '' : 'disabled',
  ].join(' ').trim()

  return (
    <SliderTag
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onWheel={onWheel}
      className={classList}
      aria-label={label}
      ref={sliderRef}
    >
      <div className='value-container'>
        <div
          className='value'
          style={{ width, height }}
        ></div>
      </div>
    </SliderTag>
  )
}
