"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Form, Input, Button, DatePicker, Select, Drawer, notification, InputNumber, Space, Checkbox, Row, Col } from "antd";
import dayjs from "dayjs";
import { useCreateOutcomingInvoiceMutation, useEditOutcomingInvoiceMutation, useGetOutcomingInvoiceQuery } from "@/api/Finance/apiInvoice";
import { useGetSetupFinanceAppQuery } from "@/api/SetUp/apiSetup";
import UploadFileList from "@/components/Upload/UploadFileList";
import { useWindowSize } from "@/utils/responsiveSm";

const { Option } = Select;

const AddAndUpdateOutcomingInvoice = ({ edit, invoiceId }: { edit?: boolean; invoiceId?: number | null | undefined }) => {
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const [open, setOpen] = useState(false);
  const [sizeDrawer, SetSizeDrawer] = useState(false);
  const [form] = Form.useForm();

  const [uploadedFile, setUploadedFile] = useState<any>(null); // State để lưu trữ thông tin tập tin đã tải lên
  const [createOutcomingInvoice, { isLoading: isLoadingAdd }] = useCreateOutcomingInvoiceMutation();
  const [editOutcomingInvoice, { isLoading: isLoadingEdit }] = useEditOutcomingInvoiceMutation();

  const { data: invoiceData } = useGetOutcomingInvoiceQuery({ invoiceId }, { skip: !invoiceId || !edit });
  const { data: setupFinanceApp } = useGetSetupFinanceAppQuery();

  useEffect(() => {
    if (edit && invoiceData) {
      form.setFieldsValue({
        ...invoiceData,
        invoice_date: dayjs(invoiceData.invoice_date),
        is_valid: invoiceData.is_valid,
      });

      if (invoiceData.invoice_file) {
        const existingFileList = [{
          uid: '-1', // Unique identifier, can be any unique string
          name: invoiceData.invoice_file, // You can extract file name from URL
          status: 'done',
          url: invoiceData.invoice_file,
        }];
        setUploadedFile(existingFileList);
      } else {
        setUploadedFile([]);
      }
    }
  }, [invoiceData, form, edit]);

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
          // console.log("chay vao day thay doi file");
          formData.append('invoice_file', newFile);
          isFileUpdated = true;
        }
      }
      // console.log("isFileUpdated", isFileUpdated);
    }
    else {
      // console.log("chay vao day tao moi");
      if (uploadedFile && uploadedFile.length > 0) {
        formData.append('invoice_file', uploadedFile[0])
      }
    }

    Object.keys(values).forEach(key => {
      if (key === 'invoice_date' && values[key]) {
        // Định dạng ngày tháng
        formData.append(key, values[key].format("YYYY-MM-DD"));
      } else {
        // Thêm các trường khác vào FormData
        formData.append(key, values[key]);
      }
    });

    try {
      let result;
      if (edit) {
        result = await editOutcomingInvoice({ id: invoiceId, formData }).unwrap();
        form.resetFields();
        setOpen(false);
        notification.success({
          message: `${t('noficationAddAndUpdate.editInvoiceSuccess')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        result = await createOutcomingInvoice(formData).unwrap();
        form.resetFields();
        setOpen(false);
        notification.success({
          message: `${t('noficationAddAndUpdate.createInvoice')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      notification.error({
        message: `${t('noficationAddAndUpdate.editInvoiceError')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  return (
    <>
      <Button type={width < 640 && edit ? "text" : "primary"}
        onClick={showDrawer}
        className={` ${edit && width > 640 ? "bg-teal-600 hover:!bg-teal-500" : ""}`}
        block={edit ? true : false}
        size={edit ? "small" : "middle"}
      >
        {edit ? `${t('general.edit')}` : `${t('general.add')}`}
      </Button>

      <Drawer
        title={edit ? `${t('general.edit')}` : `${t('general.add')}`}
        width={sizeDrawer ? 768 : 350}
        onClose={onClose}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={() => form.submit()} type="primary" loading={edit ? isLoadingEdit : isLoadingAdd}>
              {t('general.confirm')}
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
          <Form.Item name="title" label={t('table.title')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="invoice_date" label={t('table.invoiceDate')} rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>

            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="amount" label={t('chart.amountOfMoney')} rules={[{ required: true }]}>
                <InputNumber className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="client_name" label={t('table.customer')} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="client_mobile" label={t('user.phone')}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="client_email" label={t('user.email')}>
                <Input />
              </Form.Item>
            </Col>

            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="client_tax_code" label={t('table.sellerTaxCode')} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="client_address" label={t('user.address')} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col span={sizeDrawer ? 12 : 24}>
              <Form.Item name="rate" label={t('table.rateStr')} rules={[{ required: true }]}>
                <Select
                  placeholder={t('table.rateStr')}
                  allowClear
                  showSearch
                  filterOption={(input, option: any) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {setupFinanceApp?.tax_rate_list?.map((item: any) => (
                    <Option key={item.id} value={item.id}>
                      {item.code}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

          </Row>

          <Form.Item name="detail" label={t('finance.detail')}>
            <Input.TextArea />
          </Form.Item>

          <Form.Item label={t('general.file')}>
            <UploadFileList setFileList={setUploadedFile} fileList={uploadedFile} maxCount={1} />
          </Form.Item>

          <Form.Item
            name="is_valid"
            valuePropName="checked"
            initialValue={true} // Sets the checkbox to be checked by default
          >
            <Checkbox>{t('table.isValid')}</Checkbox>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default AddAndUpdateOutcomingInvoice;
