"use client";

import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Pagination, notification, Input, Drawer, Avatar, Tooltip, Rate, Tag, Tabs, Popconfirm } from "antd";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { IoRefresh } from "react-icons/io5";
import { GlobalOutlined, LockOutlined } from "@ant-design/icons";
import { FaUserEdit, FaUserFriends, FaUserShield } from 'react-icons/fa';
import { RootState } from "@/store/store";
import { useGetMyCoursesQuery, useGetAdminCoursesQuery, useDeleteCourseMutation } from "@/api/Learning/apiLearning";
import { useWindowSize } from "@/utils/responsiveSm";
import { useTranslations } from "next-intl";
import CourseDetail from "@/components/FunctionsManagement/Learning/CourseDetail";
import AddAndUpdateCourse from "@/components/FunctionsManagement/Learning/AddAndUpdateCourse";

const { TabPane } = Tabs;
const PRIMARY_COLOR = "#f1692f";
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const CourseMe = () => {
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const router = useRouter();
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('student'); // Default tab

  const {
    data: studentCourses,
    isLoading: studentCoursesLoading,
    isError: studentCoursesError,
    refetch: refetchStudentCourses,
  } = useGetMyCoursesQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    searchTerm,
  });

  const {
    data: adminCourses,
    isLoading: adminCoursesLoading,
    isError: adminCoursesError,
    refetch: refetchAdminCourses,
  } = useGetAdminCoursesQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    searchTerm,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(tempSearchTerm);
      setPagination({ ...pagination, current: 1 });
    }, 500); // Debounce thời gian 500ms

    return () => clearTimeout(timeoutId);
  }, [tempSearchTerm]);

  const onSearchChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setTempSearchTerm(e.target.value);
  };

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({
      current: page,
      pageSize,
    });
  };

  const handleRefresh = () => {
    setTempSearchTerm("");
    setSearchTerm("");
    if (activeTab === 'student') {
      refetchStudentCourses();
    } else {
      refetchAdminCourses();
    }
  };

  const [deleteCourse, { isLoading: isLoadingDelete }] = useDeleteCourseMutation();

  const onDelete = async (courseId: any) => {
    try {
      await deleteCourse(courseId);
      console.log("courseId", courseId)
      notification.success({
        message: `${t("noficationDelete.courseSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
      // handleRefresh();
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.courseError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const onViewCourse = (courseId: number) => {
    setSelectedCourseId(courseId);
  };

  const onCloseDrawer = () => {
    setSelectedCourseId(null);
  };

  const dataSource = activeTab === 'student' ? studentCourses?.results || [] : adminCourses?.results || [];

  return (
    <div className={`w-screen ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"} px-6`}>
      <div className="flex justify-between items-center pt-2 max-md:flex-col gap-3">
        <Input
          placeholder="Search courses..."
          onChange={(e) => setTempSearchTerm(e.target.value)}
        />

        <div className="flex gap-2">
          <Button
            type="text"
            icon={<IoRefresh />}
            onClick={handleRefresh}
            style={{
              border: `1px solid ${PRIMARY_COLOR}`,
              color: PRIMARY_COLOR
            }}
          >
            {t("general.refreshThePage")}
          </Button>

          <AddAndUpdateCourse
            edit={undefined}
            title={undefined}
            titleLabel={undefined}
            course={undefined}
          />
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
        <TabPane tab={t('learning.coursesImStudying')} key="student">
          <Row gutter={[16, 16]} className="mt-4">
            {dataSource.map((course: any) => (
              <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
                <Card
                  cover={
                    <div onClick={() => onViewCourse(course.id)} style={{ cursor: 'pointer' }}>
                      {course.image ? (
                        <img alt={course.title} src={course.image} style={{ height: '250px', objectFit: 'cover' }} />
                      ) : null}
                    </div>
                  }
                  actions={[
                    <Button type="link" onClick={() => onViewCourse(course.id)} style={{ cursor: 'pointer' }}>View</Button>,
                    <Button type="link" onClick={() => router.push(`/business/learning/${course.id}`)}>Start Learning</Button>,
                  ]}
                >
                  <Card.Meta
                    title={course.title}
                    description={
                      <>
                        {course.category_str && (
                          <Tag color={course.category_str.color} style={{ marginBottom: '5px' }}>
                            {course.category_str.name}
                          </Tag>
                        )}
                        {course.subcategory_str && (
                          <Tag color={course.subcategory_str.color} style={{ marginBottom: '5px' }}>
                            {course.subcategory_str.name}
                          </Tag>
                        )}
                        <p>{truncateText(course.description, 100)}</p>

                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                          <FaUserEdit style={{ marginRight: '8px' }} />
                          <span>{t("learning.createBy")}: {course.user_creator?.username}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                          <FaUserShield style={{ marginRight: '8px' }} />
                          <span>{t("learning.admin")}</span>
                          <Avatar.Group maxCount={3} size="small" style={{ marginLeft: '8px' }}>
                            {course.admin_list.map((admin: any) => (
                              <Tooltip title={`${admin.first_name} ${admin.last_name}`} key={admin.username}>
                                <Avatar src={admin.user_profile.image}>{!admin.user_profile.image && admin.first_name[0]}</Avatar>
                              </Tooltip>
                            ))}
                          </Avatar.Group>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                          <FaUserFriends style={{ marginRight: '8px' }} />
                          <span>{t("learning.student")}: {course.student_list?.length}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                          <Rate disabled allowHalf value={course.rating} />
                          <span className="ant-rate-text" style={{ marginLeft: '8px' }}>{course.rating}/5</span>
                        </div>
                      </>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
        <TabPane tab={t('learning.coursesImTeaching')} key="admin">
          <Row gutter={[16, 16]} className="mt-4">
            {dataSource.map((course: any) => (
              <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
                <Card
                  cover={
                    <div onClick={() => onViewCourse(course.id)} style={{ cursor: 'pointer' }}>
                      {course.image ? (
                        <img alt={course.title} src={course.image} style={{ height: '250px', objectFit: 'cover' }} />
                      ) : null}
                    </div>
                  }
                  actions={[
                    <Button type="link" onClick={() => onViewCourse(course.id)} style={{ cursor: 'pointer' }}>View</Button>,
                    <AddAndUpdateCourse edit={true} course={course} title={undefined} titleLabel={undefined} />,
                    <Popconfirm
                      title={t("noficationDelete.orderTitle")}
                      description={t("noficationDelete.orderDescription")}
                      onConfirm={() => onDelete(course.id)}
                      onCancel={() => { }}
                      okText={t("general.confirm")}
                      cancelText={t("general.close")}
                      placement="left"
                      okButtonProps={{ loading: isLoadingDelete }}
                    >
                      <Button danger type="link">{t("general.delete")}</Button>
                    </Popconfirm>
                  ]}
                >
                  <Card.Meta
                    title={course.title}
                    description={
                      <>
                        {course.category_str && (
                          <Tag color={course.category_str.color} style={{ marginBottom: '5px' }}>
                            {course.category_str.name}
                          </Tag>
                        )}
                        {course.subcategory_str && (
                          <Tag color={course.subcategory_str.color} style={{ marginBottom: '5px' }}>
                            {course.subcategory_str.name}
                          </Tag>
                        )}
                        <p>{truncateText(course.description, 100)}</p>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                          <FaUserEdit style={{ marginRight: '8px' }} />
                          <span>{t("learning.createBy")}: {course.user_creator?.username}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                          <FaUserShield style={{ marginRight: '8px' }} />
                          <span>{t("learning.admin")}</span>
                          <Avatar.Group maxCount={3} size="small" style={{ marginLeft: '8px' }}>
                            {course.admin_list.map((admin: any) => (
                              <Tooltip title={`${admin.first_name} ${admin.last_name}`} key={admin.username}>
                                <Avatar src={admin.user_profile.image}>{!admin.user_profile.image && admin.first_name[0]}</Avatar>
                              </Tooltip>
                            ))}
                          </Avatar.Group>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                          <FaUserFriends style={{ marginRight: '8px' }} />
                          <span>{t("learning.student")}: {course.student_list?.length}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                          <Rate disabled allowHalf value={course.rating} />
                          <span className="ant-rate-text" style={{ marginLeft: '8px' }}>{course.rating}/5</span>
                        </div>
                      </>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
      </Tabs>

      <Pagination
        className="mt-4 text-right"
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={studentCourses?.total || adminCourses?.total || 0}
        showSizeChanger
        onChange={handleTableChange}
        pageSizeOptions={["10", "20", "50", "100", "200"]}
      />

      <Drawer
        title={t("learning.courseDetail")}
        width={width > 768 ? '60%' : '100%'}
        open={!!selectedCourseId}
        onClose={onCloseDrawer}
        destroyOnClose
      >
        {selectedCourseId && <CourseDetail courseId={selectedCourseId} />}
      </Drawer>
    </div>
  );
};

export default CourseMe;
