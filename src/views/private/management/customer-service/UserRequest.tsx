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
  Upload,
  Row,
  Col,
  Drawer,
  Tag,
  Typography,
} from "antd";
import dynamic from "next/dynamic";
import { UploadOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

import {
  useGetUserRequestsQuery,
  useCreateUserRequestMutation,
  useGetUserRequestByIdQuery,
} from "@/api/CustomerService/apiCustomerService";
import { useAvailableFunctionsQuery } from "@/api/SetUp/apiFunction";
import { RootState } from "@/store/store";
import RequestDetail from "@/components/FunctionsManagement/CustomerService/AdminProcess/RequestDetail";
import { useWindowSize } from "@/utils/responsiveSm";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const { Option } = Select;
const ZENIX = "#f1692f";

interface Request {
  id: number;
  title: string;
  severity: string;
  description?: string;
  created_at: string;
  admin_request?: {
    feedback?: string;
    status?: string;
  } | null;
}

const UserRequest: React.FC = () => {
  const isCollapse = useSelector(
    (state: RootState) => state.collapse.isCollapse
  );

  const [width] = useWindowSize();
  const [form] = Form.useForm();

  const { data, refetch, isLoading } = useGetUserRequestsQuery();
  const { data: availableFunctionsData } = useAvailableFunctionsQuery({});
  const [createUserRequest, { isLoading: isLoadingAdd }] =
    useCreateUserRequestMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

  const { data: requestDetails } = useGetUserRequestByIdQuery(
    { id: selectedRequestId! },
    { skip: !selectedRequestId }
  );

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("platform", "website");
      formData.append("function_category", values.function_category);
      formData.append("detail_function", values.detail_function);

      values?.request_files?.fileList?.forEach((f: any) =>
        formData.append("request_files", f.originFileObj)
      );
      values?.request_images?.fileList?.forEach((f: any) =>
        formData.append("request_images", f.originFileObj)
      );

      await createUserRequest(formData as any).unwrap();
      message.success("Gửi yêu cầu thành công");
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch {
      message.error("Gửi yêu cầu thất bại");
    }
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      render: (text: string, record: Request) => (
        <a
          style={{ color: ZENIX }}
          onClick={() => setSelectedRequestId(record.id)}
        >
          {text}
        </a>
      ),
    },
    {
      title: "Mức độ",
      dataIndex: "severity",
      render: (v: string) => {
        const map: any = {
          low: "green",
          medium: "orange",
          high: "red",
          critical: "purple",
        };
        return <Tag color={map[v] || "default"}>{v}</Tag>;
      },
    },
    {
      title: "Phản hồi của quản trị viên",
      key: "admin_request",
      render: (_: any, record: Request) => {
        const admin = record.admin_request;
        let status = "Chưa phản hồi";
        let feedback =
          "Quản trị viên chưa có phản hồi cho yêu cầu này.";
        let color = ZENIX;

        if (admin) {
          switch (admin.status) {
            case "pending":
              status = "Chờ xử lý";
              break;
            case "in_progress":
              status = "Đang xử lý";
              break;
            case "completed":
              status = "Hoàn thành";
              color = "green";
              break;
            case "invalid":
              status = "Không hợp lệ";
              color = "red";
              break;
          }
          feedback = admin.feedback || feedback;
        }

        return (
          <div>
            <Tag color={color}>{status}</Tag>
            <Typography.Paragraph
              style={{ margin: 0, fontSize: 13 }}
              ellipsis={{ rows: 2 }}
            >
              {feedback}
            </Typography.Paragraph>
          </div>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      render: (v: string) => new Date(v).toLocaleString(),
    },
  ];

  return (
    <div
      className={`p-6 ${isCollapse
        ? "md:w-[calc(100vw-124px)]"
        : "md:w-[calc(100vw-300px)]"
        }`}
    >
      <Button
        type="primary"
        style={{ background: ZENIX, borderColor: ZENIX }}
        onClick={() => setIsModalOpen(true)}
      >
        Tạo yêu cầu
      </Button>

      <Table
        style={{ marginTop: 16 }}
        loading={isLoading}
        dataSource={data?.results || []}
        columns={columns}
        rowKey="id"
      />

      <Modal
        open={isModalOpen}
        title="Tạo yêu cầu"
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Danh mục chức năng"
                name="function_category"
                rules={[{ required: true }]}
              >
                <Select onChange={(v) => setSelectedCategory(v)}>
                  {availableFunctionsData?.categories?.map((c: any) => (
                    <Option key={c.id} value={c.id}>
                      {c.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Chi tiết chức năng"
                name="detail_function"
                rules={[{ required: true }]}
              >
                <Select>
                  {availableFunctionsData?.categories
                    ?.filter((c: any) => c.id === selectedCategory)
                    ?.flatMap((c: any) => c.detail_function_list)
                    ?.map((f: any) => (
                      <Option key={f.id} value={f.id}>
                        {f.title}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Chi tiết"
            rules={[{ required: true }]}
          >
            <ReactQuill />
          </Form.Item>

          <Form.Item>
            <Button
              htmlType="submit"
              loading={isLoadingAdd}
              type="primary"
              style={{ background: ZENIX, borderColor: ZENIX }}
            >
              Gửi yêu cầu
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        open={!!selectedRequestId}
        onClose={() => setSelectedRequestId(null)}
        width={width > 768 ? "65%" : "100%"}
      >
        {selectedRequestId && requestDetails && (
          <RequestDetail requestId={selectedRequestId} />
        )}
      </Drawer>
    </div>
  );
};

export default UserRequest;
