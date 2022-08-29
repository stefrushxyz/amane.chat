import React, { useState } from 'react'

export default function ActionButtonControl({
  action,
  label,
  icon,
  enabled=true,
  iconDisabled=null,
  tag='li',
  timeoutMs=600,
}) {
  const [active, setActive] = useState(false)

  function actionHandler(e) {
    if (enabled) {
      setActive(true)
      action(e)
      setTimeout(() => setActive(false), timeoutMs)
    }
  }

  const ActionButton = tag
  const activeIcon = !enabled && iconDisabled !== null ?
    iconDisabled :
    icon
  const classList = [
    'action-button',
    active ? 'active' : '',
    enabled ? '' : 'disabled',
  ].join(' ').trim()

  return (
    <ActionButton
      onClick={actionHandler}
      className={classList}
      aria-label={label}
    >{activeIcon}</ActionButton>
  )
}
