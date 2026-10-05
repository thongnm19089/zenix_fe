import {
  useCreateLeadFollowerMutation,
  useDeleteLeadFollowerMutation,
  useEditLeadFollowerMutation,
  useGetLeadFollowerQuery,
} from "@/api/CRM/apiLead";
import { OptionListProps } from "@/types/optionListType";
import { Button, DatePicker, Form, Input, Modal, Popconfirm, Select, Steps, Tag, notification } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { BiSolidNote } from "react-icons/bi";

const { Option } = Select;

const UpdateNoteLead = ({
  leadId,
  followers,
  contactTypeList,
  stageList,
  title,
}: {
  leadId?: number | null | undefined;
  followers: any[];
  contactTypeList: OptionListProps[];
  stageList: OptionListProps[];
  title: any;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpenNote, setIsOpenNote] = useState(false);
  const [followerId, setFollowerId] = useState(null);
  const [form] = Form.useForm();
  const t: any = useTranslations();

  const [createLeadFollower, { isLoading: isLoadingAddFollower }] = useCreateLeadFollowerMutation();
  const [editLeadFollower, { isLoading: isLoadingEditFollower }] = useEditLeadFollowerMutation();
  const [deleteLeadFollower, { isLoading: isLoadingDeleteFollower }] = useDeleteLeadFollowerMutation();

  const { data: leadFollower } = useGetLeadFollowerQuery(
    { leadFollowerId: followerId },
    {
      skip: isOpenNote && followerId ? false : true,
    }
  );

  const onClickEdit = (id: any) => {
    setIsOpenNote(true);
    setFollowerId(id);
  };

  const followList = useMemo(() => {
    return [
      ...followers
        .map((item) => ({
          title: (
            <div className="flex items-center ">
              <Tag bordered={false} color={item.stage_color} className="mb-1">
                {item.stage_str}
              </Tag>
              <Button type="text" icon={<AiOutlineEdit />} onClick={() => onClickEdit(item.id)} />
            </div>
          ),
          description: (
            <div>
              <div>
                {dayjs(item.created).format("HH:mm")} - {dayjs(item.created).format("DD/MM/YYYY")}{" "}
                {item.contact_type && (
                  <Tag bordered={false} color="green" className="mb-1">
                    {item.contact_type_str}
                  </Tag>
                )}
              </div>
              <div>
                {item.user_str}: {item.note}
              </div>
            </div>
          ),
        }))
        .reverse(),
    ];
  }, [followers, onClickEdit]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsOpenNote(false);
  };

  useEffect(() => {
    if (followerId) {
      form.setFieldsValue({
        contact_type: leadFollower?.contact_type,
        re_contact_date: dayjs(leadFollower?.re_contact_date),
        next_contact_type: leadFollower?.next_contact_type,
        stage: leadFollower?.stage,
        note: leadFollower?.note,
      });
    } else {
      form.resetFields();
    }
  }, [followerId, followList]);

  const onFinish = async (values: any) => {
    const body = {
      lead: leadId,
      contact_type: values.contact_type,
      re_contact_date: values.re_contact_date?.format("YYYY-MM-DD"),
      next_contact_type: values.next_contact_type,
      stage: values.stage,
      note: values.note,
    };

    try {
      const result = await createLeadFollower(body);
      if (result && "error" in result) {
        notification.error({
          message: `${t("noficationAddAndUpdate.createLeadFollowerError")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setIsOpenNote(false);
        notification.success({
          message: `${t("noficationAddAndUpdate.createLeadFollowerSuccess")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
      setIsModalOpen(true);
    }
  };

  const onEdit = async (values: any) => {
    const body = {
      id: followerId,
      lead: leadId,
      contact_type: values.contact_type,
      re_contact_date: dayjs(values.re_contact_date).format("YYYY-MM-DD"),
      next_contact_type: values.next_contact_type,
      stage: values.stage,
      note: values.note,
    };

    try {
      const result = await editLeadFollower(body);
      if (result && "error" in result) {
        notification.error({
          message: `${t("noficationAddAndUpdate.editLeadFollowerError")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setIsOpenNote(false);
        notification.success({
          message: `${t("noficationAddAndUpdate.editLeadFollowerSuccess")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
      setIsModalOpen(true);
    }
  };

  const onDelete = async (leadFollowerId: any) => {
    try {
      await deleteLeadFollower({ leadFollowerId });
      notification.success({
        message: `${t("noficationDelete.leadFollowerSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
      setIsOpenNote(false);
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.leadFollowerError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => {};

  return (
    <>
      <div className="w-full h-full" onClick={showModal}>
        {title}
      </div>
      <Modal
        title={
          <div className="text-2xl text-center font-semibold">
            {isOpenNote
              ? followerId
                ? `${t("noficationAddAndUpdate.editStatus")}`
                : `${t("noficationAddAndUpdate.addStatus")}`
              : `${t("crm.contactHistory")}`}
          </div>
        }
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        {followerId && isOpenNote && followers.length > 1 && (
          <Popconfirm
            title={t("noficationDelete.customerTitle")}
            description={t("noficationDelete.customerDescription")}
            onConfirm={() => onDelete(followerId)}
            onCancel={cancel}
            okText={t("general.confirm")}
            cancelText={t("general.close")}
            placement="left"
            okButtonProps={{ loading: isLoadingDeleteFollower }}
          >
            <Button danger>{t("general.delete")}</Button>
          </Popconfirm>
        )}
        {isOpenNote ? (
          <Form form={form} layout="vertical" onFinish={followerId ? onEdit : onFinish} className="mt-5">
            <Form.Item name="stage" label={t("crm.changeStage")} rules={[{ required: true }]}>
              <Select
                showSearch
                placeholder="Stage List"
                allowClear
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {stageList?.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.stage}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="contact_type" label={t("admin.contactType")}>
              <Select
                showSearch
                placeholder="Contact Type List"
                allowClear
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {contactTypeList?.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label={t("crm.reContactDate")} name="re_contact_date">
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item name="next_contact_type" label={t("crm.nextContactType")}>
              <Select
                showSearch
                placeholder="Next Contact Type List"
                allowClear
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {contactTypeList?.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="note" label={t("general.note")}>
              <Input.TextArea />
            </Form.Item>
            <Button block type="primary" onClick={() => form.submit()} loading={isLoadingEditFollower}>
              {t("general.confirm")}
            </Button>
            <Button block onClick={() => setIsOpenNote(false)} className="my-2" loading={isLoadingAddFollower}>
              {t("general.back")}
            </Button>
            <Button danger block onClick={handleCancel}>
              {t("general.close")}
            </Button>
          </Form>
        ) : (
          <>
            <Steps
              progressDot
              current={followList?.length}
              direction="vertical"
              className="mt-6 mb-3"
              items={followList}
            />
            <Button
              type="primary"
              block
              onClick={() => {
                setIsOpenNote(true), setFollowerId(null);
              }}
            >
              + {t("noficationAddAndUpdate.addStatus")}
            </Button>{" "}
            <Button block onClick={handleCancel} className="mt-2">
              {t("general.close")}
            </Button>
          </>
        )}
      </Modal>
    </>
  );
};

export default UpdateNoteLead;
