"use client";

import React, { useEffect, useState } from "react";
import { Card, Collapse, Spin, List, Button, Row, Col, Typography } from "antd";
import { CheckCircleOutlined } from '@ant-design/icons';
import { useGetCourseDetailQuery } from "@/api/Learning/apiLearning";
import LessonDetail from "@/components/FunctionsManagement/Learning/LessonDetail";
import jwt_decode from "jwt-decode";

const { Panel } = Collapse;

type CourseDetailPageProps = {
  courseId: string;
};

const CourseDetailPage = ({ courseId }: CourseDetailPageProps) => {
  const { data: course, error, isLoading, refetch } = useGetCourseDetailQuery(courseId);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];

      if (token) {
        try {
          const decodedToken: { user_id: number } = jwt_decode(token);
          setUserId(decodedToken.user_id);
        } catch (e) {
          console.error("Decoding access token failed", e);
        }
      }
    }
  }, []);

  if (isLoading) return <Spin size="large" />;
  if (error) return <div>Error loading course details</div>;
  return (
    <div className="course-detail-page">
      <Row gutter={16} justify="center">
        <Col xs={24} md={16} className="lesson-detail">
          {selectedLesson !== null ? (
            <LessonDetail lesson={selectedLesson} userId={userId} refetch={refetch} />
          ) : (
            <div>Select a lesson to view its details</div>
          )}
        </Col>
        <Col xs={24} md={8} className="course-detail-card">
          <Card title={course.title}>
            <Collapse accordion>
              {course.modules.map((module: any) => (
                <Panel header={`Module: ${module.title}`} key={module.id}>
                  <List
                    dataSource={module.lessons}
                    renderItem={(lesson: any) => {
                      // Check if the current user has completed this lesson
                      const userProgress = lesson.progress.find(
                        (progress: any) => progress?.user === userId
                      );
                      const isCompleted = userProgress && userProgress.status === 'completed';
                      return (
                        <List.Item key={lesson.id}>
                          <Button type="link" onClick={() => setSelectedLesson(lesson)}>
                            {lesson.title} {isCompleted && (
                              <CheckCircleOutlined style={{ color: 'green' }} rev={undefined} />
                            )}
                          </Button>
                        </List.Item>
                      );
                    }}
                  />
                </Panel>
              ))}
            </Collapse>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CourseDetailPage;
