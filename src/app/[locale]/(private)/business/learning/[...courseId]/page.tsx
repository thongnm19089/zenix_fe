"use client";

import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import CourseDetailPage from "@/views/private/management/learning/CourseDetailPage";
import React from "react";
import { useTranslations } from "next-intl";

type PageProps = {
  params: {
    courseId: string;
  };
};

export default function Page({ params }: PageProps) {
  const t: any = useTranslations();

  return (
    <>
      <BreadcrumbFunction functionName={t('functionCategory.Learning')} title={t('detailFunction.Course Me')} />
      <div>
        <CourseDetailPage courseId={params.courseId} />
      </div>
    </>
  );
}
