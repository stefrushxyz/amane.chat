import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-cpu'
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm'
tfjsWasm.setWasmPaths(`https://cdn.jsdelivr.net/npm/@tensorflow/` +
                      `tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`)
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'
import React, { useState, useEffect, useRef, createContext } from 'react'
import Webcam from './Webcam'

export const BACKENDS = ['webgl', 'wasm', 'cpu']

export const FaceModelContext = createContext({
  animationFrameId: -1,
  facepoints: [],
})

export default function FaceModel({
  children,
  initialBackend=BACKENDS[0],
  maxFaces=1,
}) {
  const [animationFrameId, setAnimationFrameId] = useState(-1)
  const [facepoints, setFacepoints] = useState([])
  const [backend, setBackend] = useBackend(initialBackend)
  const [model, setModel] = useModel(maxFaces)
  const [webcamOn, setWebcamOn] = useState(false)
  const inputRef = useRef()

  useEffect(async () => {
    if (model === null || !webcamOn) {
      return
    }

    const estimateNextFrame = async () => {
      const faces = await model.estimateFaces({
        input: inputRef.current,
        returnTensors: false,
        flipHorizontal: false,
        predictIrises: false,
      })

      setFacepoints(faces.length > 0 ? faces[0].scaledMesh : [])

      setAnimationFrameId(window.requestAnimationFrame(estimateNextFrame))
    }

    await estimateNextFrame()

    return () => window.cancelAnimationFrame(animationFrameId)
  }, [model, webcamOn])

  return (
    <>
    <FaceModelContext.Provider value={{ animationFrameId, facepoints }}>
      {children}
    </FaceModelContext.Provider>
    <Webcam
      inputRef={inputRef}
      setWebcamOn={setWebcamOn}
    />
    </>
  )
}

export function useBackend(initialValue) {
  const [value, setValue] = useState(initialValue)

  useEffect(async () => {
    await tf.setBackend(value)
  }, [value])

  return [value, setValue]
}

export function useModel(maxFaces) {
  const [value, setValue] = useState(null)

  useEffect(async () => {
    const model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
      { maxFaces },
    )
    setValue(model)
  }, [])

  return [value, setValue]
}
