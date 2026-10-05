"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Pagination,
  notification,
  Input,
  Drawer,
  Avatar,
  Tooltip,
  Rate,
  Tag,
  Popconfirm
} from "antd";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { IoRefresh } from "react-icons/io5";
import { GlobalOutlined, LockOutlined } from "@ant-design/icons";
import { FaUserEdit, FaUserFriends, FaUserShield } from "react-icons/fa";
import { RootState } from "@/store/store";
import {
  useGetCompanyCoursesQuery,
  useDeleteCourseMutation
} from "@/api/Learning/apiLearning";
import { useWindowSize } from "@/utils/responsiveSm";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useTranslations } from "next-intl";
import CourseDetail from "@/components/FunctionsManagement/Learning/CourseDetail";
import AddAndUpdateCourse from "@/components/FunctionsManagement/Learning/AddAndUpdateCourse";
import { User } from "@/types/userTypes";

const PRIMARY_COLOR = "#f1692f";

interface Course {
  id: number;
  title: string;
  description: string;
  image?: string;
  category_str?: { color: string; name: string };
  subcategory_str?: { color: string; name: string };
  user_creator: User;
  admin_list: User[];
  student_list: User[];
  rating: number;
  is_public: boolean;
}

const truncateText = (text: string, maxLength: number) =>
  text.length <= maxLength ? text : text.slice(0, maxLength) + "...";

/* ===== ACTION BUTTON (UI ONLY) ===== */
const ActionBtn = ({
  children,
  onClick,
  danger = false
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) => (
  <div className="w-full text-center">
    <Button
      type="text"
      onClick={onClick}
      danger={danger}
      style={{
        width: "100%",
        height: 36,
        borderRadius: 8,
        border: `1px solid ${danger ? "#ff4d4f" : PRIMARY_COLOR}`,
        color: danger ? "#ff4d4f" : PRIMARY_COLOR,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6
      }}
    >
      {children}
    </Button>
  </div>
);

const CourseCompany = () => {
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const router = useRouter();
  const isCollapse = useSelector(
    (state: RootState) => state.collapse.isCollapse
  );

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const { data: courseList, refetch, error } =
    useGetCompanyCoursesQuery({
      page: pagination.current,
      pageSize: pagination.pageSize,
      searchTerm
    });

  const [deleteCourse, { isLoading: isLoadingDelete }] =
    useDeleteCourseMutation();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    setUser(userData ? JSON.parse(userData) : null);
  }, []);

  if (error && "status" in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) router.push("/403/");
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(tempSearchTerm);
      setPagination((p) => ({ ...p, current: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [tempSearchTerm]);

  const onDelete = async (courseId: number) => {
    try {
      await deleteCourse(courseId);
      notification.success({
        message: t("noficationDelete.courseCompanySuccess"),
        placement: "bottomRight"
      });
    } catch {
      notification.error({
        message: t("noficationDelete.courseCompanyError"),
        placement: "bottomRight"
      });
    }
  };

  const isAdminOrCreator = (course: Course) => {
    if (!user) return false;
    return (
      course.admin_list?.some((a) => a.username === user.username) ||
      course.user_creator?.username === user.username
    );
  };

  const dataSource = courseList?.results || [];

  return (
    <div
      className={`w-screen ${isCollapse
        ? "md:w-[calc(100vw-124px)]"
        : "md:w-[calc(100vw-300px)]"
        } px-6`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center pt-2 max-md:flex-col gap-3">
        <Input
          placeholder="Search courses..."
          onChange={(e) => setTempSearchTerm(e.target.value)}
        />

        <div className="flex gap-2">
          <Button
            type="text"
            icon={<IoRefresh />}
            onClick={refetch}
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

      {/* LIST */}
      <Row gutter={[16, 16]} className="mt-4">
        {dataSource.map((course: Course) => (
          <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
            <Card
              cover={
                <img
                  src={course.image}
                  alt={course.title}
                  style={{ height: 250, objectFit: "cover" }}
                />
              }
              actions={[
                <ActionBtn
                  key="view"
                  onClick={() => setSelectedCourseId(course.id)}
                >
                  View
                </ActionBtn>,

                ...(isAdminOrCreator(course)
                  ? [
                    <AddAndUpdateCourse
                      key="edit"
                      edit={true}
                      course={course}
                      title={undefined}
                      titleLabel={undefined}
                    />,

                    <Popconfirm
                      key="delete"
                      title={t("noficationDelete.orderTitle")}
                      description={t(
                        "noficationDelete.orderDescription"
                      )}
                      onConfirm={() => onDelete(course.id)}
                      okText={t("general.confirm")}
                      cancelText={t("general.close")}
                      okButtonProps={{ loading: isLoadingDelete }}
                    >
                      <ActionBtn danger>
                        {t("general.delete")}
                      </ActionBtn>
                    </Popconfirm>
                  ]
                  : [])
              ]}
            >
              <Card.Meta
                title={course.title}
                description={
                  <>
                    {course.category_str && (
                      <Tag color={course.category_str.color}>
                        {course.category_str.name}
                      </Tag>
                    )}
                    {course.subcategory_str && (
                      <Tag color={course.subcategory_str.color}>
                        {course.subcategory_str.name}
                      </Tag>
                    )}

                    <p>{truncateText(course.description, 100)}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <FaUserEdit color={PRIMARY_COLOR} />
                      <span>{course.user_creator?.username}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <FaUserShield color={PRIMARY_COLOR} />
                      <Avatar.Group maxCount={3} size="small">
                        {course.admin_list?.map((a) => (
                          <Tooltip
                            key={a.username}
                            title={`${a.first_name} ${a.last_name}`}
                          >
                            <Avatar src={a.user_profile?.image} />
                          </Tooltip>
                        ))}
                      </Avatar.Group>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <FaUserFriends color={PRIMARY_COLOR} />
                      <span>{course.student_list?.length}</span>
                    </div>

                    <div className="mt-2">
                      {course.is_public ? (
                        <GlobalOutlined
                          rev={undefined}
                          style={{ color: PRIMARY_COLOR }}
                        />
                      ) : (
                        <LockOutlined rev={undefined} style={{ color: "#ff4d4f" }} />
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <Rate disabled allowHalf value={course.rating} />
                      <span>{course.rating}/5</span>
                    </div>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* PAGINATION */}
      <Pagination
        className="mt-4 text-right"
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={courseList?.total || 0}
        showSizeChanger
        onChange={(page, pageSize) =>
          setPagination({ current: page, pageSize })
        }
      />

      {/* DRAWER */}
      <Drawer
        title={t("learning.courseDetail")}
        width={width > 768 ? "60%" : "100%"}
        open={!!selectedCourseId}
        onClose={() => setSelectedCourseId(null)}
        destroyOnClose
      >
        {selectedCourseId && (
          <CourseDetail courseId={selectedCourseId} />
        )}
      </Drawer>
    </div>
  );
};

export default CourseCompany;
