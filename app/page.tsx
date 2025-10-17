import { Device } from "@/components/device-carousel"
import DitheringBackground from "@/components/dithering-background"

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#1a1a1a] flex items-center justify-center">
      <DitheringBackground />
      <Device />
    </main>
  )
}
