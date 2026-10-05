"use client";

import React from "react";
import { List, Button, Popconfirm, notification, Tag, Spin } from "antd";
import { useTranslations } from "next-intl";
import { useGetPlatformListQuery, useDeletePlatformMutation } from "@/api/Branding/apiBranding";
import AddAndUpdatePlatform from "./AddAndUpdate/AddAndUpdatePlatform";
import { useRouter } from "next/navigation";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const PlatformSetup = () => {
  const t: any = useTranslations();
  const router = useRouter();
  const { data: platforms, isLoading, error, refetch } = useGetPlatformListQuery({});
  const [deletePlatform, { isLoading: isLoadingDelete }] = useDeletePlatformMutation();

  const onDelete = async (platformId: any) => {
    try {
      await deletePlatform(platformId);
      notification.success({
        message: t('noficationDelete.platformSuccess'),
        placement: "bottomRight",
        className: "h-16",
      });
      refetch();
    } catch (error) {
      notification.error({
        message: t('noficationDelete.platformError'),
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
          <AddAndUpdatePlatform title={t("setup.addPlatform")} />
        </div>
        <List
          bordered
          dataSource={platforms?.results || []}
          renderItem={(item: { id: number, name: string, color: string }) => (
            <List.Item
              actions={[
                <AddAndUpdatePlatform
                  edit={true}
                  platformId={item.id}
                  title={t("setup.editPlatform")}
                />,
                <Popconfirm
                  title={t('noficationDelete.deletePlatform')}
                  description={t('noficationDelete.deletePlatformSure')}
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
                title={<span>{item.name}</span>}
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

export default PlatformSetup;
