"use client"

import type React from "react"

import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from "react"
import type { Artist, Album, Song } from "@/lib/music-library"
import { musicLibrary } from "@/lib/music-library"

type NavigationLevel = "artists" | "albums" | "songs" | "nowPlaying"

interface NavigationState {
  level: NavigationLevel
  selectedArtist: Artist | null
  selectedAlbum: Album | null
  selectedSong: Song | null
}

interface MusicPlaybackContextType {
  navigation: NavigationState
  setNavigation: (state: NavigationState) => void
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  volume: number
  setVolume: (volume: number) => void
  playerRef: React.MutableRefObject<any>
}

const MusicPlaybackContext = createContext<MusicPlaybackContextType | undefined>(undefined)

export function MusicPlaybackProvider({ children }: { children: ReactNode }) {
  const [navigation, setNavigation] = useState<NavigationState>({
    level: "artists",
    selectedArtist: null,
    selectedAlbum: null,
    selectedSong: null,
  })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(50)
  const playerRef = useRef<any>(null)
  const [playerReady, setPlayerReady] = useState(false)
  const previousSongRef = useRef<Song | null>(null)
  const isPlayingRef = useRef(isPlaying)
  const isLoadingRef = useRef(false)
  const navigationRef = useRef(navigation)

  useEffect(() => {
    navigationRef.current = navigation
  }, [navigation])

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  const playNextSong = () => {
    const currentNavigation = navigationRef.current

    console.log("[v0] playNextSong called", {
      selectedSong: currentNavigation.selectedSong?.title,
      selectedAlbum: currentNavigation.selectedAlbum?.name,
      selectedArtist: currentNavigation.selectedArtist?.name,
    })

    if (!currentNavigation.selectedSong || !currentNavigation.selectedAlbum || !currentNavigation.selectedArtist) {
      console.log("[v0] playNextSong: Missing song, album, or artist")
      return
    }

    const currentArtist = currentNavigation.selectedArtist
    const currentAlbum = currentNavigation.selectedAlbum
    const currentSong = currentNavigation.selectedSong

    // Find current indices
    const artistIndex = musicLibrary.findIndex((a) => a.name === currentArtist.name)
    const albumIndex = currentArtist.albums.findIndex((a) => a.name === currentAlbum.name)
    const songIndex = currentAlbum.songs.findIndex((s) => s.id === currentSong.id)

    console.log("[v0] Current indices:", { artistIndex, albumIndex, songIndex })

    // Try to play next song in current album
    if (songIndex < currentAlbum.songs.length - 1) {
      const nextSong = currentAlbum.songs[songIndex + 1]
      console.log("[v0] Playing next song in album:", nextSong.title)
      setNavigation({
        ...currentNavigation,
        selectedSong: nextSong,
      })
      setIsPlaying(true)
      return
    }

    // Try to play first song of next album
    if (albumIndex < currentArtist.albums.length - 1) {
      const nextAlbum = currentArtist.albums[albumIndex + 1]
      const nextSong = nextAlbum.songs[0]
      console.log("[v0] Playing first song of next album:", nextAlbum.name, "-", nextSong.title)
      setNavigation({
        ...currentNavigation,
        selectedAlbum: nextAlbum,
        selectedSong: nextSong,
      })
      setIsPlaying(true)
      return
    }

    // Try to play first song of first album of next artist
    if (artistIndex < musicLibrary.length - 1) {
      const nextArtist = musicLibrary[artistIndex + 1]
      const nextAlbum = nextArtist.albums[0]
      const nextSong = nextAlbum.songs[0]
      console.log("[v0] Playing first song of next artist:", nextArtist.name)
      setNavigation({
        level: "nowPlaying",
        selectedArtist: nextArtist,
        selectedAlbum: nextAlbum,
        selectedSong: nextSong,
      })
      setIsPlaying(true)
      return
    }

    // Loop back to first artist, first album, first song
    const firstArtist = musicLibrary[0]
    const firstAlbum = firstArtist.albums[0]
    const firstSong = firstAlbum.songs[0]
    console.log("[v0] Looping back to first artist:", firstArtist.name)
    setNavigation({
      level: "nowPlaying",
      selectedArtist: firstArtist,
      selectedAlbum: firstAlbum,
      selectedSong: firstSong,
    })
    setIsPlaying(true)
  }

  useEffect(() => {
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    ;(window as any).onYouTubeIframeAPIReady = () => {
      playerRef.current = new (window as any).YT.Player("youtube-player", {
        height: "0",
        width: "0",
        playerVars: {
          autoplay: 0,
          controls: 0,
          playsinline: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: () => {
            console.log("[v0] YouTube player ready")
            setPlayerReady(true)
          },
          onStateChange: (event: any) => {
            console.log("[v0] YouTube player state changed:", event.data)
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              isLoadingRef.current = false
              isPlayingRef.current = true
              setIsPlaying(true)
            } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
              isLoadingRef.current = false
              isPlayingRef.current = false
              setIsPlaying(false)
            } else if (event.data === (window as any).YT.PlayerState.ENDED) {
              console.log("[v0] Song ended, calling playNextSong")
              isLoadingRef.current = false
              isPlayingRef.current = false
              setIsPlaying(false)
              playNextSong()
            }
          },
          onError: (event: any) => {
            console.error("[v0] YouTube player error:", event.data)
            isLoadingRef.current = false
          },
        },
      })
    }
  }, [])

  useEffect(() => {
    if (playerReady && playerRef.current && navigation.selectedSong) {
      const songChanged = previousSongRef.current?.id !== navigation.selectedSong.id

      if (songChanged && !isLoadingRef.current) {
        previousSongRef.current = navigation.selectedSong
        isLoadingRef.current = true

        try {
          if (isPlaying) {
            // Load and play immediately
            playerRef.current.loadVideoById({
              videoId: navigation.selectedSong.id,
              startSeconds: 0,
            })
          } else {
            // Just cue the video without playing
            playerRef.current.cueVideoById({
              videoId: navigation.selectedSong.id,
              startSeconds: 0,
            })
          }
        } catch (error) {
          console.error("Error loading video:", error)
          isLoadingRef.current = false
        }
      }
    }
  }, [navigation.selectedSong, playerReady, isPlaying])

  useEffect(() => {
    if (playerReady && playerRef.current && navigation.selectedSong) {
      // Only control playback if we're not loading a new song
      if (!isLoadingRef.current) {
        console.log("[v0] Playback control - isPlaying:", isPlaying, "isPlayingRef:", isPlayingRef.current)

        if (isPlaying) {
          try {
            console.log("[v0] Calling playVideo()")
            playerRef.current.playVideo()
          } catch (error) {
            console.error("Error playing video:", error)
          }
        } else {
          try {
            console.log("[v0] Calling pauseVideo()")
            playerRef.current.pauseVideo()
          } catch (error) {
            console.error("Error pausing video:", error)
          }
        }
      }
    }
  }, [isPlaying, playerReady, navigation.selectedSong])

  useEffect(() => {
    if (playerReady && playerRef.current) {
      playerRef.current.setVolume(volume)
    }
  }, [volume, playerReady])

  return (
    <MusicPlaybackContext.Provider
      value={{
        navigation,
        setNavigation,
        selectedIndex,
        setSelectedIndex,
        isPlaying,
        setIsPlaying,
        volume,
        setVolume,
        playerRef,
      }}
    >
      <div id="youtube-player" style={{ display: "none" }}></div>
      {children}
    </MusicPlaybackContext.Provider>
  )
}

export function useMusicPlayback() {
  const context = useContext(MusicPlaybackContext)
  if (context === undefined) {
    throw new Error("useMusicPlayback must be used within a MusicPlaybackProvider")
  }
  return context
}
