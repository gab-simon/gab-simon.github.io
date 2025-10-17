"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { IPodClassic } from "./ipod-classic";
import { MusicPlaybackProvider } from "@/contexts/music-playback-context";

const BASE_WIDTH = 100; // reference width that ALL devices render within

type DeviceType =
  | "ipod-classic"
  | "ipod-nano-6"
  | "nokia-3310"
  | "sony-walkman";

interface Device {
  id: DeviceType;
  name: string;
  component: React.ComponentType<{ isActive: boolean; deviceName: string }>;
}

const devices: Device[] = [
  { id: "ipod-classic", name: "iPod Classic", component: IPodClassic },
];

export function Device() {
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(2); // Start with iPod Classic (now at index 2)
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(2);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [vw, setVw] = useState<number>(
    typeof window === "undefined" ? 1024 : window.innerWidth
  );
  const [vh, setVh] = useState<number>(
    typeof window === "undefined" ? 768 : window.innerHeight
  );

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const renderRange = 0;
  const renderedDevices = [];

  const availableHeight = vh - (isMobile ? 100 : 120); // Reduced mobile reserved space from 180px to 100px since buttons are now closer
  const heightBasedScale = availableHeight / (BASE_WIDTH * 2);
  const widthBasedScale = (vw * 0.9) / BASE_WIDTH;

  const fitScale = Math.min(widthBasedScale, heightBasedScale, 1);

  const spacing =
    BASE_WIDTH * fitScale * (isMobile ? 0.85 : isTablet ? 0.9 : 0.95);

  console.log(
    "[v0] Carousel render - vw:",
    vw,
    "vh:",
    vh,
    "widthScale:",
    widthBasedScale,
    "heightScale:",
    heightBasedScale,
    "fitScale:",
    fitScale,
    "spacing:",
    spacing,
    "isMobile:",
    isMobile,
    "isTablet:",
    isTablet
  );

  for (let offsetPos = -renderRange; offsetPos <= renderRange; offsetPos++) {
    const virtualIndex = scrollPosition + offsetPos;
    const deviceIndex =
      ((virtualIndex % devices.length) + devices.length) % devices.length;
    const device = devices[deviceIndex];
    const DeviceComponent = device.component;
    const isActive = offsetPos === 0;

    const activeScale = isMobile ? 1.3 : isTablet ? 0.85 : 1; // Increased mobile scale from 0.7 to 0.875 (25% increase)
    const inactiveScale = isMobile ? 0.75 : isTablet ? 0.75 : 0.8; // Increased mobile scale from 0.56 to 0.7 (25% increase)
    const finalScale = fitScale * (isActive ? activeScale : inactiveScale);

    const centerOffset = BASE_WIDTH / 2; // 250px - half of the fixed container width

    console.log(
      `[v0] Device ${device.name} (${
        isActive ? "ACTIVE" : "inactive"
      }) - width: ${BASE_WIDTH}px, finalScale: ${finalScale}, rendered width: ${
        BASE_WIDTH * finalScale
      }px, height: auto (aspect-ratio based)`
    );

    renderedDevices.push(
      <div
        key={`${device.id}-${virtualIndex}`}
        className={`absolute left-1/2 top-1/2 transition-all duration-700 ease-in-out ${
          isActive ? "opacity-100" : "opacity-0 md:opacity-50"
        }`}
        style={{
          transform: `translateX(-${centerOffset}px) translateX(${
            offsetPos * spacing
          }px) translateY(${isMobile ? "-55%" : "-50%"})`,
          transformOrigin: "center center",
          zIndex: isActive ? 10 : 1,
          pointerEvents: isActive ? "auto" : "none",
          width: `${BASE_WIDTH}px`,
          height: "auto",
        }}
      >
        <div
          className="flex items-center justify-center w-full h-full transition-transform duration-700"
          style={{
            transform: `scale(${finalScale})`,
            transformOrigin: "center center",
          }}
        >
          <DeviceComponent isActive={isActive} deviceName={device.name} />
        </div>
      </div>
    );
  }

  return (
    <MusicPlaybackProvider>
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden px-4 md:px-0">
        <div className="relative flex items-center justify-center w-full">
          {renderedDevices}
        </div>
      </div>
    </MusicPlaybackProvider>
  );
}
