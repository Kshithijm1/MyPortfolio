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
    
    // Base configuration
    let targetZ = 15
    let targetFov = 45

    if (isMobile) {
        // Mobile: Move further back to fit the orbital system in portrait
        targetZ = 20 
        targetFov = 50
    } else {
        // Desktop: Standard distance
        targetZ = 12
        targetFov = 40
    }

    // Smooth adjustment or direct set? 
    // For now, direct set to ensure initial load is correct.
    camera.position.z = targetZ
    camera.fov = targetFov
    camera.updateProjectionMatrix()

  }, [size.width, size.height, camera])
}
