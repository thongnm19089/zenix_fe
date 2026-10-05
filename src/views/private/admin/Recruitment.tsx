"use client";

import {
  useDeleteSourceMutation,
  useDeleteStatusMutation,
  useGetSourcesQuery,
  useGetStatusListQuery,
} from "@/api/SetUp/apiHRConfiguration";
import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import BreadcrumbAdmin from "@/components/Breadcrumb/BreadcrumbFunction";
import AddAndUpdateRecruitment from "@/components/FunctionsAdmin/AddAndUpdateRecruitment";
import { Button, List, Popconfirm, Tag, notification } from "antd";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { useTranslations } from "next-intl";
import React from "react";

interface RecruitmentProps {
  title: string;
  status: string;
  color: string;
  id: number;
}

const Sources = () => {
  const t: any = useTranslations();

  const { data: sources } = useGetSourcesQuery();
  const [deleteSource, { isLoading: isLoadingDelete }] = useDeleteSourceMutation();

  const onDelete = async (sourceId: any) => {
    try {
      await deleteSource({ sourceId });
      notification.success({
        message: `${t('noficationDelete.sourceSuccess')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.sourceError')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  return (
    <>
      <div className="flex justify-end mb-4 mr-8">
        <AddAndUpdateRecruitment title={t("admin.sources")} titleLabel={t("admin.sources")} />
      </div>
      <List<RecruitmentProps>
        className="w-full"
        bordered
        itemLayout="horizontal"
        dataSource={sources?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <AddAndUpdateRecruitment edit={true} title={t("admin.sources")} titleLabel={t("admin.sources")} sourceId={item.id} />,
              <Popconfirm
                title={t('noficationDelete.source')}
                description={t('noficationDelete.sourceSure')}
                onConfirm={() => onDelete(item.id)}
                onCancel={cancel}
                okText={t('general.confirm')}
                cancelText={t('general.close')}
                placement="left"
                okButtonProps={{ loading: isLoadingDelete }}
              >
                <Button danger size="small">{t('general.delete')}</Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta title={<Tag color={item.color}>{item.title}</Tag>} />
          </List.Item>
        )}
        locale={{ emptyText: `${t('noficationDelete.noSource')}` }}
      />
    </>
  );
};

const Status = () => {
  const t: any = useTranslations();
  const { data: statusList } = useGetStatusListQuery();
  const [deleteStatus, { isLoading: isLoadingDelete }] = useDeleteStatusMutation();

  const onDelete = async (statusId: any) => {
    try {
      await deleteStatus({ statusId });
      notification.success({
        message: `${t('noficationDelete.leadFollowerSuccess')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.leadFollowerError')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  return (
    <>
      <div className="flex justify-end mb-4 mr-8">
        <AddAndUpdateRecruitment title={t("general.status")} titleLabel={t("general.status")} isStatus={true} />
      </div>

      <List<RecruitmentProps>
        className="w-full"
        bordered
        itemLayout="horizontal"
        dataSource={statusList?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <AddAndUpdateRecruitment
                edit={true}
                title={t("general.status")}
                titleLabel={t("general.status")}
                isStatus={true}
                statusId={item.id}
              />,
              <Popconfirm
                title={t("noficationDelete.leadFollower")}
                description={t("noficationDelete.leadFollowerSure")}
                onConfirm={() => onDelete(item.id)}
                onCancel={cancel}
                okText={t('general.confirm')}
                cancelText={t('general.close')}
                placement="left"
                okButtonProps={{ loading: isLoadingDelete }}
              >
                <Button danger size="small">{t('general.delete')}</Button>
              </Popconfirm>,
              ,
            ]}
          >
            <List.Item.Meta title={<Tag color={item.color}>{item.status}</Tag>} />
          </List.Item>
        )}
      />
    </>
  );
};

const Recruitment: React.FC = () => {
  const t: any = useTranslations();

  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: t("admin.sources"),
      children: <Sources />,
    },
    {
      key: "2",
      label: t("general.status"),
      children: <Status />,
    },
  ];

  return (
    <>
      <BreadcrumbFunction title={t("nav.recruitment")} functionName={t("admin.administrator")} />
      <Tabs className="mt-6" defaultActiveKey="1" items={items} onChange={onChange} />
    </>
  )
};

export default Recruitment;
