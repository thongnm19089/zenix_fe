import React, { useCallback, useRef } from "react";
import { Card, Typography } from "antd";
import VideoPlayer from "@/components/Video/VideoPlayer";
import { useUpdateOrCreateProgressMutation } from "@/api/Learning/apiLearning";

const { Title } = Typography;

type LessonDetailProps = {
  lesson: {
    id: number;
    title: string;
    content: string;
    video: string;
    progress?: {
      user: number;
      watched_duration: number;
      status: string;
    }[];
  };
  userId: any;  // Pass the userId as a prop
  refetch: () => void;  // Pass the refetch function as a prop
};

const LessonDetail = ({ lesson, userId, refetch }: LessonDetailProps) => {
  const [updateOrCreateProgress] = useUpdateOrCreateProgressMutation();
  const lastUpdateRef = useRef<number>(0);

  // Find the progress for the current user
  const progress = lesson.progress?.find(prog => prog.user === userId);

  const handleTimeUpdate = useCallback(
    (currentTime: number, totalDuration: number) => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 5000) {
        updateOrCreateProgress({
          lesson_id: lesson.id,
          watched_duration: currentTime,
          total_duration: totalDuration,
        }).then(() => {
          // If the user has watched 75% or more, mark it as completed
          if (currentTime / totalDuration >= 0.75) {
            refetch();  // Refetch the data to reflect the completed status
          }
        });
        lastUpdateRef.current = now;
      }
    },
    [lesson.id, refetch, updateOrCreateProgress]
  );

  return (
    <Card title={lesson.title}>
      <Title level={4}>Content</Title>
      <p>{lesson.content}</p>
      <Title level={4}>Video</Title>
      <VideoPlayer
        url={lesson.video}
        watchedUntil={progress?.watched_duration || 0}
        isCompleted={progress?.status === "completed"}
        onTimeUpdate={handleTimeUpdate}
      />
    </Card>
  );
};

export default LessonDetail;
