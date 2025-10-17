/** @paper-design/shaders-react@0.0.52 */
import { Dithering } from "@paper-design/shaders-react"

interface DitheringBackgroundProps {
  className?: string
}

export default function DitheringBackground({ className = "" }: DitheringBackgroundProps) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Dithering
        colorBack="#00000000"
        colorFront="#56AE6C"
        speed={1.35}
        shape="simplex"
        type="4x4"
        pxSize={2.3}
        scale={0.59}
        style={{
          backgroundColor: "#1A1A1C",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  )
}