"use client";

import BreadcrumbAdmin from "../../../components/Breadcrumb/BreadcrumbFunction";
import AddAndUpdateJobTitle from "../../../components/FunctionsAdmin/AddAndUpdateJobTitle";
import {
  useDeletePositionMutation,
  useGetPositionListQuery,
  useGetStaffManagerListQuery,
  useDeleteStaffManagerMutation,
} from "@/api/SetUp/apiHRConfiguration";
import AddAndUpdateStaffManager from "@/components/FunctionsAdmin/AddAndUpdateStaffManager";
import { RootState } from "@/store/store";
import { Breadcrumb, Table, Button, List, Popconfirm, notification } from "antd";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslations } from "next-intl";
import Link from "next-intl/link";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import BreadcrumbFunction from "../../../components/Breadcrumb/BreadcrumbFunction";
import ModalRelationship from "@/components/FunctionsAdmin/ModalRelationship";

interface positionItem {
  title?: string;
  code?: string;
  id?: number;
}

interface StaffManagerDataType {
  key: number;
  staff: string;
  manager: string;
  type: string;
  rank?: string;
  idManager?: any;
  typeCode?: any;
}

const SupervisoryRoles = () => {
  const t: any = useTranslations();
  const { data: staffManagerList } = useGetStaffManagerListQuery();
  const [deleteStaffManager, { isLoading: isLoadingDelete }] = useDeleteStaffManagerMutation();
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);

  const onDelete = async (staffManagerId: any) => {
    try {
      await deleteStaffManager({ staffManagerId });
      notification.success({
        message: `${t('noficationDelete.staffManagerSuccess')}`,
        placement: "bottomRight",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.staffManagerError')}`,
        placement: "bottomRight",
      });
    }
  };

  const cancel = () => { };

  const dataSource = staffManagerList?.results.map(
    (item: { id: any; management_type_str: any; staff_str: any; manager_str: any; rank: any, management_type_code: any }) => ({
      key: item.id, // Corrected from item.key to item.id
      type: item.management_type_str,
      staff: item.staff_str.full_name,
      manager: item.manager_str.full_name,
      rank: item.rank,
      idManager: item.manager_str.id,
      typeCode: item.management_type_code,

    })
  );

  const uniqueManagers = Array.from(new Set(dataSource?.map((item: { manager: any }) => item.manager))).sort();
  const managerFilters = uniqueManagers
    .filter((manager): manager is string => typeof manager === "string")
    .map((manager) => ({
      text: manager,
      value: manager,
    }));

  const uniqueStaffs = Array.from(new Set(dataSource?.map((item: { staff: any }) => item.staff))).sort();
  const staffFilters = uniqueStaffs
    .filter((staff): staff is string => typeof staff === "string")
    .map((staff) => ({
      text: staff,
      value: staff,
    }));

  const uniqueTypes = Array.from(new Set(dataSource?.map((item: { type: any }) => item.type))).sort();
  const typeFilters = uniqueTypes
    .filter((type): type is string => typeof type === "string")
    .map((type) => ({
      text: type,
      value: type,
    }));

  const uniqueRanks = Array.from(new Set(dataSource?.map((item: { rank: any }) => item.rank))).sort();
  const rankFilters = uniqueRanks
    .filter((rank): rank is string => typeof rank === "string" || typeof rank === "number")
    .map((rank) => ({
      text: `Cấp ${rank}`,
      value: rank,
    }));


  const columns: ColumnsType<StaffManagerDataType> = [
    {
      title: `${t('admin.manager')}`,
      dataIndex: "manager",
      key: "manager",
      filters: managerFilters,
      onFilter: (value, record) => {
        const stringValue = String(value);
        return typeof record.manager === "string" && record.manager.includes(stringValue);
      },
      render: (_, { type, idManager, manager, rank, typeCode }) => (
        <ModalRelationship type={type} idManager={idManager} manager={manager} rank={rank} typeCode={typeCode} />
      ),
      align: "center",
    },
    {
      title: `${t('hr.employee')}`,
      dataIndex: "staff",
      key: "staff",
      filters: staffFilters,
      onFilter: (value, record) => {
        const stringValue = String(value);
        return typeof record.staff === "string" && record.staff.includes(stringValue);
      },
      align: "center",
    },
    {
      title: `${t('admin.administered')}`,
      dataIndex: "type",
      key: "type",
      filters: typeFilters,
      onFilter: (value, record) => {
        const stringValue = String(value);
        return typeof record.type === "string" && record.type.includes(stringValue);
      },
      align: "center",
    },
    {
      title: `${t('admin.rank')}`,
      dataIndex: "rank",
      key: "rank",
      align: "center",
      filters: rankFilters,
      onFilter: (value, record) => {
        const stringValue = String(value);
        return typeof record.rank === "string" && record.rank.includes(stringValue);
      },
      render: (_, record) => <p>Cấp {record?.rank}</p>,
    },
    {
      title: `${t('table.action')}`,
      key: "action",
      render: (_, record) => [
        <div className="flex">
          <AddAndUpdateStaffManager
            edit={true}
            title={t("nav.supervisoryRoles")}
            staffManagerId={record.key}
            key="edit"
          />

          <Popconfirm
            title={t('noficationDelete.staffManager')}
            onConfirm={() => onDelete(record.key)}
            onCancel={cancel}
            okText={t('general.confirm')}
            cancelText={t('general.close')}
            placement="left"
            key="delete"
            okButtonProps={{ loading: isLoadingDelete }}
          >
            <Button danger className="ml-3" size="small">
              {t('general.delete')}
            </Button>
          </Popconfirm>

        </div>,
      ],
      align: "center",
    },
  ];

  return (
    <>
      <div
        className={` w-[calc(100vw-44px)]  ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-320px)]"
          } min-h-[calc(100vh-70px)]`}
      >
        <div className="flex justify-end mb-4">
          <AddAndUpdateStaffManager title={t("nav.supervisoryRoles")} />
        </div>

        <div className="overflow-x-auto">
          <Table
            rowSelection={{
            }}
            columns={columns}
            dataSource={dataSource}
            loading={isLoadingDelete}
            bordered
            scroll={{ x: 1000 }}
          />
        </div>
      </div>
    </>
  );
};

const SaleMarketingDelegation: React.FC = () => {
  const t: any = useTranslations();

  const onChange = (key: string) => {
    console.log(`Tab changed to: ${key}`);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: t("nav.supervisoryRoles"), // Translation for SupervisoryRoles
      children: <SupervisoryRoles />,
    },
  ];

  // Set defaultActiveKey to "1" to make the SupervisoryRoles tab the default active tab
  return <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
};

export default SaleMarketingDelegation;
