import { Breadcrumb } from "antd";
import { useTranslations } from "next-intl";
import React from "react";

export default function BreadcrumbFunction({ functionName, title }: { functionName: string; title: string }) {
  const t: any = useTranslations();

  return (
    <div className="flex justify-between px-7 my-5 items-center">
      <div className="text-xl font-semibold text-white">{title}</div>

      <Breadcrumb
        className="text-lg max-md:hidden"
        separator=">"
        items={[
          {
            title: functionName,
          },
          {
            title: title,
          },
        ]}
      />
    </div>
  );
}
