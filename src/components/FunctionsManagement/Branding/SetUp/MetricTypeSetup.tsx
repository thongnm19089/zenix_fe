"use client";

import React from "react";
import { List, Button, Popconfirm, notification, Tag, Spin } from "antd";
import { useTranslations } from "next-intl";
import { useGetMetricTypeListQuery, useDeleteMetricTypeMutation } from "@/api/Branding/apiBranding";
import AddAndUpdateMetricType from "./AddAndUpdate/AddAndUpdateMetricType";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useRouter } from "next/navigation";

const MetricTypeSetup = () => {
  const t: any = useTranslations();
  const router = useRouter();
  const { data: metricTypes, isLoading, error } = useGetMetricTypeListQuery({});
  const [deleteMetricType, { isLoading: isLoadingDelete }] = useDeleteMetricTypeMutation();

  const onDelete = async (metricTypeId: any) => {
    try {
      await deleteMetricType(metricTypeId);
      notification.success({
        message: t('noficationDelete.metricTypeSuccess'),
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: t('noficationDelete.metricTypeError'),
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
          <AddAndUpdateMetricType title={t("setup.addMetricType")} />
        </div>
        <List
          bordered
          dataSource={metricTypes?.results || []}
          renderItem={(item: { id: number, name: string, color: string, code: string, created_by_username: string, frequency_choices: string }) => (
            <List.Item
              actions={[
                <AddAndUpdateMetricType edit={true} metricTypeId={item.id} title={t("setup.editMetricType")} />,
                <Popconfirm
                  title={t('noficationDelete.deleteMetricType')}
                  description={t('noficationDelete.deleteMetricTypeSure')}
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
                    <span style={{ fontSize: "14px", color: item.color }}>
                      {item.name}
                    </span>{" "}
                    - <span style={{ fontSize: "12px", color: "gray" }}>
                      {item.code}
                    </span>{" "}
                    - <span style={{ fontSize: "12px", color: "gray" }}>
                      {item.frequency_choices}
                    </span>
                  </div>
                }
                description={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Tag color={item.color} style={{ marginRight: "8px" }}>
                      {item.color}
                    </Tag>
                    <span style={{ fontSize: "12px", color: "gray" }}>
                      {t('setup.createdBy')}: {item.created_by_username}
                    </span>
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

export default MetricTypeSetup;
