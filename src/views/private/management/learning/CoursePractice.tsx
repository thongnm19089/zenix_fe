"use client";

import {
  useGetAssignmentMeListQuery,
  useGetAdminCoursesQuery,
  useGetAdminGradeAssignmentAnswersQuery,
  useDeleteAssignmentMutation,
} from "@/api/Learning/apiLearning";
import AddAndUpdateAssignment from "@/components/FunctionsManagement/Learning/AddAndUpdateAssignment";
import AssignmentDetail from "@/components/FunctionsManagement/Learning/AssignmentDetail";
import AssignmentAnswer from "@/components/FunctionsManagement/Learning/AssignmentAnswer";
import { useWindowSize } from "@/utils/responsiveSm";
import { UploadOutlined } from "@ant-design/icons";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Card, Row, Col, Button, Pagination, notification, Input, Drawer, Tabs, Rate, Typography, Collapse, Popconfirm } from "antd";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { IoRefresh } from "react-icons/io5";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { User } from "@/types/userTypes";

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Title } = Typography;

const truncateText = (text: string, maxLength: number) => {
  if (text?.length <= maxLength) return text;
  return text?.slice(0, maxLength) + "...";
};

const CoursePractice = () => {
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
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [selectedGradeAssignmentId, setSelectedGradeAssignmentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('myAssignments'); // Default tab

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      const parsedUserData = JSON.parse(userDataString);
      setUser(parsedUserData);
    }
  }, []);

  // Queries
  // Bài tập của tôi
  const {
    data: assignmentMeList,
    isLoading: isLoadingMe,
    isError: isErrorMe,
    refetch: refetchMe,
    error: errorMe,
  } = useGetAssignmentMeListQuery({});

  // Giao bài tập
  const {
    data: adminCourses,
    isLoading: adminCoursesLoading,
    isError: adminCoursesError,
    refetch: refetchAdminCourses,
  } = useGetAdminCoursesQuery({ searchTerm });

  // Chấm bài tập  
  const {
    data: adminGradeAssignmentAnswerList,
    isLoading,
    isError,
    refetch,
    error,
  } = useGetAdminGradeAssignmentAnswersQuery({ searchTerm });

  // Redirect to custom 403 page if there's a 403 error
  if (error && "status" in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push("/403/");
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(tempSearchTerm);
      setPagination({ ...pagination, current: 1 });
    }, 500); // Debounce thời gian 500ms

    return () => clearTimeout(timeoutId);
  }, [tempSearchTerm]);

  const onSearchChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    const value = e.target.value;
    setTempSearchTerm(value);
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
    refetch();
  };

  const [deleteAssignment, { isLoading: isLoadingDelete }] = useDeleteAssignmentMutation();

  const onDelete = async (assignmentId: any) => {
    try {
      await deleteAssignment(assignmentId);
      notification.success({
        message: `${t("noficationDelete.assignmentSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
      refetchAdminCourses()
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.assignmentError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const onViewAssignment = (assignmentId: number) => {
    setSelectedAssignmentId(assignmentId);
  };

  const onViewAssignmentForAdmin = (assignmentId: number) => {
    setSelectedGradeAssignmentId(assignmentId);
  };

  const onCloseDrawer = () => {
    setSelectedAssignmentId(null);
    setSelectedGradeAssignmentId(null);
  };

  // After fetching data
  // Data source logic based on active tab
  let dataSource = [];
  let totalItems = 0;

  if (activeTab === 'myAssignments') {
    dataSource = (assignmentMeList?.results || []).filter((assignment: any) =>
      assignment.course_str.toLowerCase().includes(searchTerm.toLowerCase())
    );
    totalItems = dataSource.length;
  } else if (activeTab === 'gradeAssignments') {
    dataSource = (adminGradeAssignmentAnswerList?.results || []).filter((assignmentAnswer: any) =>
      assignmentAnswer.assignment_info.course_str.toLowerCase().includes(searchTerm.toLowerCase())
    );
    totalItems = dataSource.length;
  }

  return (
    <div className={`w-screen ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"} px-6`}>
      <div className="flex justify-end items-center gap-2 pt-2 max-md:flex-col max-md:items-stretch max-md:gap-3">
        <Input
          placeholder="Search assignments..."
          onChange={onSearchChange}
          className="max-w-md w-full"
        />

        <Button
          type="text"
          icon={<IoRefresh />}
          onClick={handleRefresh}
          style={{
            border: "1px solid #f1692f",
            color: "#f1692f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="whitespace-nowrap"
        >
          {t("general.refreshThePage")}
        </Button>
      </div>



      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Bài tập của tôi" key="myAssignments">
          <Row gutter={[16, 16]} className="mt-4">
            {dataSource.map((assignment: any) => {

              // Check if we are in the "My Assignments" tab
              let userAnswer;
              if (activeTab === 'myAssignments') {
                // Only search for the user's answer in the answer_list if it exists
                userAnswer = assignment?.answer_list?.find(
                  (answer: any) => answer.student_info === user?.username
                );
              } else if (activeTab === 'gradeAssignments') {
                // In the grading tab, assignment itself is likely an assignment answer
                userAnswer = assignment; // Directly set userAnswer to assignment for grading
              }

              return (
                <Col xs={24} sm={12} md={8} lg={6} key={assignment.id}>
                  <Card
                    actions={[
                      userAnswer && userAnswer.score !== null ? (
                        <Button type="default" className="bg-green-500" onClick={() => onViewAssignment(assignment.id)}>View</Button>
                      ) : (
                        userAnswer ? (
                          <Button type="default" className="bg-yellow-500" onClick={() => onViewAssignment(assignment.id)}>Edit</Button>
                        ) : (
                          <Button type="primary" onClick={() => onViewAssignment(assignment.id)}>Complete</Button>
                        )
                      )
                    ]}
                  >
                    <Card.Meta
                      title={
                        <>
                          <p>Deadline: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : null}</p>
                          <p>{assignment.title}</p>
                        </>
                      }
                      description={
                        <>
                          <Title level={4} style={{ color: "blue" }}>Course: {assignment.course_str}</Title>
                          <p>Desc: {truncateText(assignment.description, 100)}</p>
                          <p>Created by: {assignment.user_str}</p>
                          <p>Lesson: {assignment.lesson_str}</p>
                          <p>Module: {assignment.module_str}</p>
                          {userAnswer && (
                            <>
                              <p>Answer: {truncateText(userAnswer.answer, 100)}</p>
                              <p>
                                Score:
                                {userAnswer.score !== null ? (
                                  <Rate disabled allowHalf value={userAnswer.score} count={10} />
                                ) : (
                                  <span className="text-red-500">Not graded yet</span>
                                )}
                              </p>
                              <p>
                                Feedback:
                                {userAnswer.feedback !== null ? (
                                  truncateText(userAnswer.feedback, 100)
                                ) : (
                                  <span className="text-red-500">No feedback yet</span>
                                )}
                              </p>
                            </>
                          )}
                        </>
                      }
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        </TabPane>

        <TabPane tab="Giao bài tập" key="assignAssignments">
          <Row gutter={[16, 16]} className="mt-4">
            {adminCourses?.results.map((course: any) => (
              <Col xs={24} sm={12} md={8} key={course.id}>
                <Card title={course.title} bordered={false}>
                  <Collapse accordion>
                    <Panel
                      header={`Assignments (${course.assignments.length})`}
                      key={course.id}
                      className="site-collapse-custom-panel"
                    >
                      {course.assignments.length > 0 ? (
                        course.assignments.map((assignment: any) => (
                          <Card key={assignment.id} style={{ marginBottom: '16px' }} bordered={false}>
                            <p><strong>{assignment.title}</strong></p>
                            <p>{assignment.description}</p>
                            <p><strong>Due Date:</strong> {assignment.due_date ? new Date(assignment.due_date).toLocaleString() : 'N/A'}</p>
                            <div>
                              <strong>Files:</strong>
                              {assignment.files.length > 0 ? (
                                <ul>
                                  {assignment.files.map((file: any) => (
                                    <li key={file.id}>
                                      <a href={file.file} target="_blank" rel="noopener noreferrer">
                                        <Button icon={<UploadOutlined rev={undefined} />}>View File</Button>
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p>No files attached.</p>
                              )}
                            </div>
                            {/* Delete Assignment */}
                            <Popconfirm
                              title="Are you sure to delete this assignment?"
                              onConfirm={() => onDelete(assignment.id)}
                              okText="Yes"
                              cancelText="No"
                            >
                              <Button type="link" danger>
                                Delete
                              </Button>
                            </Popconfirm>
                          </Card>
                        ))
                      ) : (
                        <p>No assignments have been assigned yet.</p>
                      )}
                    </Panel>
                  </Collapse>
                  {/* Nút để tạo bài tập mới */}
                  <AddAndUpdateAssignment course={course} edit={false} assignment={undefined} refetchAdminCourses={refetchAdminCourses} />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>

        <TabPane tab="Chấm bài tập" key="gradeAssignments">
          <Row gutter={[16, 16]} className="mt-4">
            {dataSource.map((assignmentAnswer: any) => (
              <Col xs={24} sm={12} md={8} lg={6} key={assignmentAnswer.id}>
                <Card
                  actions={[
                    assignmentAnswer?.score !== null && assignmentAnswer?.score !== undefined ? (
                      <Button type="default" className="bg-yellow-500" onClick={() => onViewAssignmentForAdmin(assignmentAnswer.id)}>
                        Edit
                      </Button>
                    ) : (
                      <Button type="primary" onClick={() => onViewAssignmentForAdmin(assignmentAnswer.id)}>
                        Grade
                      </Button>
                    )
                  ]}
                >
                  <Card.Meta
                    title={(
                      <>
                        {/* Displaying student information */}
                        <p><strong>Student:</strong> {`${assignmentAnswer?.student_info?.first_name} ${assignmentAnswer?.student_info?.last_name}`}</p>
                        <p><strong>Username:</strong> {assignmentAnswer?.student_info?.username}</p>
                        <p><strong>Email:</strong> {assignmentAnswer?.student_info?.email}</p>
                        {assignmentAnswer?.student_info?.user_profile?.image && (
                          <img src={assignmentAnswer?.student_info?.user_profile?.image} alt="Student profile" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                        )}
                      </>
                    )}
                    description={(
                      <>
                        {/* Assignment details */}
                        <p><strong>Answer:</strong> {assignmentAnswer?.answer}</p>
                        <p><strong>Score:</strong> {assignmentAnswer?.score !== null && assignmentAnswer?.score !== undefined ? <Rate count={10} value={assignmentAnswer?.score} disabled /> : <span className="text-red-500">Not graded yet</span>}</p>
                        <p><strong>Feedback:</strong> {assignmentAnswer?.feedback || <span className="text-red-500">No feedback yet</span>}</p>

                        <hr />

                        {/* Additional details about the assignment */}
                        <p><strong>Course:</strong> {assignmentAnswer?.assignment_info?.course_str}</p>
                        <p><strong>Module:</strong> {assignmentAnswer?.assignment_info?.module_str}</p>
                        <p><strong>Lesson:</strong> {assignmentAnswer?.assignment_info?.lesson_str}</p>
                        <p><strong>Title:</strong> {assignmentAnswer?.assignment_info?.title}</p>
                        <p><strong>Description:</strong> {assignmentAnswer?.assignment_info?.description}</p>
                        <p><strong>Due Date:</strong> {assignmentAnswer?.assignment_info?.due_date ? new Date(assignmentAnswer.assignment_info.due_date).toLocaleString() : 'N/A'}</p>

                        {/* Displaying the files if they exist */}
                        {assignmentAnswer?.files?.length > 0 && (
                          <>
                            <p><strong>Files:</strong></p>
                            <ul>
                              {assignmentAnswer?.files?.map((file: any) => (
                                <li key={file.id}>
                                  <a href={file.file} target="_blank" rel="noopener noreferrer">
                                    <Button icon={<UploadOutlined rev={undefined} />}>View File</Button>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </>
                    )}
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
        total={totalItems}
        showSizeChanger
        onChange={handleTableChange}
        pageSizeOptions={["10", "20", "50", "100", "200"]}
      />

      <Drawer
        title="Assignment Details"
        width={width > 768 ? '50%' : '100%'}
        open={!!selectedAssignmentId || !!selectedGradeAssignmentId}
        onClose={onCloseDrawer}
        destroyOnClose
      >
        {selectedAssignmentId && <AssignmentDetail assignmentId={selectedAssignmentId} refetchMe={refetchMe} />}
        {selectedGradeAssignmentId && <AssignmentAnswer assignmentId={selectedGradeAssignmentId} refetch={refetch} />}
      </Drawer>
    </div>
  );
};

export default CoursePractice;
