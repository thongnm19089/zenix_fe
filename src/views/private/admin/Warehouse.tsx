"use client";

import { useDeleteWarehouseMutation, useGetWarehouseListQuery } from "@/api/Inventory/apiInventory";
import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import AddAndUpdateWarehouse from "@/components/FunctionsManagement/CRM/Products/AddAndUpdateWarehouse";
import { Button, Form, Input, List, Popconfirm, Space, Table, Tabs, notification } from "antd";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

interface ListWarehouseProps {
  id: number;
  name: string;
  location_str: string;
  address: string;
  keeper: string;
  contact: string;
  operating_hours: string;
}

const Warehouse = () => {
  const t: any = useTranslations();
  const { data: warehouseList } = useGetWarehouseListQuery();
  const [deleteWarehouse, { isLoading: isLoadingDelete }] = useDeleteWarehouseMutation();

  const onDelete = async (warehouseId: any) => {
    try {
      await deleteWarehouse({ warehouseId });
      notification.success({
        message: `${t("noficationDelete.inventorySuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.inventoryFailed")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => {};
  return (
    <>
      <div className="flex justify-end my-4 mr-8">
        <AddAndUpdateWarehouse />
      </div>
      <List<ListWarehouseProps>
        className="w-full "
        bordered
        itemLayout="horizontal"
        dataSource={warehouseList?.results || []}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            actions={[
              <AddAndUpdateWarehouse edit={true} warehouseId={item.id} />,
              <Popconfirm
                title={t("noficationDelete.deleteInventory")}
                description={t("noficationDelete.wantRepository")}
                onConfirm={() => onDelete(item.id)}
                onCancel={cancel}
                okText={t("general.confirm")}
                cancelText={t("table.actionValues.canceltext")}
                placement="left"
                okButtonProps={{ loading: isLoadingDelete }}
              >
                <Button danger size="small">
                  {t("general.delete")}
                </Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={item.name}
              description={`${t("nav.location")} ${item.location_str}, ${t("auth.address")} ${item.address}, ${t(
                "nav.contact"
              )}${item.contact},${t("admin.manager")} ${item.keeper},${t("admin.hoursOfOperation")}  ${
                item.operating_hours
              }`}
            />
          </List.Item>
        )}
        locale={{ emptyText: `${t("noficationAddAndUpdate.warehousesYet")}` }}
      />
    </>
  );
};

export default Warehouse;
