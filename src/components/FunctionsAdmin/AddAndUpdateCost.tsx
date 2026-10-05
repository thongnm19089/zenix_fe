import {
  useCreateCostCategoryMutation,
  useCreateSubCostCategoryMutation,
  useCreateTaxRateMutation,
  useEditCostCategoryMutation,
  useEditSubCostCategoryMutation,
  useEditTaxRateMutation,
  useGetCostCategoryQuery,
  useGetSubCostCategoryQuery,
  useGetTaxRateQuery,
} from "@/api/Finance/apiCost";
import { Button, Form, Input, Modal, Select, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";

const { Option } = Select;

interface DataProps {
  id: number;
  code: string;
  title: string;
}

const AddAndUpdateCost = ({
  edit,
  title,
  titleLabel,
  taxRateId,
  costCategoryId,
  subCostCategoryId,
  isTab,
  divisionsData,
  costCategoryListData,
}: {
  edit?: boolean;
  title: string;
  titleLabel: string;
  userId?: number | null | undefined;
  taxRateId?: number;
  costCategoryId?: number;
  subCostCategoryId?: number;
  isTab: string;
  divisionsData?: DataProps[];
  costCategoryListData?: DataProps[];
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [createTaxRate, { isLoading: isLoadingAdd }] = useCreateTaxRateMutation();
  const [editTaxRate, { isLoading: isLoadingEdit }] = useEditTaxRateMutation();
  const [createCostCategory, { isLoading: isLoadingAddCostCategory }] = useCreateCostCategoryMutation();
  const [editCostCategory, { isLoading: isLoadingEditCostCategory }] = useEditCostCategoryMutation();
  const [createSubCostCategory, { isLoading: isLoadingAddSubCostCategory }] = useCreateSubCostCategoryMutation();
  const [editSubCostCategory, { isLoading: isLoadingEditSubCostCategory }] = useEditSubCostCategoryMutation();

  const { data: taxRateData } = useGetTaxRateQuery(
    { taxRateId: taxRateId },
    {
      skip: taxRateId && isModalOpen && isTab === "TR" ? false : true,
    }
  );

  const { data: costCategoryData } = useGetCostCategoryQuery(
    { costCategoryId: costCategoryId },
    {
      skip: costCategoryId && isModalOpen && isTab === "CC" ? false : true,
    }
  );

  const { data: subCostCategoryData } = useGetSubCostCategoryQuery(
    { subCostCategoryId: subCostCategoryId },
    {
      skip: subCostCategoryId && isModalOpen && isTab === "SCC" ? false : true,
    }
  );

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (values: any) => {
    const body = {
      title: values.title,
      rate: Number(values.code),
      code: values.code + "%",
      subcode: values.subcode,
      division: values.division,
      category: values.category,
    };
    try {
      if (isTab === "CC") {
        const result = await createCostCategory(body);
        if (result && "error" in result) {
          notification.error({
            message: `${t("admin.youExpense")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setIsModalOpen(false);
          notification.success({
            message: `${t("admin.addSuccessCosts")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      } else if (isTab === "TR") {
        const result = await createTaxRate(body);
        if (result && "error" in result) {
          notification.error({
            message: `${t("admin.youRate")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setIsModalOpen(false);
          notification.success({
            message: `${t("admin.rateSuccessfully")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      } else {
        const result = await createSubCostCategory(body);
        if (result && "error" in result) {
          notification.error({
            message: `${t("admin.youExtraCost")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setIsModalOpen(false);
          notification.success({
            message: `${t("admin.addExtraCosts")}`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      }
    } catch (error) {
      console.log(error);
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    if (isTab === "CC") {
      form.setFieldsValue({
        title: costCategoryData?.title,
        code: costCategoryData?.code,
        division: costCategoryData?.division,
      });
    } else if (isTab === "TR") {
      form.setFieldsValue({ code: taxRateData?.code });
    } else {
      form.setFieldsValue({
        title: subCostCategoryData?.title,
        subcode: subCostCategoryData?.subcode,
        category: subCostCategoryData?.category,
      });
    }
  }, [isModalOpen, taxRateData, costCategoryData, subCostCategoryData]);

  const onEdit = async (values: any) => {
    const body = {
      id: taxRateId || costCategoryId || subCostCategoryId,
      title: values.title,
      code: values.code,
      division: values.division,
      subcode: values.subcode,
      category: values.category,
    };
    try {
      if (isTab === "CC") {
        await editCostCategory(body);
      } else if (isTab === "TR") {
        await editTaxRate(body);
      } else {
        editSubCostCategory(body);
      }
      setIsModalOpen(false);
      notification.success({
        message: `${t("noficationAddAndUpdate.update")} ${isTab === "TR"
          ? `${t("admin.taxRatess")}`
          : isTab === "CC"
            ? `${t("admin.cost")}`
            : `${t("admin.additionalCosts")}`
          } ${t("general.success")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationAddAndUpdate.changeFailed")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal} size={edit ? "small" : "middle"} className={edit ? "bg-teal-600 hover:!bg-teal-500" : ""}>
        {edit ? t("general.edit") : t("general.createNew")}
      </Button>
      <Modal
        title={`${edit ? t("general.edit") : t("general.createNew")} ${title}`}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <div>
          <Form
            labelCol={{ span: isTab === "TR" ? 4 : 7 }}
            wrapperCol={{ span: isTab === "TR" ? 20 : 17 }}
            onFinish={edit ? onEdit : onFinish}
            form={form}
          >
            {isTab !== "TR" && (
              <Form.Item name="title" label={titleLabel} className="my-4">
                <Input />
              </Form.Item>
            )}

            <Form.Item
              name={isTab === "SCC" ? `subcode` : `code`}
              label={isTab === "SCC" ? `${t("crm.subcode")}` : `${t("crm.code")}`}
              className="my-4"
            >
              <Input />
            </Form.Item>

            {divisionsData && (
              <Form.Item name="division" label={t("user.division")}>
                <Select
                  placeholder={t("user.division")}
                  allowClear
                  showSearch
                  filterOption={(input, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {divisionsData?.map((item: DataProps) => (
                    <Option key={item.id} value={item.id} label={item.title}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {costCategoryListData && (
              <Form.Item name="category" label={t("admin.cost")}>
                <Select
                  placeholder={t("admin.chooseCost")}
                  allowClear
                  showSearch
                  filterOption={(input, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {costCategoryListData?.map((item: DataProps) => (
                    <Option key={item.id} value={item.id}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="primary"
                htmlType="submit"
                className=" mb-2"
                loading={
                  edit
                    ? isLoadingEdit || isLoadingEditCostCategory || isLoadingEditSubCostCategory
                    : isLoadingAdd || isLoadingAddCostCategory || isLoadingAddSubCostCategory
                }
              >
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

export default AddAndUpdateCost;
