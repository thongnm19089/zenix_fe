"use client";

import {
  useGetAssignmentMeListQuery,
  useGetAdminCoursesQuery,
  useGetAdminGradeAssignmentAnswersQuery,
  useDeleteAssignmentMutation,
} from "@/api/Learning/apiLearning";
import AddAndUpdateAssignment from "@/components/FunctionsManagement/Learning/AddAndUpdateAssignment";
import AssignmentDetail from "@/components/FunctionsManagement/Learning/AssignmentDetail";
import AssignmentAnswer from "@/components/FunctionsManagement/Learning/AssignmentAnswer";
import { useWindowSize } from "@/utils/responsiveSm";
import { UploadOutlined } from "@ant-design/icons";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Card, Row, Col, Button, Pagination, notification, Input, Drawer, Tabs, Rate, Typography, Collapse, Popconfirm } from "antd";
import { useTranslations } from "next-intl";
import { usePathname,
useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { IoRefresh } from "react-icons/io5";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { User } from "@/types/userTypes";
import BussinessTable from "./BusinessTable";
import ServiceTable from "./ServiceTable";
import DocumentTable from "./DocumentTable";
import VideoTable from "./VideoTable";
import PaymentTable from "./PaymentTable";

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Title } = Typography;

const truncateText = (text: string, maxLength: number) => {
  if (text?.length <= maxLength) return text;
  return text?.slice(0, maxLength) + "...";
};

const BussinessPortal = () => {
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const router = useRouter();
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const pathName = usePathname();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('businessesList'); // Default tab

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      const parsedUserData = JSON.parse(userDataString);
      setUser(parsedUserData);
      // console.log(parsedUserData)
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(tempSearchTerm);
      setPagination({ ...pagination, current: 1 });
    }, 500); // Debounce thời gian 500ms

    return () => clearTimeout(timeoutId);
  }, [tempSearchTerm]);

  const onSearchChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    const value = e.target.value;
    setTempSearchTerm(value);
  };

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({
      current: page,
      pageSize,
    });
  };

  const handleRefresh = () => {
    setTempSearchTerm("");
    setSearchTerm("");
  };

  const [deleteAssignment, { isLoading: isLoadingDelete }] = useDeleteAssignmentMutation();

  const onDelete = async (assignmentId: any) => {
    try {
      await deleteAssignment(assignmentId);
      notification.success({
        message: `${t("noficationDelete.assignmentSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.assignmentError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const [totalItems, setTotalItems] = useState(100);

  return (
    <div className={`w-screen ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"} pt-6 pb-10`}>
      <div className="flex justify-end items-center gap-2 pt-2 max-md:flex-col max-md:items-stretch max-md:gap-3">
        <Input
          placeholder="Search assignments..."
          onChange={onSearchChange}
          className="max-w-md w-full"
        />

        <Button
          type="text"
          icon={<IoRefresh />}
          onClick={handleRefresh}
          style={{
            border: "1px solid #f1692f",
            color: "#f1692f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="whitespace-nowrap"
        >
          {t("general.refreshThePage")}
        </Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Doanh nghiệp" key="businessesList">
          <Row gutter={[16, 16]} className="mt-4">
            <BussinessTable
              offset={pagination.current-1}
              limit={pagination.pageSize}
              onTotal={setTotalItems}
            />
          </Row>
        </TabPane>
        <TabPane tab="Dịch vụ" key="servicesList">
          <Row gutter={[16, 16]} className="mt-4 overflow-x-auto ">
            <ServiceTable
              offset={pagination.current-1}
              limit={pagination.pageSize}
              onTotal={setTotalItems}
            />
          </Row>
        </TabPane>
        <TabPane tab="Tài liệu" key="documentsList">
          <Row gutter={[16, 16]} className="mt-4 overflow-x-auto ">
            <DocumentTable
              offset={pagination.current-1}
              limit={pagination.pageSize}
              setTotal={setTotalItems}
            />
          </Row>
        </TabPane>
        <TabPane tab="Videos" key="videoList">
          <Row gutter={[16, 16]} className="mt-4 overflow-x-auto ">
            <VideoTable
              offset={pagination.current-1}
              limit={pagination.pageSize}
              setTotal={setTotalItems}
            />
          </Row>
        </TabPane>
        <TabPane tab="Lịch thanh toán" key="paymentList">
          <Row gutter={[16, 16]} className="mt-4 overflow-x-auto ">
            <PaymentTable
              offset={pagination.current-1}
              limit={pagination.pageSize}
              setTotal={setTotalItems}
            />
          </Row>
        </TabPane>
      </Tabs>

      <Pagination
        className="mt-4 text-right"
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={totalItems}
        showSizeChanger
        onChange={handleTableChange}
        pageSizeOptions={["10", "20", "50", "100", "200"]}
      />

      {/* <Drawer */}
      {/*   title="Assignment Details" */}
      {/*   width={width > 768 ? '50%' : '100%'} */}
      {/*   open={!!selectedAssignmentId || !!selectedGradeAssignmentId} */}
      {/*   onClose={onCloseDrawer} */}
      {/*   destroyOnClose */}
      {/* > */}
      {/*   {selectedAssignmentId && <AssignmentDetail assignmentId={selectedAssignmentId} refetchMe={refetchMe} />} */}
      {/*   {selectedGradeAssignmentId && <AssignmentAnswer assignmentId={selectedGradeAssignmentId} refetch={refetch} />} */}
      {/* </Drawer> */}
    </div>
  );
};

export default BussinessPortal;
