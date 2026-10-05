import { notification } from "antd";
import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

type VideoPlayerProps = {
  url: string;
  watchedUntil: number;
  isCompleted: boolean;
  onTimeUpdate: (currentTime: number, totalDuration: number) => void;
};

const VideoPlayer = ({ url, watchedUntil, isCompleted, onTimeUpdate }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const watchedDuration = useRef<any>(watchedUntil || 0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      const player: any = videojs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: "auto",
        fluid: true, // Make the player responsive
      });

      playerRef.current = player;

      if (!isCompleted) {
        // Set initial playback position to the saved watched duration if not completed
        player.currentTime(watchedDuration.current);
      }

      const handleTimeUpdate = () => {
        if (!isSeeking) {
          watchedDuration.current = player.currentTime();
          const totalDuration = player.duration();
          onTimeUpdate(watchedDuration.current, totalDuration);
        };
      };

      player.on("timeupdate", handleTimeUpdate);

      player.on("seeking", () => {
        setIsSeeking(true);
        if (!isCompleted && player.currentTime() > watchedDuration.current + 10) {
          player.currentTime(watchedDuration.current);
          notification.warning({
            message: "Warning",
            description: "Bạn không thể kéo qua đoạn chưa xem.",
            placement: "bottomRight",
          });
          player.dispose();
        }
      });

      player.on("seeked", () => {
        setIsSeeking(false);
      });

      player.on("ended", () => {
        const totalDuration = player.duration();
        if (watchedDuration.current >= totalDuration - 10) {
          onTimeUpdate(totalDuration, totalDuration); // Ensure the progress is marked as completed
        }
      });

      return () => {
        if (player) {
          player.off("timeupdate", handleTimeUpdate);
        }
      };
    }
  }, [onTimeUpdate]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.src({ src: url, type: "video/mp4" });
      playerRef.current.load();
    }
  }, [url, onTimeUpdate, isCompleted]);

  return (
    <div>
      <video ref={videoRef} className="video-js vjs-default-skin" />
    </div>
  );
};

export default VideoPlayer;

