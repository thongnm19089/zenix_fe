"use client";

import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Pagination, Input, Tag, Spin } from "antd";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { IoRefresh } from "react-icons/io5";
import { RootState } from "@/store/store";
import { useGetPostListQuery } from "@/api/Branding/apiBranding";
import dayjs from "dayjs";
import { useWindowSize } from "@/utils/responsiveSm";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const PostSummary = () => {
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const router = useRouter();
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const { data: postList, isLoading: isLoadingListPost, refetch, error } = useGetPostListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    searchTerm,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(tempSearchTerm);
      setPagination({ ...pagination, current: 1 });
    }, 500); // Debounce thời gian 500ms

    return () => clearTimeout(timeoutId);
  }, [tempSearchTerm]);

  const onSearchChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setTempSearchTerm(e.target.value);
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
    refetch();
  };

  const dataSource = postList?.results || [];

  // Example data for charts
  const exampleLineData = {
    series: [{
      name: 'Metric',
      data: [30, 40, 45, 50, 49, 60, 70, 91]
    }],
    options: {
      chart: {
        type: 'line' as const,
        height: 350
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
      }
    },
  };

  const exampleBarData = {
    series: [{
      name: 'Metric',
      data: [10, 15, 25, 35, 45, 55, 65, 75]
    }],
    options: {
      chart: {
        type: 'bar' as const,
        height: 350
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
      }
    },
  };

  const examplePieData = {
    series: [44, 55, 41, 17, 15],
    options: {
      chart: {
        type: 'pie' as const,
        height: 350
      },
      labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E']
    },
  };

  if (isLoadingListPost) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <Spin size="large" />
      </div>
    );
  }
  // Redirect to custom 403 page if there's a 403 error
  if (error && "status" in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push("/403/");
    }
  }

  return (
    <div className={`w-screen ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"} px-6`}>
      <div className="flex justify-between items-center flex-1 pt-2 max-md:flex-col max-md:gap-3">
        <Input placeholder="Search posts..." onChange={onSearchChange} />
        <div className="flex justify-end text-right w-full gap-2">
          <Button
            type="dashed"
            icon={<IoRefresh className="text-blue-500" />}
            className="flex items-center justify-center border-blue-500 text-blue-500"
            onClick={handleRefresh}
          >
            {t('general.refreshPage')}
          </Button>
        </div>
      </div>
      <Row gutter={[16, 16]} className="mt-4">
        {dataSource.map((post: any) => (
          <Col xs={24} sm={12} md={8} lg={6} key={post.id}>
            <Card>
              <Card.Meta
                title={post.title}
                description={
                  <>
                    {post.category_str && (
                      <Tag color={post.category_str.color} style={{ marginBottom: '5px' }}>
                        {post.category_str.name}
                      </Tag>
                    )}
                    {post.subcategory_str && (
                      <Tag color={post.subcategory_str.color} style={{ marginBottom: '5px' }}>
                        {post.subcategory_str.name}
                      </Tag>
                    )}
                    <ReactApexChart options={exampleLineData.options} series={exampleLineData.series} type="line" height={200} />
                    <ReactApexChart options={exampleBarData.options} series={exampleBarData.series} type="bar" height={200} />
                    <ReactApexChart options={examplePieData.options} series={examplePieData.series} type="pie" height={200} />
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Pagination
        className="mt-4 text-right"
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={postList?.total || 0}
        showSizeChanger
        onChange={handleTableChange}
        pageSizeOptions={["10", "20", "50", "100", "200"]}
      />
    </div>
  );
};

export default PostSummary;
