"use client";

import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Pagination, Tabs, Drawer, Input, Modal, Form, DatePicker, Upload, Popconfirm, message, Select, notification } from "antd";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { IoRefresh } from "react-icons/io5";
import { RootState } from "@/store/store";
import { useGetCertificatesByStudentQuery, useCreateCertificateMutation, useDeleteCertificateMutation, useGetMyCoursesQuery } from "@/api/Learning/apiLearning";
import dayjs from "dayjs";
import { useWindowSize } from "@/utils/responsiveSm";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useTranslations } from "next-intl";
import CertificateDetail from "@/components/FunctionsManagement/Learning/CertificateDetail";
import AssignmentDetail from "@/components/FunctionsManagement/Learning/AssignmentDetail";
import { User } from "@/types/userTypes";
import { PlusOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

const CourseCertificate = () => {
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const router = useRouter();
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCertificateId, setSelectedCertificateId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('myCertificates'); // Default tab
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [form] = Form.useForm();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    const parsedUserData = userDataString ? JSON.parse(userDataString) : null;
    setUser(parsedUserData);
  }, []);

  const studentId = user?.id || 80; // Hardcoded student ID for demonstration

  const {
    data: certificateList,
    isLoading,
    isError,
    refetch,
    error,
  } = useGetCertificatesByStudentQuery(studentId || 0, {
    skip: !studentId,
  });

  const [addCertificate, { isLoading: isAddingCertificate }] = useCreateCertificateMutation();
  const [deleteCertificate] = useDeleteCertificateMutation();
  const { data: courses } = useGetMyCoursesQuery({ page: 1, pageSize: 10, searchTerm: "" });


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
    setTempSearchTerm(e.target.value);
  };

  const onDateChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null, formatString: [string, string]) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange([]);
    }

    setPagination({ ...pagination, current: 1 });
  };

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({
      current: page,
      pageSize,
    });
  };

  const handleRefresh = () => {
    setDateRange([]);
    setTempSearchTerm("");
    setSearchTerm("");
    refetch();
  };

  const dataSource = certificateList || [];

  const onViewCertificate = (certificateId: number) => {
    setSelectedCertificateId(certificateId);
  };

  const onCloseDrawer = () => {
    setSelectedCertificateId(null);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFileChange = ({ fileList }: any) => {
    setFileList(fileList);
  };

  const onFinish = async (values: any) => {
    try {

      const formData = new FormData();
      formData.append("student", studentId.toString());
      formData.append("course", values.course);
      formData.append("issued_date", values.issued_date.format('YYYY-MM-DD'));
      formData.append("feedback", values.feedback || "");
      if (fileList.length > 0) {
        formData.append("certificate_file", fileList[0].originFileObj);
      }

      const response = await addCertificate(formData).unwrap();
      setIsModalVisible(false);
      refetch();
      form.resetFields();
      setFileList([]);
      setSelectedCertificateId(response.id);
    } catch (error) {
      console.error('Failed to add certificate: ', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCertificate(id).unwrap();
      notification.success({
        message: "Certificate deleted successfully",
        placement: "bottomRight",
        className: "h-16",
      });
      refetch();
    } catch (error) {
      notification.success({
        message: "Failed to delete certificate",
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };


  return (
    <div className={`w-screen ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"} px-6`}>
      <div className="flex justify-end items-center gap-2 pt-2 max-md:flex-col max-md:items-stretch max-md:gap-3">
        <Input
          placeholder="Search certificates..."
          onChange={onSearchChange}
          className="max-w-md w-full"
        />

        <div className="flex gap-2 justify-end">
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

          <Button
            type="primary"
            icon={<PlusOutlined rev={undefined} />}
            onClick={showModal}
            style={{
              backgroundColor: "#f1692f",
              borderColor: "#f1692f",
            }}
            className="whitespace-nowrap"
          >
            Thêm mới chứng chỉ
          </Button>
        </div>
      </div>


      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Chứng chỉ của tôi" key="myCertificates">
          <Row gutter={[16, 16]} className="mt-4">
            {dataSource.map((certificate: any) => (
              <Col xs={24} sm={12} md={8} lg={6} key={certificate.id}>
                <Card
                  actions={[
                    <Button type="link" onClick={() => onViewCertificate(certificate.id)}>View</Button>,
                    <Popconfirm
                      title="Are you sure to delete this certificate?"
                      onConfirm={() => handleDelete(certificate.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="link" danger disabled={certificate.status !== 'pending'}>Delete</Button>
                    </Popconfirm>
                  ]}
                >
                  <Card.Meta
                    title={`Status: ${certificate.status}`}
                    description={
                      <>
                        <p>Certificate: {certificate.id}</p>
                        <p>Course: {certificate.course}</p>
                        <p>Created: {dayjs(certificate.created).format('YYYY-MM-DD')}</p>
                        <p>Date: {dayjs(certificate.issued_date).format('YYYY-MM-DD')}</p>
                        {certificate.certificate_file ? <img alt={certificate.id} src={certificate.certificate_file} /> : null}
                      </>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
        <TabPane tab="Duyệt chứng chỉ" key="approveCertificates">
          <Row gutter={[16, 16]} className="mt-4">
            {dataSource.filter(certificate => certificate.status === 'pending').map((certificate: any) => (
              <Col xs={24} sm={12} md={8} lg={6} key={certificate.id}>
                <Card
                  actions={[
                    <Button type="link" onClick={() => onViewCertificate(certificate.id)}>Approve</Button>
                  ]}
                >
                  <Card.Meta
                    title={`Certificate ID: ${certificate.id}`}
                    description={
                      <>
                        <p>Created: {dayjs(certificate.created).format('YYYY-MM-DD')}</p>
                        <p>Issued Date: {dayjs(certificate.issued_date).format('YYYY-MM-DD')}</p>
                        <p>Status: {certificate.status}</p>
                        {certificate.certificate_file ? <img alt={certificate.id} src={certificate.certificate_file} /> : null}
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
        total={certificateList?.length || 0}
        showSizeChanger
        onChange={handleTableChange}
        pageSizeOptions={["10", "20", "50", "100", "200"]}
      />

      <Drawer
        title="Certificate Details"
        open={!!selectedCertificateId}
        onClose={onCloseDrawer}
        destroyOnClose
      >
        {selectedCertificateId && <CertificateDetail studentId={selectedCertificateId} />}
      </Drawer>

      <Modal
        title="Thêm mới chứng chỉ"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="course" label="Khóa học" rules={[{ required: true, message: "Vui lòng nhập khóa học! " }]}>
            <Select
              placeholder="Nhập thông tin khóa học"
              allowClear
              showSearch
              filterOption={(input, option: any) => option.children.toLowerCase().includes(input.toLowerCase())}
            >
              {courses?.results
                ?.filter((item: { id: string }) =>
                  !certificateList?.some((certificate: any) => certificate.course === parseInt(item.id))
                )
                .map((item: { id: string; title: string }) => (
                  <Option key={item.id} value={item.id}>
                    {item.title}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item name="issued_date" label="Ngày phát hành" rules={[{ required: true, message: 'Vui lòng chọn ngày phát hành!' }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="certificate_file" label="Tệp chứng chỉ" valuePropName="fileList" getValueFromEvent={(e: any) => e.fileList}>
            <Upload beforeUpload={() => false} onChange={handleFileChange}>
              <Button>{t("general.upload")}</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="feedback" label="Phản hồi">
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isAddingCertificate}>
              {t("general.confirm")}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseCertificate;
