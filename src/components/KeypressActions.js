import React, { useEffect } from 'react'

export default function KeypressActions({ keymap }) {
  useEffect(() => {
    function executeKeypressAction(e) {
      const pressed = keymap.find(({ key, shift }) => {
        return e.key.toLowerCase() === key && e.shiftKey === shift
      })
      
      if (pressed !== undefined) {
        pressed.action(e)
      }
    }

    window.addEventListener('keypress', executeKeypressAction)

    return () => {
      window.removeEventListener('keypress', executeKeypressAction)
    }
  }, [keymap])

  return <></>
}
