import { useCreateStaffManagerMutation, useEditStaffManagerMutation, useGetStaffManagerQuery } from "@/api/SetUp/apiHRConfiguration";
import { useGetSetupQuery, useGetSetupHrAppQuery } from "@/api/SetUp/apiSetup";
import { Button, Form, Input, Modal, Select, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
const { Option } = Select;

const AddAndUpdateStaffManager = ({
  edit,
  title,
  staffManagerId,
}: {
  edit?: boolean;
  title: string;
  staffManagerId?: number | null | undefined;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createStaffManager, { isLoading: isLoadingAdd }] = useCreateStaffManagerMutation();
  const [editStaffManager, { isLoading: isLoadingEdit }] = useEditStaffManagerMutation();
  const { data: setupList } = useGetSetupQuery();
  const { data: setupHRList } = useGetSetupHrAppQuery();

  const [form] = Form.useForm();
  const t: any = useTranslations();
  const { data: staffManager } = useGetStaffManagerQuery(
    { staffManagerId: staffManagerId ?? undefined },
    { skip: staffManagerId != null && isModalOpen ? false : true }
  );

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    form.setFieldsValue({
      manager: staffManager?.manager,
      staff: staffManager?.staff,
      management_type: staffManager?.management_type,
      rank: staffManager?.rank ? parseInt(staffManager.rank) : undefined // Chuyển rank thành số
    });
  }, [isModalOpen, staffManager]);

  const onFinish = async (values: any) => {
    try {
      const result = await createStaffManager(values);
      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationAddAndUpdate.createStaffManagerError')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setIsModalOpen(false);
        notification.success({
          message: `${t('noficationAddAndUpdate.createStaffManagerSuccess')}`,
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
      id: staffManagerId,
      staff: values.staff,
      manager: values.manager,
      management_type: values.management_type,
      rank: values.rank, // Add rank in the edit form as well
    };
    try {
      await editStaffManager(body);
      setIsModalOpen(false);
      notification.success({
        message: `${t('noficationAddAndUpdate.editStaffManagerSuccess')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationAddAndUpdate.editStaffManagerError')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const employeeList = setupList?.employee_list;

  return (
    <>
      <Button type="primary" onClick={showModal}
        size={edit ? "small" : "middle"}
        className={edit ? "bg-teal-600 hover:!bg-teal-500" : ""}
      >
        {edit ? t("general.edit") : t("general.createNew")}
      </Button>
      <Modal
        title={`${edit ? t("general.edit") : t("general.createNew")} ${title}`}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <div>
          <Form labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} onFinish={edit ? onEdit : onFinish} form={form}>

            {/* Manager Select Field */}
            <Form.Item name="manager" className="my-4" style={{ width: '100%' }}>
              <Select
                showSearch
                placeholder={t('admin.selectManager')}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                }
              >
                {employeeList?.map((employee: any) => (
                  <Option key={employee.id} value={employee.id}>
                    {`${employee.last_name} ${employee.first_name}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Staff Select Field */}
            <Form.Item name="staff" className="my-4" style={{ width: '100%' }}>
              <Select
                showSearch
                placeholder={t('admin.selectStaffMember')}
                allowClear
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                }
              >
                {employeeList?.map((employee: any) => (
                  <Option key={employee.id} value={employee.id}>
                    {`${employee.last_name} ${employee.first_name}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Management Type Select Field */}
            <Form.Item name="management_type" className="my-4" style={{ width: '100%' }}>
              <Select
                showSearch
                placeholder={t('admin.selectManagementType')}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                }
              >
                {setupHRList?.management_type_list.map((type: any) => (
                  <Option key={type.id} value={type.id}>
                    {type.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Rank Select Field */}
            <Form.Item name="rank" className="my-4" style={{ width: '100%' }}>
              <Select
                placeholder={t('admin.selectRank')}
                optionFilterProp="children"
              >
                {Array.from({ length: 10 }, (_, index) => (
                  <Option key={index + 1} value={index + 1}>
                    {`Cấp ${index + 1}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button type="primary" htmlType="submit" className=" mb-2" loading={edit ? isLoadingEdit : isLoadingAdd}>
                {t("general.confirm")}
              </Button>

              <Button onClick={handleCancel}>{t("general.cancel")}</Button>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default AddAndUpdateStaffManager;
