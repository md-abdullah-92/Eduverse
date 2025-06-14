// hooks/useVideoPlayer.ts
import { RefObject, useCallback, useRef, useState } from "react";

interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
}

interface UseVideoPlayerProps {
  videoRef: RefObject<HTMLVideoElement>;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onError?: (error: string) => void;
  autoplay?: boolean;
}

export function useVideoPlayer({
  videoRef,
  onTimeUpdate,
  onError,
  autoplay = false,
}: UseVideoPlayerProps) {
  const [videoState, setVideoState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isLoading: false,
  });

  const [videoError, setVideoError] = useState<string | null>(null);

  // Use ref to track if we're already resetting to prevent infinite loops
  const isResettingRef = useRef(false);

  const resetState = useCallback(() => {
    // Prevent multiple resets from running simultaneously
    if (isResettingRef.current) return;

    isResettingRef.current = true;

    // Use a single state update to prevent multiple re-renders
    setVideoState((prev) => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      isLoading: true,
    }));

    setVideoError(null);

    // Reset the flag after state update
    setTimeout(() => {
      isResettingRef.current = false;
    }, 0);
  }, []);

  const play = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      await videoRef.current.play();
    } catch (error) {
      console.error("Play error:", error);
      setVideoState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, [videoRef]);

  const pause = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      await videoRef.current.pause();
    } catch (error) {
      console.error("Pause error:", error);
    }
  }, [videoRef]);

  const seek = useCallback(
    (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        setVideoState((prev) => ({ ...prev, currentTime: time }));
      }
    },
    [videoRef]
  );

  const setVolume = useCallback(
    (volume: number) => {
      if (videoRef.current) {
        videoRef.current.volume = volume;
        setVideoState((prev) => ({ ...prev, volume }));
      }
    },
    [videoRef]
  );

  const toggleFullscreen = useCallback(
    (containerRef: RefObject<HTMLDivElement>) => {
      if (containerRef.current) {
        if (!document.fullscreenElement) {
          containerRef.current.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    },
    []
  );

  // Event handlers
  const handleLoadStart = useCallback(() => {
    if (!isResettingRef.current) {
      setVideoState((prev) => ({ ...prev, isLoading: true }));
    }
  }, []);

  const handleLoadedData = useCallback(() => {
    if (!isResettingRef.current) {
      setVideoState((prev) => ({ ...prev, isLoading: false }));

      // Auto-play if enabled
      if (autoplay) {
        play();
      }
    }
  }, [autoplay, play]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current && !isResettingRef.current) {
      setVideoState((prev) => ({
        ...prev,
        duration: videoRef.current!.duration,
        isLoading: false,
      }));
    }
  }, [videoRef]);

  const handlePlay = useCallback(() => {
    if (!isResettingRef.current) {
      setVideoState((prev) => ({ ...prev, isPlaying: true }));
    }
  }, []);

  const handlePause = useCallback(() => {
    if (!isResettingRef.current) {
      setVideoState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || isResettingRef.current) return;

    const { currentTime, duration } = videoRef.current;
    setVideoState((prev) => ({ ...prev, currentTime, duration }));
    onTimeUpdate?.(currentTime, duration);
  }, [videoRef, onTimeUpdate]);

  const handleError = useCallback(() => {
    if (isResettingRef.current) return;

    const errorMessage =
      "Unable to load video. Please check if the video file exists and is accessible.";
    setVideoError(errorMessage);
    setVideoState((prev) => ({
      ...prev,
      isPlaying: false,
      isLoading: false,
    }));
    onError?.(errorMessage);
  }, [onError]);

  const controls = {
    play,
    pause,
    seek,
    setVolume,
    toggleFullscreen,
    resetState,
  };

  const eventHandlers = {
    onLoadStart: handleLoadStart,
    onLoadedData: handleLoadedData,
    onLoadedMetadata: handleLoadedMetadata,
    onPlay: handlePlay,
    onPause: handlePause,
    onTimeUpdate: handleTimeUpdate,
    onError: handleError,
  };

  return {
    videoState,
    videoError,
    controls,
    eventHandlers,
  };
}
