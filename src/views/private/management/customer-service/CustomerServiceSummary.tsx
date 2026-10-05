"use client";

import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Table,
  Select,
  message,
  Modal,
} from "antd";
import dynamic from "next/dynamic";
import {
  useGetUserRequestsQuery,
  useCreateUserRequestMutation,
} from "@/api/CustomerService/apiCustomerService";

const { Option } = Select;
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const PRIMARY_COLOR = "#f1692f";
const PRIMARY_LIGHT = "#fff3ec";
const PRIMARY_DARK = "#d8561f";

interface Request {
  id: number;
  type: string;
  title: string;
  severity: string;
  description?: string;
  create_time: string;
  admin_request?: {
    feedback: string;
    status: string;
    admin_handle_time: string;
    handled_by: number;
  } | null;
}

const CustomerServiceSummary: React.FC = () => {
  const { data, refetch, isLoading } = useGetUserRequestsQuery();
  const [createUserRequest, { isLoading: isLoadingAdd }] =
    useCreateUserRequestMutation();

  const [form] = Form.useForm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<Request | null>(null);

  const requests: Request[] = data?.results || [];

  const onFinish = async (values: any) => {
    try {
      await createUserRequest(values).unwrap();
      message.success("Request created successfully");
      form.resetFields();
      setIsAddModalOpen(false);
      refetch();
    } catch {
      message.error("Failed to create request");
    }
  };

  const HtmlContent = ({ content }: { content?: string }) => (
    <div dangerouslySetInnerHTML={{ __html: content || "" }} />
  );

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      render: (_: any, record: Request) => (
        <a
          onClick={() => {
            setSelectedRequest(record);
            setIsDetailModalOpen(true);
          }}
          style={{ color: PRIMARY_COLOR, fontWeight: 600 }}
        >
          {record.title}
        </a>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
    },
    {
      title: "Severity",
      dataIndex: "severity",
      render: (text: string) => (
        <span style={{ fontWeight: 600 }}>{text}</span>
      ),
    },
    {
      title: "Created At",
      dataIndex: "create_time",
      render: (t: string) => new Date(t).toLocaleString(),
    },
    {
      title: "Admin Feedback",
      dataIndex: ["admin_request", "status"],
      render: (_: any, record: Request) =>
        record.admin_request ? (
          <a
            onClick={() => {
              setSelectedRequest(record);
              setIsAdminModalOpen(true);
            }}
            style={{ color: PRIMARY_COLOR }}
          >
            {record.admin_request.status}
          </a>
        ) : (
          <span style={{ color: "#999" }}>Pending</span>
        ),
    },
  ];

  return (
    <>
      {/* GLOBAL CSS */}
      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: ${PRIMARY_LIGHT} !important;
          color: ${PRIMARY_COLOR} !important;
          font-weight: 600;
        }

        .ant-table-tbody > tr:hover > td {
          background: #fff7f2 !important;
        }

        .ant-modal-title {
          color: ${PRIMARY_COLOR};
          font-weight: 700;
        }

        .ql-toolbar,
        .ql-container {
          border-radius: 8px;
        }

        .ql-toolbar button:hover,
        .ql-picker-label:hover {
          color: ${PRIMARY_COLOR} !important;
        }
      `}</style>

      <div
        style={{
          padding: 24,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            color: PRIMARY_COLOR,
            fontWeight: 800,
            marginBottom: 20,
          }}
        >
          Customer Service
        </h1>

        <Button
          type="primary"
          style={{
            background: PRIMARY_COLOR,
            borderColor: PRIMARY_COLOR,
            borderRadius: 8,
            fontWeight: 600,
            marginBottom: 16,
          }}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add New Request
        </Button>

        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          style={{ borderRadius: 12 }}
        />

        {/* ADD REQUEST MODAL */}
        <Modal
          open={isAddModalOpen}
          onCancel={() => setIsAddModalOpen(false)}
          footer={null}
          title="Add New Request"
        >
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="issue">Issue</Option>
                <Option value="bug">Bug</Option>
                <Option value="feature">Feature</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="severity"
              label="Severity"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="low">Low</Option>
                <Option value="medium">Medium</Option>
                <Option value="high">High</Option>
                <Option value="critical">Critical</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true }]}
            >
              <ReactQuill theme="snow" />
            </Form.Item>

            <Button
              htmlType="submit"
              loading={isLoadingAdd}
              style={{
                width: "100%",
                height: 42,
                background: PRIMARY_COLOR,
                color: "#fff",
                borderRadius: 8,
                fontWeight: 700,
              }}
            >
              Submit
            </Button>
          </Form>
        </Modal>

        {/* REQUEST DETAIL */}
        {selectedRequest && (
          <Modal
            open={isDetailModalOpen}
            onCancel={() => setIsDetailModalOpen(false)}
            footer={null}
            title="Request Details"
          >
            <p>
              <strong style={{ color: PRIMARY_COLOR }}>Type:</strong>{" "}
              {selectedRequest.type}
            </p>
            <p>
              <strong style={{ color: PRIMARY_COLOR }}>Severity:</strong>{" "}
              {selectedRequest.severity}
            </p>
            <p>
              <strong style={{ color: PRIMARY_COLOR }}>Created:</strong>{" "}
              {new Date(
                selectedRequest.create_time
              ).toLocaleString()}
            </p>
            <HtmlContent content={selectedRequest.description} />
          </Modal>
        )}

        {/* ADMIN DETAIL */}
        {selectedRequest?.admin_request && (
          <Modal
            open={isAdminModalOpen}
            onCancel={() => setIsAdminModalOpen(false)}
            footer={null}
            title="Admin Feedback"
          >
            <p>
              <strong>Status:</strong>{" "}
              {selectedRequest.admin_request.status}
            </p>
            <HtmlContent
              content={selectedRequest.admin_request.feedback}
            />
            <p>
              <strong>Handled By:</strong>{" "}
              {selectedRequest.admin_request.handled_by}
            </p>
          </Modal>
        )}
      </div>
    </>
  );
};

export default CustomerServiceSummary;
