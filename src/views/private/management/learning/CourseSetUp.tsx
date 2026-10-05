"use client";

import React from "react";
import { Tabs } from "antd";
import { useTranslations } from "next-intl";
import CategorySetup from "@/components/FunctionsManagement/Learning/SetUp/CategorySetup";
import SubCategorySetup from "@/components/FunctionsManagement/Learning/SetUp/SubCategorySetup";

const { TabPane } = Tabs;

const CourseSetUp = () => {
  const t: any = useTranslations();

  const tabItems = [
    { key: "1", tab: t("setup.categories"), children: <CategorySetup /> },
    { key: "2", tab: t("setup.subcategories"), children: <SubCategorySetup /> },
  ];

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <Tabs defaultActiveKey="1">
        {tabItems.map(item => (
          <TabPane key={item.key} tab={item.tab}>
            {item.children}
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default CourseSetUp;
