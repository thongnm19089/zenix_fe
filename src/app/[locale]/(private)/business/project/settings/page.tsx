import React from "react";
import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import SettingManagement from "@/views/private/management/project/SettingManagement";

export default function page() {
  return (
    <>
      <BreadcrumbFunction functionName="Quản lý dự án" title="Cài đặt" />
      <SettingManagement />
    </>
  );
}
