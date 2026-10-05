"use client";

import { useCreateJobMutation, useCreateMultiJobMutation, useEditJobMutation, useGetJobQuery } from "@/api/HR/apiHRApp";
import UploadFileList from "@/components/Upload/UploadFileList";
import UploadImageList from "@/components/Upload/UploadImageList";
import { OptionListProps } from "@/types/optionListType";
import { useWindowSize } from "@/utils/responsiveSm";
import { Form, Input, Button, DatePicker, Select, Drawer, notification, Space, Row, Col } from "antd";
import dayjs from "dayjs";
import { Edit2 } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";

const { Option } = Select;

interface dataBodyJob {
  title: string;
  desc: string;
  requirement: string;
  benefit: string;
  city: string;
  working_time: string;
  income: string;
  deadline: string;
}

const AddAndUpdateJob = ({
  edit,
  jobId,
  locationList,
}: {
  edit?: boolean;
  jobId?: number | null | undefined;
  locationList: OptionListProps[];
}) => {
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const [open, setOpen] = useState(false);
  const [sizeDrawer, SetSizeDrawer] = useState(false);
  const [form] = Form.useForm();
  const [uploadedFile, setUploadedFile] = useState<any>(null); // State để lưu trữ thông tin tập tin đã tải lên
  const [uploadedImage, setUploadedImage] = useState<any>(null);
  const [imageList, setImageList] = useState<any>(null);
  const [selectCheckbox, setSelectCheckbox] = useState<string>("Nhập thông tin");

  const [createJob, { isLoading: isLoadingAdd }] = useCreateJobMutation();
  const [editJob, { isLoading: isLoadingEdit }] = useEditJobMutation();
  const { data: jobData } = useGetJobQuery({ jobId }, { skip: !jobId || !open });

  useEffect(() => {
    if (edit && jobData) {
      form.setFieldsValue({
        ...jobData,
        deadline: dayjs(jobData?.deadline),
      });

      if (jobData.job_document_file) {
        const existingFileList = [
          {
            uid: "-1", // Unique identifier, can be any unique string
            name: jobData.job_document_file, // You can extract file name from URL
            status: "done",
            url: jobData.job_document_file,
          },
        ];
        setUploadedFile(existingFileList);
      } else {
        setUploadedFile([]);
      }

      if (jobData.thumbnail) {
        const existingFileList = [
          {
            uid: "-1", // Unique identifier, can be any unique string
            name: jobData.thumbnail, // You can extract file name from URL
            status: "done",
            url: jobData.thumbnail,
          },
        ];
        setImageList(existingFileList);
      } else {
        setImageList([]);
      }
    }
  }, [jobData, form, edit]);

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  const onFinish = async (values: any) => {
    const formData = new FormData();

    if (edit) {
      let isFileUpdated = false;
      // Check if a new file has been uploaded and is different from the existing file
      if (uploadedFile && uploadedFile.length > 0) {
        const newFile = uploadedFile[0];
        if (!newFile?.status) {
          console.log("chay vao day thay doi file");
          formData.append("job_document_file", newFile);
          isFileUpdated = true;
        }
      }
    } else {
      // console.log("chay vao day tao moi");
      if (uploadedFile && uploadedFile.length > 0) {
        formData.append("job_document_file", uploadedFile[0]);
      }
    }

    if (edit) {
      let isImageUpdated = false;
      // Check if a new image has been uploaded and is different from the existing file
      console.log("uploadedImage", uploadedImage);
      if (uploadedImage && uploadedImage.length > 0) {
        console.log("chay vao day thay doi image");
        uploadedImage.forEach((file: any) => {
          formData.append(`thumbnail`, file.originFileObj);
        });
        isImageUpdated = true;
      }
      console.log("isImageUpdated", isImageUpdated);
    } else {
      console.log("chay vao day tao ảnh moi");
      if (uploadedImage && uploadedImage.length > 0) {
        uploadedImage.forEach((file: any) => {
          formData.append(`thumbnail`, file.originFileObj);
        });
      }
    }

    Object.keys(values).forEach((key) => {
      if (key === "deadline") {
        formData.append(key, values[key] ? dayjs(values[key]).format("YYYY-MM-DD") : "");
      } else if (key === "location" && Array.isArray(values[key])) {
        values[key].forEach((location: string | Blob) => formData.append("location", location));
      } else {
        formData.append(key, values[key]);
      }
    });

    try {
      let result = edit ? await editJob({ id: jobId, formData }).unwrap() : await createJob(formData).unwrap();
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
        size={`${edit ? "small" : "middle"}`}
      >
        {edit ? t("general.edit") : t("general.add")}
      </Button>

      <Drawer
        title={`${edit ? t("general.edit") : t("general.add")} ${t("nav.recruitment")}`}
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
        <Form disabled={selectCheckbox === "Tải lên file excel"} form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label={t("table.vacancies")} name="title" required>
            <Input />
          </Form.Item>

          <Form.Item label={t("hr.image")}>
            <UploadImageList setImageFile={setUploadedImage} imageList={imageList} maxCount={1} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item label={t("table.benefitValues.income")} name="income" required>
                <Input />
              </Form.Item>
            </Col>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item label={t("table.benefitValues.workingTime")} name="working_time" required>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="desc" label={t("verticalValues.desc")} required>
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="requirement" label={t("table.requirement")} required>
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="benefit" label={t("table.benefit")} required>
            <Input.TextArea />
          </Form.Item>
          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="location" label={t("nav.location")} rules={[{ required: true }]}>
                <Select
                  mode="multiple"
                  placeholder={t("noficationAddAndUpdate.listLocation")}
                  allowClear
                  showSearch
                  filterOption={(input, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {locationList?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.city}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item label={t("table.deadline")} name="deadline" required>
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label={t("hr.file")}>
            <UploadFileList setFileList={setUploadedFile} fileList={uploadedFile} maxCount={1} />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default AddAndUpdateJob;
