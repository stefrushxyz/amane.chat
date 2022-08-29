import React from 'react'

export default function ToggleButtonControl({
  value,
  toggleValueHandler,
  label,
  icon,
  enabled=true,
  iconDisabled=null,
  tag='li',
}) {
  const ToggleButton = tag
  const activeIcon = !enabled && iconDisabled !== null ?
    iconDisabled :
    icon
  const classList = [
    'toggle-button',
    value ? 'active' : '',
    enabled ? '' : 'disabled',
  ].join(' ').trim()

  return (
    <ToggleButton
      onClick={toggleValueHandler}
      className={classList}
      aria-label={label}
    >{activeIcon}</ToggleButton>
  )
}
