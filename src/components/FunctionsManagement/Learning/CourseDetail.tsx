import React, { useEffect, useState } from 'react';
import { useGetCourseDetailQuery, useDeleteLessonMutation, useDeleteModuleMutation, useDeleteEnrollmentMutation } from '@/api/Learning/apiLearning';
import { Card, Collapse, Spin, Typography, List, Tooltip, Avatar, Button, Popconfirm, notification, Rate } from 'antd';
import AddAndUpdateLesson from './AddAndUpdateLesson';
import AddAndUpdateModule from './AddAndUpdateModule';
import AddAndUpdateStudent from './AddAndUpdateStudent';
import { User } from "@/types/userTypes";
import { useTranslations } from 'next-intl';

const { Title } = Typography;
const { Panel } = Collapse;

const CourseDetail = ({ courseId }: { courseId: number }) => {
  const t: any = useTranslations();
  const { data: course, error, isLoading, refetch } = useGetCourseDetailQuery(courseId);
  const [user, setUser] = useState<User | null>(null);
  const [deleteLesson, { isLoading: isLoadingDelete }] = useDeleteLessonMutation();
  const [deleteModule, { isLoading: isLoadingModuleDelete }] = useDeleteModuleMutation();
  const [deleteEnrollment, { isLoading: isDeletingEnrollment }] = useDeleteEnrollmentMutation();

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    const parsedUserData = userDataString ? JSON.parse(userDataString) : null;
    setUser(parsedUserData);
  }, []);

  const isAdminOrCreator = (course: any) => {
    if (!user) return false;
    const isAdmin = course.admin_list.some((admin: any) => admin.username === user.username);
    const isCreator = course.user_creator.username === user.username;
    return isAdmin || isCreator;
  };

  const handleDeleteLesson = async (lessonId: number) => {
    try {
      await deleteLesson(lessonId);
      notification.success({
        message: 'Bài học đã xóa thành công',
        placement: 'bottomRight',
      });
      refetch();
    } catch (error) {
      notification.error({
        message: 'Bài học xóa thất bại',
        placement: 'bottomRight',
      });
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    try {
      await deleteModule(moduleId);
      notification.success({
        message: t("noficationDelete.deleteModuleSuccess"),
        placement: 'bottomRight',
      });
      refetch();
    } catch (error) {
      notification.error({
        message: t("noficationDelete.deleteModuleError"),
        placement: 'bottomRight',
      });
    }
  };

  const handleDeleteEnrollment = async (enrollmentId: number) => {
    try {
      await deleteEnrollment(enrollmentId);
      notification.success({
        message: 'Đã xóa sinh viên đăng ký thành công',
        placement: 'bottomRight',
      });
      refetch();
    } catch (error) {
      notification.error({
        message: 'Xóa sinh viên đăng ký thất bại',
        placement: 'bottomRight',
      });
    }
  };

  if (isLoading) return <Spin size="large" />;
  if (error) return <div>Error loading course details</div>;

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <div style={{ display: 'flex', marginBottom: '5px' }}>
          <img
            src={course?.image}
            alt={course?.title}
            style={{
              width: 150,
              height: 150,
              objectFit: 'cover',
              marginRight: '15px',
            }}
          />
          <div style={{ flex: 1 }}>
            <Title level={4} style={{ margin: 0 }}>
              {course.title}
            </Title>
            <p style={{ margin: 0, color: course?.category_str?.color }}>
              {course?.category_str?.name} - {course?.subcategory_str?.name}
            </p>
            <p style={{ margin: '10px 0' }}>{course?.description}</p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0 }}>
                  Created by: {course?.user_creator?.first_name}{' '}
                  {course?.user_creator?.last_name}
                </p>
              </div>
            </div>
          </div>
          {/* Right: Rating */}
          <div style={{ textAlign: 'right', minWidth: '100px' }}>
            <Rate disabled allowHalf value={course?.rating} />
            <span className="ant-rate-text" style={{ marginLeft: '8px' }}>
              {course?.rating}/5
            </span>
          </div>
        </div>
        <Collapse accordion>
          <Panel header={`${t("learning.module")} (${course?.modules?.length})`} key="Modules">
            {isAdminOrCreator(course) && (
              <div style={{ marginBottom: '20px' }}>
                <AddAndUpdateModule
                  edit={false}
                  module={null}
                  courseId={courseId}
                  refetch={refetch}
                />
              </div>
            )}
            <List
              dataSource={course?.modules}
              renderItem={(module: any) => (
                <List.Item key={module.id} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <List.Item.Meta title={module.title} />
                    {isAdminOrCreator(course) && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <AddAndUpdateModule
                          edit={true}
                          module={module}
                          courseId={courseId}
                          refetch={refetch}
                        />
                        <Popconfirm
                          title={t("noficationDelete.deleteModuleSure")}
                          onConfirm={() => handleDeleteModule(module.id)}
                          okText={t("table.yes")}
                          cancelText={t("table.no")}
                          placement="left"
                          okButtonProps={{ loading: isLoadingModuleDelete }}
                        >
                          <Button danger>{t("noficationDelete.deleteModule")}</Button>
                        </Popconfirm>
                        <AddAndUpdateLesson edit={false} module={module} lesson={undefined} refetch={refetch} />
                      </div>
                    )}
                  </div>
                  <Collapse accordion style={{ width: '100%' }}>
                    {module.lessons.map((lesson: any) => (
                      <Panel header={lesson.title} key={lesson.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <List.Item.Meta
                              title={lesson.title}
                              description={lesson.content}
                            />
                            {lesson.image && (
                              <img
                                src={lesson.image}
                                alt={lesson.title}
                                style={{ maxWidth: '100%', marginTop: '10px' }}
                              />
                            )}
                          </div>
                          {isAdminOrCreator(course) && (
                            <div style={{ marginLeft: '10px', display: 'flex', gap: '8px' }}>
                              <AddAndUpdateLesson edit={true} module={module} lesson={lesson} refetch={refetch} />
                              <Popconfirm
                                title={t("noficationDelete.deleteLessonSure")}
                                onConfirm={() => handleDeleteLesson(lesson.id)}
                                okText={t("table.yes")}
                                cancelText={t("table.no")}
                                placement="left"
                                okButtonProps={{ loading: isLoadingDelete }}
                              >
                                <Button danger>{t("noficationDelete.deleteLesson")}</Button>
                              </Popconfirm>
                            </div>
                          )}
                        </div>
                      </Panel>
                    ))}
                  </Collapse>
                </List.Item>
              )}
            />
          </Panel>

          <Panel header={`${t("learning.admin")} (${t("learning.lecturer")}) (${course.admin_list.length})`} key="admins">
            <List
              dataSource={course.admin_list}
              renderItem={(admin: any) => (
                <List.Item key={admin.username}>
                  <List.Item.Meta
                    avatar={
                      <Tooltip title={`${admin.first_name} ${admin.last_name}`}>
                        <Avatar src={admin?.user_profile?.image}>{!admin?.user_profile?.image && admin.first_name[0]}</Avatar>
                      </Tooltip>
                    }
                    title={`${admin.first_name} ${admin.last_name}`}
                  />
                </List.Item>
              )}
            />
          </Panel>

          {/* Students */}
          {isAdminOrCreator(course) && (
            <Panel header={`${t("learning.student")} (${course.student_list.length})`} key="students">
              <div style={{ marginBottom: '20px' }}>
                <AddAndUpdateStudent
                  courseId={courseId}
                  refetch={refetch}
                  studentList={course.student_list} // Passing student list here
                  edit={false}
                  enrollment={undefined}
                />
              </div>
              <List
                dataSource={course.student_list}
                renderItem={(student: any) => (
                  <List.Item key={student.student_info.username}>
                    <List.Item.Meta
                      avatar={
                        <Tooltip title={`${student.student_info.first_name} ${student.student_info.last_name}`}>
                          <Avatar src={student.student_info?.user_profile?.image}>
                            {!student.student_info?.user_profile?.image && student.student_info.first_name[0]}
                          </Avatar>
                        </Tooltip>
                      }
                      title={`${student.student_info.first_name} ${student.student_info.last_name}`}
                      description={`Joined on ${new Date(student.created).toLocaleDateString()}${student.start_date ? ` start date ${new Date(student.start_date).toLocaleDateString()}` : ''}${student.end_date ? ` end date ${new Date(student.end_date).toLocaleDateString()}` : ''}`}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* Edit Student */}
                      <AddAndUpdateStudent
                        edit={true}
                        enrollment={student} // Pass the current student enrollment data
                        courseId={courseId}
                        refetch={refetch}
                        studentList={[]}
                      />
                      {/* Delete Student */}
                      <Popconfirm
                        title={t("noficationDelete.deleteStudentSure")}
                        onConfirm={() => handleDeleteEnrollment(student.id)}
                        okText={t("table.yes")}
                        cancelText={t("table.no")}
                        placement="left"
                        okButtonProps={{ loading: isDeletingEnrollment }}
                      >
                        <Button danger>{t("noficationDelete.deleteStudent")}</Button>
                      </Popconfirm>
                    </div>
                  </List.Item>
                )}
              />
            </Panel>
          )}

          <Panel header={`${t("learning.assignment")} (${course.assignments.length})`} key="assignments">
            <List
              dataSource={course.assignments}
              renderItem={(assignment: any) => (
                <List.Item key={assignment.id}>
                  <List.Item.Meta
                    title={assignment.title}
                  />
                </List.Item>
              )}
            />
          </Panel>

        </Collapse>
      </Card>
    </div>
  );
};

export default CourseDetail;
