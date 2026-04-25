import { useEffect, useState } from 'react'

export function useGamepad() {
  const [controller, setController] = useState(null)
  const [axes, setAxes] = useState([0, 0, 0, 0])

  useEffect(() => {
    let frameId

    function readController() {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : []
      const connectedController = Array.from(gamepads).find(Boolean)

      if (connectedController) {
        setController({
          id: connectedController.id,
          index: connectedController.index,
          axesCount: connectedController.axes.length,
          buttonCount: connectedController.buttons.length,
        })

        setAxes([...connectedController.axes])
      } else {
        setController(null)
        setAxes([0, 0, 0, 0])
      }

      frameId = requestAnimationFrame(readController)
    }

    readController()

    return () => cancelAnimationFrame(frameId)
  }, [])

  return {
    controller,
    axes,
    leftStick: {
      x: axes[0] ?? 0,
      y: axes[1] ?? 0,
    },
    rightStick: {
      x: axes[2] ?? 0,
      y: axes[3] ?? 0,
    },
  }
}