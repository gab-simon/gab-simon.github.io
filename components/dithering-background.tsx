/** @paper-design/shaders-react@0.0.52 */
import { Dithering } from "@paper-design/shaders-react";

interface DitheringBackgroundProps {
  className?: string;
}

export default function DitheringBackground({
  className = "",
}: DitheringBackgroundProps) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Dithering
        colorBack="#00000000"
        colorFront="#56AE6C"
        speed={0.35}
        shape="warp"
        type="2x2"
        pxSize={4.3}
        scale={0.90}
        style={{
          backgroundColor: "#1A1A1C",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
