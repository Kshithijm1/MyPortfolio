import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { PerspectiveCamera } from 'three'

/**
 * Adjusts camera position and FOV based on screen width/aspect ratio.
 * Mobile (<768px): Moves camera back or widens FOV to fit content.
 * Desktop (>768px): Optimizes for wide layouts.
 */
export const useResponsiveCamera = () => {
  const { camera, size } = useThree()

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return

    const isMobile = size.width < 768

    if (isMobile) {
      camera.position.set(0, 2, 22)
      camera.fov = 50
    } else {
      camera.position.set(0, 2, 16)
      camera.fov = 40
    }

    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()

  }, [size.width, size.height, camera])
}
