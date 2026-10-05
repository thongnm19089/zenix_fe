"use client";

import React from "react";
import { Tabs } from "antd";
import { useTranslations } from "next-intl";
import PlatformSetup from "@/components/FunctionsManagement/Branding/SetUp/PlatformSetup";
import CreatorSetup from "@/components/FunctionsManagement/Branding/SetUp/CreatorSetup";
import CategorySetup from "@/components/FunctionsManagement/Branding/SetUp/CategorySetup";
import SubCategorySetup from "@/components/FunctionsManagement/Branding/SetUp/SubCategorySetup";
import BrandingChannelSetup from "@/components/FunctionsManagement/Branding/SetUp/BrandingChannelSetup";
import StatusSetup from "@/components/FunctionsManagement/Branding/SetUp/StatusSetup";
import TagSetup from "@/components/FunctionsManagement/Branding/SetUp/TagSetup";
import MetricTypeSetup from "@/components/FunctionsManagement/Branding/SetUp/MetricTypeSetup";

const { TabPane } = Tabs;

const PostSetUp = () => {
  const t: any = useTranslations();

  const tabItems = [
    { key: "1", tab: t("setup.platforms"), children: <PlatformSetup /> },
    { key: "2", tab: t("setup.creators"), children: <CreatorSetup /> },
    { key: "3", tab: t("setup.categories"), children: <CategorySetup /> },
    { key: "4", tab: t("setup.subcategories"), children: <SubCategorySetup /> },
    { key: "5", tab: t("setup.brandingChannels"), children: <BrandingChannelSetup /> },
    { key: "6", tab: t("setup.statuses"), children: <StatusSetup /> },
    { key: "7", tab: t("setup.tags"), children: <TagSetup /> },
    { key: "8", tab: t("setup.metricTypes"), children: <MetricTypeSetup /> },
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

export default PostSetUp;
