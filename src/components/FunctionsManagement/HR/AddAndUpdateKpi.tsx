"use client";

import {
  useCreateJobMutation,
  useCreateKpiMutation,
  useEditJobMutation,
  useEditKpiMutation,
  useGetJobQuery,
  useGetKpiQuery,
} from "@/api/HR/apiHRApp";
import { useGetSetupHrAppQuery, useGetSetupQuery } from "@/api/SetUp/apiSetup";
import { OptionListProps } from "@/types/optionListType";
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
  Modal,
  Row,
  Select,
  Space,
  notification,
} from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";

const { Option } = Select;
const { RangePicker } = DatePicker;

const AddAndUpdateKpi = ({
  edit,
  kpiId,
}: {
  edit?: boolean;
  kpiId?: number | null | undefined;
}) => {
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [createKpi, { isLoading: isLoadingAdd }] = useCreateKpiMutation();
  const [editKpi, { isLoading: isLoadingEdit }] = useEditKpiMutation();

  const { data: kpiData } = useGetKpiQuery(
    { kpiId: kpiId },
    {
      skip: kpiId && open ? false : true,
    }
  );
  const { data: setupHRList } = useGetSetupHrAppQuery();
  const { data: setupList } = useGetSetupQuery();

  const showModal = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onFinish = async (values: any) => {
    const body = {
      user: values.user,
      target: values.target,
      kpi_type: values.kpi_type,
      start_date: dayjs(values.date[0]).format("YYYY-MM-DD"),
      end_date: dayjs(values.date[1]).format("YYYY-MM-DD"),
      note: values.note,
    };

    try {
      const result = await createKpi(body);
      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationAddAndUpdate.createKpiError')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setOpen(false);
        notification.success({
          message: `${t('noficationAddAndUpdate.createKpiSuccess')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
      setOpen(true);
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      user: kpiData?.user,
      target: kpiData?.target,
      kpi_type: kpiData?.kpi_type,
      date: [dayjs(kpiData?.start_date), dayjs(kpiData?.end_date)],
      note: kpiData?.note,
    });
  }, [open, kpiData]);

  const onEdit = async (values: any) => {
    const body = {
      id: kpiId,
      user: values.user,
      target: values.target,
      kpi_type: values.kpi_type,
      start_date: dayjs(values.date[0]).format("YYYY-MM-DD"),
      end_date: dayjs(values.date[1]).format("YYYY-MM-DD"),
      note: values.note,
    };

    try {
      const result = await editKpi(body);
      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationAddAndUpdate.editApplicationError')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setOpen(false);
        notification.success({
          message: `${t('noficationAddAndUpdate.editApplicationSuccess')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
      setOpen(true);
    }
  };

  return (
    <>
      <Button
        type={width < 640 && edit ? "text" : "primary"}
        className={`${width > 640 && edit ? "bg-teal-600 hover:!bg-teal-500" : ""}`}
        onClick={showModal}
        size={`${edit ? "small" : "middle"}`}
      >
        {edit ? `${t("general.edit")}` : `${t("general.add")}`}
      </Button>
      <Modal
        title={<div className="text-center font-semibold text-lg">{edit ? `${t('general.edit')}` : `${t('general.add')}`} {t('table.actionValues.kpiInformation')}</div>}
        open={open}
        onCancel={onClose}
        footer={null}
      >
        <Form
          form={form}
          className="mt-4"
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 17 }}
          onFinish={edit ? onEdit : onFinish}
        >
          <Form.Item label={t('hr.target')} name="target" required>
            <InputNumber min={0} defaultValue={0} className="w-full" />
          </Form.Item>

          <Form.Item name="kpi_type" label={t('hr.typeKpi')}>
            <Select placeholder={t('noficationAddAndUpdate.listOfkpis')} allowClear>
              {setupHRList?.kpi_type_list.map((item: { id: number, code: string, name: string }) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="user" label={t('hr.userInfo')} className="w-full">
            <Select
              showSearch
              placeholder={t('noficationAddAndUpdate.personnelList')}
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children
                  ? option.children.join(" ").toLowerCase().includes(input.toLowerCase())
                  : false
              }
            >
              {setupList?.employee_list.map((item: { id: number, first_name: string, last_name: string }) => (
                <Option key={item.id} value={item.id}>
                  {item.last_name} {item.first_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="date" label={t('general.time')} required>
            <RangePicker className="w-full" />
          </Form.Item>

          <Form.Item name="note" label={t('general.note')}>
            <Input.TextArea />
          </Form.Item>
          <div className="flex justify-end gap-2 mr-5">
            <Button type="primary" htmlType="submit" loading={edit ? isLoadingEdit : isLoadingAdd}>
              {t('general.confirm')}
            </Button>
            <Button danger onClick={onClose}>
              {t('general.cancel')}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AddAndUpdateKpi;
