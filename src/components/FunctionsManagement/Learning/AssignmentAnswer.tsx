import React, { useEffect, useState } from 'react';
import { useGetAssignmentAnswerQuery, useUpdateAssignmentAnswerForAdminMutation } from '@/api/Learning/apiLearning';
import { Spin, Typography, Button, Input, Form, Rate, notification, Popconfirm, Avatar } from 'antd';
import { UploadOutlined } from "@ant-design/icons";
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

interface AssignmentAnswerProps {
  assignmentId: number;
  refetch: () => void;
}

const AssignmentAnswer: React.FC<AssignmentAnswerProps> = ({ assignmentId, refetch }) => {
  const { data: answer, error, isLoading } = useGetAssignmentAnswerQuery(assignmentId);
  const [updateAssignmentAnswer] = useUpdateAssignmentAnswerForAdminMutation();
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (answer) {
      form.setFieldsValue(answer);
      if (answer.score === null || answer.feedback === null) {
        setHasData(false);
      } else {
        setHasData(true);
      }
    }
  }, [answer, form]);

  const handleFinish = async (values: Partial<any>) => {
    try {
      const formData = new FormData();
      formData.append('score', values.score?.toString() || '');
      formData.append('feedback', values.feedback || '');
  
      await updateAssignmentAnswer({ answerId: assignmentId, data: formData });
      notification.success({ message: 'Answer updated successfully' });
      form.resetFields();
      refetch()
    } catch (error) {
      notification.error({ message: 'Failed to save answer' });
    }
  };
  
  if (isLoading) return <Spin size="large" />;
  if (error) {
    console.error('Error loading assignment answer:', error);
    return <div>Error loading assignment answer</div>;
  }
  if (!answer) {
    console.log('No answer found');
    return <div>No answer found</div>;
  }

  return (
    <div>
      <Title level={4}>Assignment: {answer?.assignment_info?.title}</Title>

      {/* Student Information */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <Avatar src={answer?.student_info?.user_profile?.image} size="large" />
        <div style={{ marginLeft: '16px' }}>
        <p><strong>Student:</strong> {`${answer?.student_info?.first_name} ${answer?.student_info?.last_name} (${answer?.student_info?.username})`}</p>
        <p><strong>Answer:</strong> {answer?.answer}</p>
        </div>
      </div>

      {/* Assignment Information */}
      <div>
        <strong>Course:</strong> {answer?.assignment_info?.course_str}
      </div>
      <div>
        <strong>Module:</strong> {answer?.assignment_info?.module_str}
      </div>
      <div>
        <strong>Lesson:</strong> {answer?.assignment_info?.lesson_str}
      </div>
      <div>
        <strong>Description:</strong> {answer?.assignment_info?.description}
      </div>

      {/* Files */}
      <div style={{ marginTop: '16px' }}>
        <strong>Files:</strong>
        {answer?.files && answer.files.length > 0 ? (
          <ul>
            {answer.files.map((file: any) => (
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

      {/* Form for Grading */}
      <Form form={form} onFinish={handleFinish} layout="vertical" style={{ marginTop: '16px' }}>
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="score" label="Score" rules={[{ required: true, message: 'Please input the score!' }]}>
          <Rate count={10} />
        </Form.Item>
        <Form.Item name="feedback" label="Feedback" rules={[{ required: true, message: 'Please input the feedback!' }]}>
          <Input.TextArea rows={4}/>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AssignmentAnswer;
