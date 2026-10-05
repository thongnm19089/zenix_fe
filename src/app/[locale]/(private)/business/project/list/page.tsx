import React from "react";
import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import ProjectManagement from "@/views/private/management/project/ProjectManagement";

export default function page() {
  return (
    <>
      <BreadcrumbFunction functionName="Quản lý dự án" title="Danh sách dự án" />
      <ProjectManagement />
    </>
  );
}
