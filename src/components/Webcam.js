import React, { useEffect } from 'react'

export default function Webcam({ inputRef, setWebcamOn }) {
  useEffect(async () => {
    async function requestWebcam(video) {
      video.srcObject = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
          facingMode: 'user',
          width: undefined,
          height: undefined,
        },
      })

      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play()
          setWebcamOn(true)
          resolve(video)
        }
      })
    }
    await requestWebcam(inputRef.current)
  }, [])

  return (
    <video ref={inputRef} className='input'></video>
  )
}

