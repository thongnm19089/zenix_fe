"use client";

import { Button, Checkbox, Col, DatePicker, Drawer, Form, Input, Row, Select, Space, Upload } from "antd";
import type { DatePickerProps } from "antd";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { AiOutlineUser } from "react-icons/ai";
import { BsKey } from "react-icons/bs";
import { FiUpload } from "react-icons/fi";

const { Option } = Select;

const AddAndUpdateCandidate = ({ edit }: { edit?: boolean }) => {
  const [sizeDrawer, SetSizeDrawer] = useState(false);
  const t: any = useTranslations();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onFinish = (values: any) => {
    console.log("Received values of form: ", values);
  };

  const onChange: DatePickerProps["onChange"] = (date, dateString) => {
    console.log(date, dateString);
  };

  return (
    <>
      <Button type="primary" onClick={showDrawer}>
        {edit ? "Sửa" : "Upload CV"}
      </Button>
      <Drawer
        title="Thêm ứng viên"
        width={sizeDrawer ? 768 : 350}
        onClose={onClose}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={onClose} type="primary">
              Xác nhận
            </Button>
          </Space>
        }
        footer={
          <Button type="link" className="w-full h-full text-center" onClick={() => SetSizeDrawer(!sizeDrawer)}>
            {sizeDrawer ? t("general.collapse") : t("general.expand")}
          </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish} className="mt-3">
          <Form.Item label="Vị trí ứng tuyển" required>
            <Input placeholder="input placeholder" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item label="Tên ứng viên" required>
                <Input placeholder="input placeholder" />
              </Form.Item>
              <Form.Item label="Số điện thoại" required>
                <Input placeholder="input placeholder" />
              </Form.Item>
            </Col>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item label="Email" required>
                <Input placeholder="input placeholder" />
              </Form.Item>
              <Form.Item name="gender" label="Địa điểm" rules={[{ required: true }]}>
                <Select placeholder="Địa điểm ứng tuyển" allowClear>
                  <Option value="male">Hà Nội</Option>
                  <Option value="female">HCM</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="gender" label="Status" rules={[{ required: true }]}>
                <Select placeholder="Stage List" allowClear>
                  <Option value="male">Nhận CV</Option>
                  <Option value="female">Đã Phỏng vấn</Option>
                  <Option value="other">Từ chối</Option>
                  <Option value="female">Pass</Option>
                  <Option value="female">Hẹn đi làm</Option>

                  <Option value="female">Fail</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="gender" label="Source" rules={[{ required: true }]}>
                <Select placeholder="Source List" allowClear>
                  <Option value="male">Facebook</Option>
                  <Option value="female">Websie</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="gender" label="Lịch phỏng vấn" rules={[{ required: true }]}>
                <DatePicker onChange={onChange} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="gender" label="Người phụ trách" rules={[{ required: true }]}>
                <Select placeholder="Source List" allowClear>
                  <Option value="male">Trang</Option>
                  <Option value="female">Ly</Option>
                  <Option value="other">Đức</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="note">
            <Upload action="https://www.mocky.io/v2/5cc8019d300000980a055e76" listType="picture" maxCount={1}>
              <Button icon={<FiUpload />}>Upload CV </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default AddAndUpdateCandidate;
