import React, { useState, useEffect } from "react";
import { Card, Spin, Typography, Button, Input, Form, notification, Popconfirm, List, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useCreateAssignmentAnswerMutation, useUpdateAssignmentAnswerMutation, useDeleteAssignmentAnswerMutation, useGetAssignmentDetailQuery } from "@/api/Learning/apiLearning";
import { useTranslations } from "next-intl";
import { Rate } from "antd";

const { Title, Paragraph } = Typography;

interface AssignmentDetailProps {
  assignmentId: number;
  refetchMe: () => void;
}

interface AssignmentAnswerFile {
  id: number;
  file: string;
}

interface UserAnswer {
  id: number;
  answer: string;
  score: number | null;
  feedback: string | null;
  answer_files: AssignmentAnswerFile[];
  student_info: string;
}

const AssignmentDetail: React.FC<AssignmentDetailProps> = ({ assignmentId, refetchMe }) => {
  const { data: assignment, error: assignmentError, isLoading: assignmentLoading, refetch } = useGetAssignmentDetailQuery(assignmentId);
  const t: any = useTranslations();
  const [createAssignmentAnswer] = useCreateAssignmentAnswerMutation();
  const [updateAssignmentAnswer] = useUpdateAssignmentAnswerMutation();
  const [deleteAssignmentAnswer] = useDeleteAssignmentAnswerMutation();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [existingFiles, setExistingFiles] = useState<AssignmentAnswerFile[]>([]);
  const [removedFiles, setRemovedFiles] = useState<number[]>([]);
  const [userObject, setUserObject] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState<UserAnswer | null>(null);
  const [editMode, setEditMode] = useState(false); // Add state for edit mode

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUserObject(parsedUser);

      if (assignment && assignment.answer_list) {
        // Properly type the answer variable
        const answer = assignment.answer_list.find((answer: any) => answer.student_info === parsedUser.username) as UserAnswer | null;

        if (answer) {
          setUserAnswer(answer);
          setExistingFiles(answer.answer_files || []);
          if (editMode) {
            form.setFieldsValue({ answer: answer.answer }); // Set the answer in the form if edit mode is active
          }
        }
      }
    }
  }, [assignment, editMode]);

  const onConfirmSubmit = () => {
    form.submit();
  };

  const handleFinish = async (values: any) => {
    const formData = new FormData();
    formData.append("answer", values.answer);
    formData.append("assignment", assignmentId.toString());

    // Append new files to the FormData
    fileList.forEach((file) => {
      formData.append("files", file.originFileObj);
    });

    // Append removed files to the FormData
    removedFiles.forEach((fileId) => {
      formData.append("remove_files", fileId.toString());
    });

    try {
      if (userObject) {
        if (userAnswer) {
          // Update existing answer
          await updateAssignmentAnswer({ answerId: userAnswer.id, data: formData });
          notification.success({ message: "Answer updated successfully" });
        } else {
          // Create a new answer
          await createAssignmentAnswer(formData);
          notification.success({ message: "Answer created successfully" });
        }
        setEditMode(false);
        await refetch(); // Refetch answers
        refetchMe();
      } else {
        notification.error({ message: "User not logged in" });
      }
    } catch (error) {
      notification.error({ message: "Failed to save answer" });
    }
  };

  const handleDeleteAnswer = async (answerId: number) => {
    try {
      await deleteAssignmentAnswer(answerId);
      notification.success({ message: "Answer deleted successfully" });
      refetch();
      refetchMe();
    } catch (error) {
      notification.error({ message: "Failed to delete answer" });
    }
  };

  const handleFileChange = (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-5);
    setFileList(newFileList);
  };

  const handleRemoveExistingFile = (fileId: number) => {
    setRemovedFiles((prevRemovedFiles) => [...prevRemovedFiles, fileId]);
    setExistingFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
  };

  if (assignmentLoading) return <Spin size="large" />;
  if (assignmentError) return <div>Error loading assignment details</div>;

  return (
    <Card>
      <Title level={4}>Lesson: {assignment?.lesson_str}</Title>
      <span>Module: {assignment?.module_str}</span><br></br>
      <span>Course: {assignment?.course_str}</span>
      <Title level={4} className="mt-2">Description</Title>
      <Paragraph>{assignment?.description}</Paragraph>
      <Title level={4}>Files</Title>
      {assignment?.files && assignment.files.length > 0 ? (
        assignment.files.map((file) => (
          <Paragraph key={file.id}>
            <a href={file.file} target="_blank" rel="noopener noreferrer">
              Download File
            </a>
          </Paragraph>
        ))
      ) : (
        <Paragraph>No files attached.</Paragraph>
      )}
      <Title level={4}>Your Answer</Title>
      {userAnswer && !editMode ? (
        <Card>
          <Paragraph><b>Answer:</b> {userAnswer.answer}</Paragraph>
          <Paragraph>
            <b>Score:</b>{" "}
            {userAnswer.score !== null ? (
              <Rate disabled allowHalf value={userAnswer.score} count={10} />
            ) : (
              <span className="text-red-500">Not graded yet</span>
            )}
          </Paragraph>
          <Paragraph>
            <b>Feedback:</b>{" "}
            {userAnswer.feedback ? (
              userAnswer.feedback
            ) : (
              <span className="text-red-500">No feedback yet</span>
            )}
          </Paragraph>
          {existingFiles.length > 0 && (
            <>
              <Title level={5}>Attached Files:</Title>
              <List
                dataSource={existingFiles}
                renderItem={(file: any) => (
                  <List.Item>
                    <a href={file.file} className="text-primary" target="_blank" rel="noopener noreferrer">
                      Download File
                    </a>
                    {!userAnswer.score && ( // Allow file removal only if the answer is not graded
                      <Button type="link" onClick={() => handleRemoveExistingFile(file.id)}>Remove</Button>
                    )}
                  </List.Item>
                )}
              />
            </>
          )}
          {!userAnswer.score && ( // Allow editing and deleting only if the answer is not graded
            <>
              <Button onClick={() => setEditMode(true)}>Edit Answer</Button>
              <Popconfirm
                title="Are you sure you want to delete your answer?"
                onConfirm={() => handleDeleteAnswer(userAnswer.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button danger>Delete Answer</Button>
              </Popconfirm>
            </>
          )}
        </Card>
      ) : (
        <Form
          form={form}
          onFinish={handleFinish}
          initialValues={{
            answer: userAnswer?.answer || '',
          }}
        >
          <Form.Item
            name="answer"
            label="Your Answer"
            rules={[{ required: true, message: "Please input your answer!" }]}
          >
            <Input.TextArea rows={10} />
          </Form.Item>
          <Form.Item label="Upload Files">
            <Upload
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={() => false}
              multiple
            >
              <Button icon={<UploadOutlined rev={undefined} />}>Select Files</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Popconfirm
              title="Are you sure about your answer?"
              onConfirm={onConfirmSubmit}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary" htmlType="button">
                {userAnswer ? 'Update Answer' : 'Submit Answer'}
              </Button>
            </Popconfirm>
          </Form.Item>
        </Form>
      )}
    </Card>
  );
};

export default AssignmentDetail;
