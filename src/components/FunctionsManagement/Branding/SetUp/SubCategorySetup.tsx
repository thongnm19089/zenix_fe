"use client";

import React from "react";
import { List, Button, Popconfirm, notification, Tag, Spin } from "antd";
import { useTranslations } from "next-intl";
import { useGetSubCategoryListQuery, useDeleteSubCategoryMutation } from "@/api/Branding/apiBranding";
import AddAndUpdateSubCategory from "./AddAndUpdate/AddAndUpdateSubCategory";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useRouter } from "next/navigation";

const SubCategorySetup = () => {
  const t: any = useTranslations();
  const router = useRouter();
  const { data: subcategories, isLoading, error } = useGetSubCategoryListQuery({});
  const [deleteSubCategory, { isLoading: isLoadingDelete }] = useDeleteSubCategoryMutation();

  const onDelete = async (subCategoryId: any) => {
    try {
      await deleteSubCategory(subCategoryId);
      notification.success({
        message: t('noficationDelete.subCategorySuccess'),
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: t('noficationDelete.subCategoryError'),
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error && "status" in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push("/403/");
    }
  }

  return (
    <>
      <div className="px-3 mb-10">
        <div className="flex justify-end mb-4">
          <AddAndUpdateSubCategory title={t("setup.addSubCategory")} />
        </div>
        <List
          bordered
          dataSource={subcategories?.results || []}
          renderItem={(item: { id: number, name: string, color: string, category_str: string }) => (
            <List.Item
              actions={[
                <AddAndUpdateSubCategory edit={true} subCategoryId={item.id} title={t("setup.editSubCategory")} />,
                <Popconfirm
                  title={t('noficationDelete.deleteSubCategory')}
                  description={t('noficationDelete.deleteSubCategorySure')}
                  onConfirm={() => onDelete(item.id)}
                  onCancel={cancel}
                  okText={t('general.confirm')}
                  cancelText={t('general.cancel')}
                  placement="left"
                  okButtonProps={{ loading: isLoadingDelete }}
                >
                  <Button size="small" danger>{t('general.delete')}</Button>
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={
                  <div>
                    <span>{item.name}</span>
                    <div style={{ fontSize: "14px", color: "gray" }}>
                      {item.category_str}
                    </div>
                  </div>
                }
                description={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Tag color={item.color} style={{ marginRight: "8px" }}>{item.color}</Tag>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    </>
  );
};

export default SubCategorySetup;
