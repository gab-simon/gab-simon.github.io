"use client"
import { useState, useEffect, useCallback } from "react"
import { IPodDisplay } from "./ipod-display"
import { ClickWheel } from "./click-wheel"
import { musicLibrary, type Artist, type Album, type Song } from "@/lib/music-library"
import { useMusicPlayback } from "@/contexts/music-playback-context"

export function IPodClassic({
  isActive = true,
  deviceName = "iPod Classic",
}: { isActive?: boolean; deviceName?: string }) {
  const { navigation, setNavigation, selectedIndex, setSelectedIndex, isPlaying, setIsPlaying, volume, setVolume } =
    useMusicPlayback()

  const [hideUI, setHideUI] = useState(false)

  useEffect(() => {
    if (navigation.level === "nowPlaying" && isPlaying) {
      const timer = setTimeout(() => {
        setHideUI(true)
      }, 5000)

      return () => clearTimeout(timer)
    } else {
      setHideUI(false)
    }
  }, [navigation.level, isPlaying])

  const showUI = () => {
    setHideUI(false)
  }

  const getCurrentList = useCallback(() => {
    console.log("[v0] getCurrentList called. Level:", navigation.level)
    console.log("[v0] Selected Artist:", navigation.selectedArtist?.name)
    console.log("[v0] Selected Album:", navigation.selectedAlbum?.name)

    switch (navigation.level) {
      case "artists":
        console.log("[v0] Returning artists list, count:", musicLibrary.length)
        return musicLibrary
      case "albums":
        const albums = navigation.selectedArtist?.albums || []
        console.log("[v0] Returning albums list, count:", albums.length)
        console.log(
          "[v0] Albums:",
          albums.map((a) => a.name),
        )
        return albums
      case "songs":
        const songs = navigation.selectedAlbum?.songs || []
        console.log("[v0] Returning songs list, count:", songs.length)
        console.log(
          "[v0] Songs:",
          songs.map((s) => s.title),
        )
        return songs
      default:
        console.log("[v0] Returning empty list")
        return []
    }
  }, [navigation.level, navigation.selectedArtist, navigation.selectedAlbum])

  const handleSelect = () => {
    showUI()

    console.log("[v0] handleSelect called. Current level:", navigation.level, "Selected index:", selectedIndex)

    if (navigation.level === "nowPlaying") {
      setIsPlaying((prev) => !prev)
      return
    }

    const currentList = getCurrentList()

    if (navigation.level === "artists") {
      const artist = currentList[selectedIndex] as Artist
      console.log("[v0] Selecting artist:", artist.name)
      setNavigation({
        level: "albums",
        selectedArtist: artist,
        selectedAlbum: null,
        selectedSong: null,
      })
      setSelectedIndex(0)
    } else if (navigation.level === "albums") {
      const album = currentList[selectedIndex] as Album
      console.log("[v0] Selecting album:", album.name)
      setNavigation({
        ...navigation,
        level: "songs",
        selectedAlbum: album,
        selectedSong: null,
      })
      setSelectedIndex(0)
    } else if (navigation.level === "songs") {
      const song = currentList[selectedIndex] as Song
      console.log("[v0] Selecting song:", song.title)
      setNavigation({
        ...navigation,
        level: "nowPlaying",
        selectedSong: song,
      })
      setIsPlaying(true)
    }
  }

  const handleMenu = () => {
    showUI()

    console.log("[v0] handleMenu called. Current level:", navigation.level)
    console.log("[v0] Current navigation state:", {
      level: navigation.level,
      artist: navigation.selectedArtist?.name,
      album: navigation.selectedAlbum?.name,
      song: navigation.selectedSong?.title,
    })

    if (navigation.level === "nowPlaying") {
      setNavigation({
        level: "songs",
        selectedArtist: navigation.selectedArtist,
        selectedAlbum: navigation.selectedAlbum,
        selectedSong: navigation.selectedSong, // Keep song to highlight it in the list
      })
      const songs = navigation.selectedAlbum?.songs || []
      const currentSongIndex = songs.findIndex((s) => s.id === navigation.selectedSong?.id)
      const newIndex = currentSongIndex >= 0 ? currentSongIndex : 0
      console.log("[v0] Going back to songs. Setting index to:", newIndex)
      setSelectedIndex(newIndex)
    } else if (navigation.level === "songs") {
      const currentAlbum = navigation.selectedAlbum
      setNavigation({
        level: "albums",
        selectedArtist: navigation.selectedArtist,
        selectedAlbum: null,
        selectedSong: null,
      })
      const albums = navigation.selectedArtist?.albums || []
      const currentAlbumIndex = albums.findIndex((a) => a.name === currentAlbum?.name)
      const newIndex = currentAlbumIndex >= 0 ? currentAlbumIndex : 0
      console.log("[v0] Going back to albums. Current album:", currentAlbum?.name, "Setting index to:", newIndex)
      setSelectedIndex(newIndex)
    } else if (navigation.level === "albums") {
      setNavigation({
        level: "artists",
        selectedArtist: null,
        selectedAlbum: null,
        selectedSong: null,
      })
      const artistIndex = musicLibrary.findIndex((a) => a.name === navigation.selectedArtist?.name)
      const newIndex = artistIndex >= 0 ? artistIndex : 0
      console.log("[v0] Going back to artists. Setting index to:", newIndex)
      setSelectedIndex(newIndex)
    }
  }

  const handleScrollUp = () => {
    showUI()

    if (navigation.level !== "nowPlaying") {
      setSelectedIndex((prev) => Math.max(0, prev - 1))
    }
  }

  const handleScrollDown = () => {
    showUI()

    if (navigation.level !== "nowPlaying") {
      const currentList = getCurrentList()
      setSelectedIndex((prev) => Math.min(currentList.length - 1, prev + 1))
    }
  }

  const handleNext = () => {
    showUI()

    if (navigation.level === "nowPlaying" && navigation.selectedAlbum) {
      const songs = navigation.selectedAlbum.songs
      const currentIndex = songs.findIndex((s) => s.id === navigation.selectedSong?.id)
      if (currentIndex < songs.length - 1) {
        setNavigation({
          ...navigation,
          selectedSong: songs[currentIndex + 1],
        })
        setIsPlaying(true)
      }
    }
  }

  const handlePrevious = () => {
    showUI()

    if (navigation.level === "nowPlaying" && navigation.selectedAlbum) {
      const songs = navigation.selectedAlbum.songs
      const currentIndex = songs.findIndex((s) => s.id === navigation.selectedSong?.id)
      if (currentIndex > 0) {
        setNavigation({
          ...navigation,
          selectedSong: songs[currentIndex - 1],
        })
        setIsPlaying(true)
      }
    }
  }

  const handlePlayPause = () => {
    showUI()

    if (navigation.level === "nowPlaying") {
      setIsPlaying((prev) => !prev)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    showUI()
    setVolume(Math.max(0, Math.min(100, newVolume)))
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for navigation keys
      if (['w', 's', 'a', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault()
      }

      const key = e.key.toLowerCase()

      // Up navigation (W or ArrowUp)
      if (key === 'w' || key === 'arrowup') {
        handleScrollUp()
      }
      // Down navigation (S or ArrowDown)
      else if (key === 's' || key === 'arrowdown') {
        handleScrollDown()
      }
      // Left navigation (A or ArrowLeft) - Menu/Back or Previous track
      else if (key === 'a' || key === 'arrowleft') {
        if (navigation.level === "nowPlaying") {
          handlePrevious()
        } else {
          handleMenu()
        }
      }
      // Right navigation (D or ArrowRight) - Select or Next track
      else if (key === 'd' || key === 'arrowright') {
        if (navigation.level === "nowPlaying") {
          handleNext()
        } else {
          handleSelect()
        }
      }
      // Space - Play/Pause
      else if (key === ' ') {
        handlePlayPause()
      }
      // Enter - Select
      else if (key === 'enter') {
        handleSelect()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigation, selectedIndex, isPlaying])

  const isInMenu = navigation.level !== "nowPlaying"

  return (
    <div className="relative z-10 flex items-center justify-center">
      {/* Outer shadow/glow */}
      <div className="absolute w-[390px] md:w-[300px] lg:w-[390px] h-[630px] md:h-[485px] lg:h-[630px] bg-black/20 rounded-[42px] md:rounded-[32px] lg:rounded-[42px] blur-xl"></div>

      {/* iPod Body - Main shell with metallic gradient */}
      <div className="relative w-[380px] md:w-[293px] lg:w-[380px] h-[620px] md:h-[477px] lg:h-[620px] bg-gradient-to-br from-[#6a6a72] via-[#4a4a52] to-[#2a2a32] rounded-[40px] md:rounded-[31px] lg:rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset] border-[1px] border-[#1a1a22]">
        {/* Top highlight for glossy effect */}
        <div className="absolute top-0 left-0 right-0 h-[200px] md:h-[154px] lg:h-[200px] bg-gradient-to-b from-white/10 to-transparent rounded-t-[40px] md:rounded-t-[31px] lg:rounded-t-[40px] pointer-events-none"></div>

        {/* Inner bezel with depth */}
        <div className="absolute inset-[4px] md:inset-[3px] lg:inset-[4px] rounded-[36px] md:rounded-[28px] lg:rounded-[36px] bg-gradient-to-b from-[#3a3a42] via-[#4a4a52] to-[#3a3a42] shadow-[0_4px_12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(0,0,0,0.8)]">
          {/* Screen Area with inset bezel effect */}
          <div className="absolute top-8 md:top-[25px] lg:top-8 left-1/2 -translate-x-1/2 w-[320px] md:w-[246px] lg:w-[320px] h-[240px] md:h-[185px] lg:h-[240px]">
            {/* Screen bezel - outer frame */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a32] via-[#1a1a22] to-[#2a2a32] rounded-2xl md:rounded-xl lg:rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.1)]">
              {isActive ? (
                <div className="absolute inset-[3px] md:inset-[2px] lg:inset-[3px] bg-gradient-to-b from-[#e0e0e5] via-[#f5f5f7] to-[#d8d8dd] rounded-[14px] md:rounded-[11px] lg:rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.3)_inset,0_-1px_0_rgba(255,255,255,0.5)_inset] overflow-hidden">
                  {/* Screen glass reflection */}
                  <div className="absolute top-0 left-0 right-0 h-[60px] md:h-[46px] lg:h-[60px] bg-gradient-to-b from-white/30 to-transparent pointer-events-none z-10"></div>
                  <IPodDisplay
                    key={navigation.level}
                    navigation={navigation}
                    selectedIndex={selectedIndex}
                    isPlaying={isPlaying}
                    volume={volume}
                    hideUI={hideUI}
                  />
                </div>
              ) : (
                <div className="absolute inset-[3px] md:inset-[2px] lg:inset-[3px] bg-[#1a1a22] rounded-[14px] md:rounded-[11px] lg:rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.3)_inset] flex items-center justify-center">
                  <div className="text-white/90 text-2xl md:text-lg lg:text-2xl font-sans tracking-tight">
                    {deviceName}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Click Wheel */}
          <div className="absolute bottom-12 md:bottom-[37px] lg:bottom-12 left-1/2 -translate-x-1/2">
            <ClickWheel
              onNext={handleNext}
              onPrevious={handlePrevious}
              onPlayPause={handlePlayPause}
              onMenu={handleMenu}
              onSelect={handleSelect}
              onVolumeChange={handleVolumeChange}
              onScrollUp={handleScrollUp}
              onScrollDown={handleScrollDown}
              volume={volume}
              showPlaylist={isInMenu}
              isPlaying={isPlaying}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
