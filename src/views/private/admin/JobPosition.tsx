"use client";

import AddAndUpdateJobTitle from "../../../components/FunctionsAdmin/AddAndUpdateJobTitle";
import {
  useDeletePositionMutation,
  useGetPositionListQuery,
} from "@/api/SetUp/apiHRConfiguration";
import { Button, List, Popconfirm, notification } from "antd";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { useTranslations } from "next-intl";
import React, {  } from "react";
import BreadcrumbFunction from "../../../components/Breadcrumb/BreadcrumbFunction";

interface positionItem {
  title?: string;
  code?: string;
  id?: number;
}

const JobPosition = () => {
  const t: any = useTranslations();
  const { data: positionList } = useGetPositionListQuery();
  const [deletePosition, { isLoading: isLoadingDelete }] = useDeletePositionMutation();

  const onDelete = async (positionId: any) => {
    try {
      await deletePosition({ positionId });
      notification.success({
        message: `${t('noficationDelete.positionSuccess')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.positionError')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  return (
    <>
      <div className="flex justify-end my-4 mr-8">
        <AddAndUpdateJobTitle title={t("nav.jobTitle")} titleLabel={t("nav.jobTitle")} codeLabel={t("admin.positionCode")} />
      </div>
      <List<positionItem>
        className="w-full "
        bordered
        itemLayout="horizontal"
        dataSource={positionList?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <AddAndUpdateJobTitle
                edit={true}
                title={t("nav.jobTitle")}
                titleLabel={t('table.title')}
                codeLabel={t('admin.positionCode')}
                positionId={item.id}
              />,
              <Popconfirm
                title={t('noficationDelete.position')}
                description={t('noficationDelete.positionSure')}
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
            <List.Item.Meta title={`${item.code} - ${item.title}`} />
          </List.Item>
        )}
        locale={{ emptyText: `${t('noficationDelete.noPosition')}` }}
      />
    </>
  );
};

const JobPositionComponent: React.FC = () => {
  const t: any = useTranslations();

  const onChange = (key: string) => {
    console.log(`Tab changed to: ${key}`);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: t("nav.jobTitle"), // Translation for Job Position
      children: <JobPosition />,
    },
  ];

  // Set defaultActiveKey to "1" to make the SupervisoryRoles tab the default active tab
  return (
    <>
      <BreadcrumbFunction title={t("nav.jobPosition")} functionName={t("admin.administrator")} />
      <Tabs className="mt-6" defaultActiveKey="1" items={items} onChange={onChange} />
    </>
  )

};

export default JobPositionComponent;
