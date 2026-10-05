"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Pagination,
  Input,
  Drawer,
  Avatar,
  Tooltip,
  Rate,
  notification
} from "antd";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { IoRefresh } from "react-icons/io5";
import { RootState } from "@/store/store";
import {
  useCreateJoinEnrollmentMutation,
  useGetCourseMarketQuery
} from "@/api/Learning/apiLearning";
import { useWindowSize } from "@/utils/responsiveSm";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import CourseDetail from "@/components/FunctionsManagement/Learning/CourseDetail";
import { useTranslations } from "next-intl";
import {
  FaCopy,
  FaUserEdit,
  FaUserFriends,
  FaUserShield
} from "react-icons/fa";
import jwt_decode from "jwt-decode";

const PRIMARY_COLOR = "#f1692f";

const truncateText = (text: string, maxLength: number) =>
  text.length <= maxLength ? text : text.slice(0, maxLength) + "...";

const ActionButton = ({
  icon,
  label,
  onClick,
  primary = false
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) => (
  <div className="w-full text-center">
    <Button
      type="text"
      onClick={onClick}
      style={{
        width: "100%",
        color: primary ? "#fff" : PRIMARY_COLOR,
        backgroundColor: primary ? PRIMARY_COLOR : "transparent",
        border: `1px solid ${PRIMARY_COLOR}`,
        borderRadius: 8,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6
      }}
    >
      {icon}
      {label}
    </Button>
  </div>
);

const CourseMarket = () => {
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
  const [userId, setUserId] = useState<string | null>(null);

  const { data: courseList, refetch, error } =
    useGetCourseMarketQuery({
      page: pagination.current,
      pageSize: pagination.pageSize,
      searchTerm
    });

  const [createJoinEnrollment] = useCreateJoinEnrollmentMutation();

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("access_token="))
      ?.split("=")[1];

    if (token) {
      try {
        const decoded: { user_id: string } = jwt_decode(token);
        setUserId(decoded.user_id);
      } catch { }
    }
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

  const onJoinCourse = async (courseId: number) => {
    const result = await createJoinEnrollment({
      user: userId,
      course: courseId
    });

    if ('error' in result) {
      if ('status' in result.error) {
        const fetchError = result.error as FetchBaseQueryError;
        if (fetchError.status === 400) {
          notification.error({ message: "Bạn đã đăng ký khóa học này rồi" });
        } else {
          notification.error({ message: "Có lỗi xảy ra" });
        }
      } else {
        notification.error({ message: "Có lỗi xảy ra" });
      }
    } else {
      notification.success({ message: "Tham gia khóa học thành công" });
    }
  };

  return (
    <div
      className={`w-screen ${isCollapse
        ? "md:w-[calc(100vw-124px)]"
        : "md:w-[calc(100vw-300px)]"
        } px-6`}
    >
      {/* SEARCH */}
      <div className="flex justify-between items-center pt-2 gap-3">
        <Input
          placeholder="Search courses..."
          onChange={(e) => setTempSearchTerm(e.target.value)}
        />

        <Button
          icon={<IoRefresh />}
          onClick={refetch}
          type="text"
          style={{
            color: PRIMARY_COLOR,
            border: `1px solid ${PRIMARY_COLOR}`
          }}
        >
          {t("general.refreshThePage")}
        </Button>
      </div>

      {/* COURSE LIST */}
      <Row gutter={[16, 16]} className="mt-4">
        {courseList?.results?.map((course: any) => (
          <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
            <Card
              hoverable
              cover={
                <img
                  src={course.image}
                  alt={course.title}
                  style={{ height: 250, objectFit: "cover" }}
                />
              }
              actions={[
                <ActionButton
                  key="join"
                  icon={<FaUserFriends />}
                  label="Join"
                  primary
                  onClick={() => onJoinCourse(course.id)}
                />,
                <ActionButton
                  key="view"
                  icon={<FaUserEdit />}
                  label="View"
                  onClick={() => setSelectedCourseId(course.id)}
                />,
                <ActionButton
                  key="copy"
                  icon={<FaCopy />}
                  label="Copy"
                  onClick={() => console.log("copy")}
                />
              ]}
            >
              <Card.Meta
                title={course.title}
                description={
                  <>
                    <p>{truncateText(course.description, 100)}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <FaUserShield color={PRIMARY_COLOR} />
                      <Avatar.Group size="small" maxCount={3}>
                        {course.admin_list.map((a: any) => (
                          <Tooltip
                            title={`${a.first_name} ${a.last_name}`}
                            key={a.username}
                          >
                            <Avatar src={a.user_profile.image} />
                          </Tooltip>
                        ))}
                      </Avatar.Group>
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

      <Drawer
        title={t("learning.courseDetail")}
        width={width > 768 ? "60%" : "100%"}
        open={!!selectedCourseId}
        onClose={() => setSelectedCourseId(null)}
        destroyOnClose
      >
        {selectedCourseId && <CourseDetail courseId={selectedCourseId} />}
      </Drawer>
    </div>
  );
};

export default CourseMarket;
