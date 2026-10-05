"use client";
import React from 'react';
import { Tabs } from 'antd';
import { useTranslations } from 'next-intl';
import AddAndUpdatePost from '@/components/FunctionsManagement/Branding/AddAndUpdatePost';
import PostList from '@/components/FunctionsManagement/Branding/PostList';

const { TabPane } = Tabs;

const PostCreation = () => {
  const t: any = useTranslations();
  const tabItems = [
    { key: "1", tab: t("detailFunction.Post Create"), children: <AddAndUpdatePost /> },
    { key: "2", tab: t("detailFunction.Post List"), children: <PostList /> },
  ];

  return (
    <div style={{ width: '90%', overflowX: 'auto' }}>
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

export default PostCreation;
