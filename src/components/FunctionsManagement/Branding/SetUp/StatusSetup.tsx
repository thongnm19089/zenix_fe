"use client";

import React from "react";
import { List, Button, Popconfirm, notification, Tag, Spin } from "antd";
import { useTranslations } from "next-intl";
import { useGetStatusListQuery, useDeleteStatusMutation } from "@/api/Branding/apiBranding";
import AddAndUpdateStatus from "./AddAndUpdate/AddAndUpdateStatus";
import { useRouter } from "next/navigation";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const StatusSetup = () => {
  const t: any = useTranslations();
  const router = useRouter();
  const { data: statuses, isLoading, error } = useGetStatusListQuery({});
  const [deleteStatus, { isLoading: isLoadingDelete }] = useDeleteStatusMutation();

  const onDelete = async (statusId: any) => {
    try {
      await deleteStatus(statusId);
      notification.success({
        message: t('noficationDelete.statusSuccess'),
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: t('noficationDelete.statusError'),
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
          <AddAndUpdateStatus title={t("setup.addStatus")} />
        </div>
        <List
          bordered
          dataSource={statuses?.results || []}
          renderItem={(item: { id: number, name: string, color: string, is_first_default: boolean }) => (
            <List.Item
              actions={[
                <AddAndUpdateStatus edit={true} statusId={item.id} title={t("setup.editStatus")} />,
                <Popconfirm
                  title={t('noficationDelete.deleteStatus')}
                  description={t('noficationDelete.deleteStatusSure')}
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

export default StatusSetup;
