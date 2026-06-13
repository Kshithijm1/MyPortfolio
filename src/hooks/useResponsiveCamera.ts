import { useThree } from '@react-three/fiber'

/**
 * Responsive camera configuration. The CameraDirector owns the camera every
 * frame, so this hook no longer writes to it directly — it derives the
 * per-breakpoint framing parameters the director applies:
 *   Mobile (<768px): pull the camera further back and widen FOV so the
 *   planetary system fits a portrait viewport.
 */
export const useResponsiveCamera = () => {
    const { size } = useThree()
    const isMobile = size.width < 768

    return {
        isMobile,
        /** Multiplier on camera-to-subject distance */
        distanceScale: isMobile ? 1.35 : 1,
        /** Added to every section's target FOV */
        fovOffset: isMobile ? 6 : 0,
    }
}
