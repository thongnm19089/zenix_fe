"use client";

import {
  useCreateApplicationMutation,
  useCreateMultiApplicationMutation,
  useEditApplicationMutation,
  useGetApplicationQuery,
  useGetJobListQuery,
} from "@/api/HR/apiHRApp";
import { useGetSetupHrAppQuery, useGetSetupQuery } from "@/api/SetUp/apiSetup";
import ModalDialog from "@/components/ModalDialog/ModalDialog";
import UploadFileList from "@/components/Upload/UploadFileList";
import { APPLICATION_EXCEL_FILE } from "@/constants/excelFile/applicationExcelFile";
import { dowloadFileExcel } from "@/constants/excelFile/dowloadFileExcel";
import { useWindowSize } from "@/utils/responsiveSm";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  notification,
} from "antd";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";

const { Option } = Select;

const AddAndUpdateApplication = ({
  edit,
  applicationId,
}: {
  edit?: boolean;
  applicationId?: number | null | undefined;
}) => {
  const [sizeDrawer, SetSizeDrawer] = useState(false);
  const t: any = useTranslations();
  const [open, setOpen] = useState(false);
  const [width] = useWindowSize();
  const [form] = Form.useForm();
  const [uploadedFile, setUploadedFile] = useState<any>(null); // State để lưu trữ thông tin tập tin đã tải lên

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 200,
  });

  // Thêm tham số vào hook query
  const { data: jobList } = useGetJobListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const { data: setupList } = useGetSetupQuery(undefined, {
    skip: open ? false : true,
  });

  const { data: setupHR } = useGetSetupHrAppQuery(undefined, {
    skip: open ? false : true,
  });

  const { data: applicationData } = useGetApplicationQuery(
    { applicationId },
    {
      skip: !applicationId || !open,
    }
  );

  const [createApplication, { isLoading: isLoadingAdd }] = useCreateApplicationMutation();
  const [editApplication, { isLoading: isLoadingEdit }] = useEditApplicationMutation();

  useEffect(() => {
    if (edit && applicationData) {
      form.setFieldsValue({
        ...applicationData,
        paid: applicationData?.paid,
      });

      if (applicationData.file) {
        const existingFileList = [
          {
            uid: "-1", // Unique identifier, can be any unique string
            name: applicationData.file, // You can extract file name from URL
            status: "done",
            url: applicationData.file,
          },
        ];
        setUploadedFile(existingFileList);
      } else {
        setUploadedFile([]);
      }
    }
  }, [applicationData, form, edit]);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onFinish = async (values: any) => {
    const formData = new FormData();

    if (edit) {
      let isFileUpdated = false;
      if (uploadedFile && uploadedFile.length > 0) {
        const newFile = uploadedFile[0];
        if (!newFile?.status) {
          formData.append("file", newFile);
          isFileUpdated = true;
        }
      }
    } else {
      // console.log("chay vao day tao moi");
      if (uploadedFile && uploadedFile.length > 0) {
        formData.append("file", uploadedFile[0]);
      }
    }

    Object.keys(values).forEach((key) => {
      formData.append(key, values[key]);
    });

    try {
      let result = edit
        ? await editApplication({ id: applicationId, formData }).unwrap()
        : await createApplication(formData).unwrap();
      form.resetFields();
      setOpen(false);
      notification.success({
        message: edit ? t("error.successfullyRepaired") : t("general.success"),
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      console.error(error);
      notification.error({
        message: edit ? t("error.fixFailure") : t("error.failure"),
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  return (
    <>
      <Button
        type={width < 640 && edit ? "text" : "primary"}
        className={`${width > 640 && edit ? "bg-teal-600 hover:!bg-teal-500" : ""}`}
        onClick={showDrawer}
        size={edit ? "small" : "middle"}
      >
        {edit ? `${t("general.edit")}` : `${t("general.add")}`}
      </Button>
      <Drawer
        title={`${edit ? `${t("general.edit")}` : `${t("general.add")}`} ${t("nav.recruitment")}`}
        width={sizeDrawer ? 768 : 350}
        onClose={onClose}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button
              onClick={() => {
                form.submit();
              }}
              type="primary"
              loading={edit ? isLoadingEdit : isLoadingAdd}
            >
              {t("general.confirm")}
            </Button>
          </Space>
        }
        footer={
          <Button type="link" className="w-full h-full text-center" onClick={() => SetSizeDrawer(!sizeDrawer)}>
            {sizeDrawer ? t("general.collapse") : t("general.expand")}
          </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label={t("user.fullName")} name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item label={t("user.phone")} name="mobile" required>
                <Input />
              </Form.Item>
            </Col>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item label={t("user.email")} name="email" required>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item label={t("hr.loadCv")} required>
                <UploadFileList setFileList={setUploadedFile} fileList={uploadedFile} maxCount={1} />
              </Form.Item>
            </Col>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item label={t("hr.yob")} name="yob">
                <InputNumber min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="job" label={t("table.vacancies")} rules={[{ required: true }]}>
            <Select
              placeholder={t("general.list")}
              allowClear
              showSearch
              filterOption={(input, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {jobList?.results?.map((item: { id: number; title: string }) => (
                <Option key={item.id} value={item.id}>
                  {item.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="handler" label={t("table.interviewer")} rules={[{ required: true }]}>
                <Select
                  placeholder={t("noficationAddAndUpdate.listOfInterviewers")}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children ? option.children.join(" ").toLowerCase().includes(input.toLowerCase()) : false
                  }
                >
                  {setupList?.employee_list?.map((item: { id: number; last_name: string; first_name: string }) => (
                    <Option key={item.id} value={item.id}>
                      {item.last_name} {item.first_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="location" label={t("nav.location")} rules={[{ required: true }]}>
                <Select
                  placeholder={t("noficationAddAndUpdate.listLocation")}
                  allowClear
                  showSearch
                  filterOption={(input, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {setupList?.location_list?.map((item: { id: number; city: string }) => (
                    <Option key={item.id} value={item.id}>
                      {item.city}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="status" label={t("general.status")} rules={[{ required: true }]}>
                <Select
                  placeholder={t("noficationAddAndUpdate.listStatus")}
                  allowClear
                  showSearch
                  filterOption={(input, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {setupHR?.application_status_list?.map((item: { id: number; status: string }) => (
                    <Option key={item.id} value={item.id}>
                      {item.status}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="source" label={t("admin.sources")} rules={[{ required: true }]}>
                <Select
                  placeholder={t("noficationAddAndUpdate.sourceList")}
                  allowClear
                  showSearch
                  filterOption={(input, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {setupHR?.application_source_list?.map((item: { id: number; title: string }) => (
                    <Option key={item.id} value={item.id}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label={t("hr.coverLetter")} name="cover_letter">
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="paid"
            valuePropName="checked"
            initialValue={false} // Sets the checkbox to be checked by default
          >
            <Checkbox>{t("hr.payTheFee")} </Checkbox>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default AddAndUpdateApplication;
