"use client";

import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Rate,
  Checkbox,
  DatePicker,
  Drawer,
  Tag,
  message,
  Card,
} from "antd";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  useGetSurveysQuery,
  useGetSurveyByIdQuery,
  useCreateSurveyMutation,
} from "@/api/CustomerService/apiCustomerService";
import SurveyDetail from "@/components/FunctionsManagement/CustomerService/AdminProcess/SurveyDetail";
import { useWindowSize } from "@/utils/responsiveSm";

interface Survey {
  id: number;
  created_at: string;
  created_by: number;
  satisfaction_level: number;
  support_level: number;
  user_friendly_level: number;
  performance_level: number;
  value_for_money_level: number;
  recommend_to_others: boolean;
  follow_up_needed: boolean;
  dissatisfaction_points: string;
  building_comment: string;
  survey_month: string;
  created_by_username: string;
}

const PRIMARY = "#f1692f";

const CustomerSurvey: React.FC = () => {
  const { data, refetch, isLoading } = useGetSurveysQuery();
  const [createSurvey, { isLoading: isLoadingAdd }] =
    useCreateSurveyMutation();

  const isCollapse = useSelector(
    (state: RootState) => state.collapse.isCollapse
  );

  const [selectedSurveyId, setSelectedSurveyId] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();
  const [width] = useWindowSize();

  const surveys: Survey[] = data?.results || [];

  const { data: surveyDetails } = useGetSurveyByIdQuery(
    { id: selectedSurveyId! },
    { skip: !selectedSurveyId }
  );

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        survey_month: dayjs(values.survey_month).format("YYYY-MM"),
      };
      await createSurvey(payload).unwrap();
      message.success("Tạo khảo sát thành công");
      setOpenModal(false);
      form.resetFields();
      refetch();
    } catch {
      message.error("Tạo khảo sát thất bại");
    }
  };

  const columns = [
    {
      title: "Người tạo",
      dataIndex: "created_by_username",
    },
    {
      title: "Tháng",
      dataIndex: "survey_month",
    },
    {
      title: "Hài lòng",
      dataIndex: "satisfaction_level",
      render: (v: number) => <Rate disabled value={v} />,
    },
    {
      title: "Đề xuất",
      dataIndex: "recommend_to_others",
      render: (v: boolean) => (
        <Tag color={v ? "green" : "red"}>{v ? "Có" : "Không"}</Tag>
      ),
    },
    {
      title: "Hành động",
      render: (_: any, record: Survey) => (
        <Button type="link" onClick={() => setSelectedSurveyId(record.id)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div
      className={`min-h-screen bg-[#f5f7fb] transition-all ${isCollapse
        ? "md:w-[calc(100vw-124px)]"
        : "md:w-[calc(100vw-300px)]"
        } p-6`}
    >
      <Card
        bordered={false}
        style={{ boxShadow: "0 6px 18px rgba(0,0,0,.06)" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#1f2937]">
            Khảo sát khách hàng
          </h2>
          <Button
            type="primary"
            onClick={() => setOpenModal(true)}
            style={{ background: PRIMARY }}
          >
            Tạo khảo sát
          </Button>
        </div>

        <Table
          dataSource={surveys}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={false}
        />
      </Card>

      {/* MODAL CREATE */}
      <Modal
        title="Tạo khảo sát"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        footer={null}
        width={820}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="middle"
        >
          <Form.Item
            label="Tháng khảo sát"
            name="survey_month"
            rules={[{ required: true }]}
          >
            <DatePicker picker="month" className="w-full" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Mức độ hài lòng"
              name="satisfaction_level"
              rules={[{ required: true }]}
            >
              <Rate />
            </Form.Item>

            <Form.Item
              label="Mức độ hỗ trợ"
              name="support_level"
              rules={[{ required: true }]}
            >
              <Rate />
            </Form.Item>

            <Form.Item
              label="Thân thiện người dùng"
              name="user_friendly_level"
              rules={[{ required: true }]}
            >
              <Rate />
            </Form.Item>

            <Form.Item
              label="Hiệu suất"
              name="performance_level"
              rules={[{ required: true }]}
            >
              <Rate />
            </Form.Item>

            <Form.Item
              label="Giá trị xứng đáng"
              name="value_for_money_level"
              rules={[{ required: true }]}
            >
              <Rate />
            </Form.Item>
          </div>

          <Form.Item name="recommend_to_others" valuePropName="checked">
            <Checkbox>Đề xuất cho người khác</Checkbox>
          </Form.Item>

          <Form.Item name="follow_up_needed" valuePropName="checked">
            <Checkbox>Cần theo dõi</Checkbox>
          </Form.Item>

          <Form.Item label="Điểm không hài lòng" name="dissatisfaction_points">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Ý kiến đóng góp" name="building_comment">
            <Input.TextArea rows={3} />
          </Form.Item>

          <div className="text-right">
            <Button
              htmlType="submit"
              loading={isLoadingAdd}
              style={{
                backgroundColor: "#f1692f",
                borderColor: "#f1692f",
                color: "#fff",
              }}
            >
              Tạo khảo sát
            </Button>

          </div>
        </Form>
      </Modal>

      {/* DRAWER DETAIL */}
      <Drawer
        title="Chi tiết khảo sát"
        width={width > 768 ? "65%" : "100%"}
        open={!!selectedSurveyId}
        onClose={() => setSelectedSurveyId(null)}
        destroyOnClose
      >
        {selectedSurveyId && surveyDetails && (
          <SurveyDetail survey={surveyDetails} />
        )}
      </Drawer>
    </div>
  );
};

export default CustomerSurvey;
