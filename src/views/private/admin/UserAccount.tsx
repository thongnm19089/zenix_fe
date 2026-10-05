"use client";

import { useDeleteAccountMutation } from "@/api/SetUp/apiAccount";
import { useGetSetupHrAppQuery, useGetSetupQuery } from "@/api/SetUp/apiSetup";
import AddEmployee from "@/components/FunctionsAdmin/AddEmployee";
import UpdateEmployee from "@/components/FunctionsAdmin/UpdateEmployee";
import { RootState } from "@/store/store";
import { Button, Col, Row, Table, Modal, notification, Space, Popconfirm, Input, Collapse } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import BreadcrumbFunction from "../../../components/Breadcrumb/BreadcrumbFunction";
import { useWindowSize } from "@/utils/responsiveSm";
import ActionTable from "@/components/DropDown/ActionTable";

const { Panel } = Collapse;

interface DataType {
  key: React.Key;
  username: string;
  fullname: string;
  phone: string;
  email: string;
  division: string;
  branch: string;
  position: string;
  detail_function: any;
}

const UserAccount: React.FC = () => {
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const [employeeData, setEmployeeData] = useState<DataType[]>([]);
  const [divisionData, setDivisionData] = useState<Array<{ key: React.Key; title: string }>>([]);
  const [branchData, setBranchData] = useState<Array<{ key: React.Key; name: string }>>([]);
  const [detailFunctionData, setDetailFunctionData] = useState<Array<{ key: React.Key; title: string; en_title: string; category_str: string }>>([]);
  // const [showDeleteModal, setShowDeleteModal] = useState(false);
  // const [itemToDelete, setItemToDelete] = useState<null | React.Key>(null);
  const [deleteAccount, { isLoading: isLoadingDelete }] = useDeleteAccountMutation();
  const [searchTerms, setSearchTerms] = useState({
    username: "",
    fullname: "",
    email: "",
    phone: "",
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const { data: setupList, refetch: refetchSetupList, isLoading: isLoadingSetUpList } = useGetSetupQuery();
  const { data: setupHRList } = useGetSetupHrAppQuery();

  useEffect(() => {
    if (setupList) {
      const employeeData = formatEmployeeData(setupList.employee_list);
      const divisionData = formatDivisionData(setupList.division_list);
      const branchData = formatBranchData(setupList.branch_list);
      const detailFunctionData = formatDetailFunctionData(setupList.detail_function_list);
      setEmployeeData(employeeData);
      setDivisionData(divisionData);
      setBranchData(branchData);
      setDetailFunctionData(detailFunctionData);
    }
  }, [setupList]);

  const onDelete = async (value: any) => {
    try {
      const res = await deleteAccount(value);
      refetchSetupList()
      notification.success({
        message: `${t('noficationAddAndUpdate.success')}`,
        description: `${t('noficationDelete.accountSuccess')}`,
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationAddAndUpdate.apiCallFailed')}`,
        description: `${t('noficationAddAndUpdate.toAnApiEerror')}`,
      });
    }
  };

  const handleTableChange = (newPagination: any) => {
    setPagination(newPagination);
  };

  const formatEmployeeData = (rawData: any[]) => {
    if (!rawData) return [];

    return rawData.map(
      (emp: {
        id: any;
        username: any;
        first_name: any;
        last_name: any;
        email: any;
        user_profile: {
          user_mobile_number: any;
          division: { title: any };
          branch: { name: any };
          position: { title: any };
          detail_function: any;
        };
      }) => ({
        key: emp?.id,
        username: emp?.username,
        email: emp?.email,
        fullname: `${emp.first_name} ${emp.last_name}`,
        phone: emp?.user_profile?.user_mobile_number,
        division: emp?.user_profile?.division?.title,
        branch: emp?.user_profile?.branch?.name,
        position: emp?.user_profile?.position?.title,
        detail_function: emp?.user_profile?.detail_function, // Add this line
      })
    );
  };

  const formatDivisionData = (rawData: any[]) => {
    if (!rawData) return [];

    return rawData.map((division: { id: any; title: any }) => ({
      key: division.id,
      title: division.title,
    }));
  };

  const formatBranchData = (rawData: any[]) => {
    if (!rawData) return [];

    return rawData.map((branch: { id: any; name: any }) => ({
      key: branch.id,
      name: branch.name,
    }));
  };

  const formatDetailFunctionData = (rawData: any[]) => {
    if (!rawData) return [];

    return rawData.map((detailFunction: { id: any; title: any; en_title: any; category_str: any }) => ({
      key: detailFunction.id,
      title: detailFunction.title,
      en_title: detailFunction.en_title,
      category_str: detailFunction.category_str,
    }));
  };

  const uniqueDivisions = Array.from(new Set(employeeData.map((emp) => emp.division))).sort();
  const divisionFilters = uniqueDivisions.map((division) => ({
    text: division,
    value: division,
  }));

  const uniqueBranches = Array.from(new Set(employeeData.map((emp) => emp.branch))).sort();
  const branchFilters = uniqueBranches.map((branch) => ({
    text: branch,
    value: branch,
  }));

  const uniquePositions = Array.from(new Set(employeeData.map((emp) => emp.position))).sort();
  const positionFilters = uniquePositions.map((position) => ({
    text: position,
    value: position,
  }));

  const cancel = () => { };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPagination({ ...pagination, current: 1 });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  const columns: ColumnsType<DataType> = [
    {
      title: "STT",
      key: "index",
      width: 50,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
      align: "center",
    },
    { title: t("user.username"), dataIndex: "username", key: "username", align: "center" },
    { title: t("user.fullName"), dataIndex: "fullname", key: "fullname", align: "center", },
    { title: t("user.phone"), dataIndex: "phone", key: "phone", align: "center", },
    { title: t("user.email"), dataIndex: "email", key: "email", align: "center", },
    {
      title: t("user.division"),
      dataIndex: "division",
      key: "division",
      filters: divisionFilters,
      onFilter: (value: any, record) => record?.division?.indexOf(value) === 0,
      align: "center",
    },
    {
      title: t("user.branch"),
      dataIndex: "branch",
      key: "branch",
      filters: branchFilters,
      onFilter: (value: any, record) => record?.branch?.indexOf(value) === 0,
      align: "center",
    },
    {
      title: t("user.position"),
      dataIndex: "position",
      key: "position",
      filters: positionFilters,
      onFilter: (value: any, record) => record?.position?.indexOf(value) === 0,
      align: "center",
    },
    {
      key: "action",
      width: width > 640 ? 125 : 35,
      fixed: "right",
      render: (_, record) => (
        <Space size="middle" direction="vertical" className="text-center">
          <div className="flex gap-2">
            <ActionTable
              items={[
                {
                  key: "1",
                  label: (
                    <UpdateEmployee
                      userId={record.key}
                      divisionData={divisionData}
                      branchData={branchData}
                      positionData={setupHRList?.position_list}
                      detailFunctionData={detailFunctionData}
                      refetchSetupList={refetchSetupList}
                    />
                  ),
                },
                {
                  key: "2",
                  label: (
                    <Popconfirm
                      title={t("user.confirmDeleteTitle")}
                      description={t("user.confirmDeleteMessage")}
                      onConfirm={() => onDelete(record.key)}
                      onCancel={cancel}
                      okText={t("general.confirm")}
                      cancelText={t("general.close")}
                      placement="left"
                      okButtonProps={{ loading: isLoadingDelete }}
                    >
                      <Button danger size="small" className="max-sm:hidden">{t("general.delete")}</Button>
                      <div className="sm:hidden text-center">{t("general.delete")}</div>
                    </Popconfirm>
                  ),
                },
              ]}
            />
          </div>
        </Space>
      ),
      align: "center",
    },
  ];

  const allSearchTermsEmpty = Object.values(searchTerms).every((term) => term === "");

  const filteredEmployeeData = allSearchTermsEmpty
    ? employeeData
    : employeeData.filter((emp) => {
      return (
        emp?.username?.toLowerCase().includes(searchTerms.username.toLowerCase()) &&
        emp?.fullname?.toLowerCase().includes(searchTerms.fullname.toLowerCase()) &&
        emp?.email?.toLowerCase().includes(searchTerms.email.toLowerCase()) &&
        emp?.phone?.includes(searchTerms?.phone)
      );
    });

  return (
    <>
      <BreadcrumbFunction title={t("nav.userAccount")} functionName={t("admin.administrator")} />
      <div className={`w-screen  ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"} px-6`}>
        <div className="flex justify-end mb-4">
          <AddEmployee
            divisionData={divisionData}
            branchData={branchData}
            positionData={setupHRList?.position_list}
            detailFunctionData={detailFunctionData}
            refetchSetupList={refetchSetupList}
          />
        </div>
        <div className="grid grid-cols-4 gap-4 my-4">
          <Input
            placeholder={t('admin.searchUsername')}
            value={searchTerms.username}
            onChange={(e) => setSearchTerms((prev) => ({ ...prev, username: e.target.value }))}
          />
          <Input
            placeholder={t('admin.searchFullName')}
            value={searchTerms.fullname}
            onChange={(e) => setSearchTerms((prev) => ({ ...prev, fullname: e.target.value }))}
          />
          <Input
            placeholder={t('admin.searchPhone')}
            value={searchTerms.phone}
            onChange={(e) => setSearchTerms((prev) => ({ ...prev, phone: e.target.value }))}
          />
          <Input
            placeholder={t('admin.searchEmail')}
            value={searchTerms.email}
            onChange={(e) => setSearchTerms((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>
        {/* 
        <Modal
          title={t("user.confirmDeleteTitle")}
          open={showDeleteModal}
          onOk={async () => {
            setShowDeleteModal(false);
            if (itemToDelete) {
              await onDelete(itemToDelete);
              setItemToDelete(null);
            }
          }}
          onCancel={() => {
            setShowDeleteModal(false);
            setItemToDelete(null);
          }}
        >
          <p>{t("user.confirmDeleteMessage")}</p>
        </Modal> */}

        <div className="overflow-x-auto">
          <Table
            columns={columns}
            expandable={{
              expandedRowRender: (record) => {
                // Nhóm các chức năng theo `category_str`
                const groupedFunctions = record.detail_function.reduce((acc: any, func: any) => {
                  const category = func.category_str;
                  if (!acc[category]) {
                    acc[category] = [];
                  }
                  acc[category].push(func);
                  return acc;
                }, {});

                return (
                  <Collapse>
                    {Object.keys(groupedFunctions).map((category) => (
                      <Panel header={t(`functionCategory.${category}`)} key={category}>
                        <ul style={{ listStyleType: 'revert', paddingLeft: '20px' }}>
                          {groupedFunctions[category].map((func: any) => (
                            <li key={func.id} style={{ marginBottom: '8px' }}>{func.title}</li>
                          ))}
                        </ul>
                      </Panel>
                    ))}
                  </Collapse>
                );
              },
            }}
            pagination={{
              ...pagination,
              total: setupList?.employee_list?.length || 0,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100", "200"],
            }}
            onChange={handleTableChange}
            dataSource={filteredEmployeeData}
            loading={isLoadingSetUpList}
            scroll={{ x: 1000 }}
            bordered
          />
        </div>
      </div>
    </>
  );
};

export default UserAccount;
