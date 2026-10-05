"use client";

import { useGetAnalyticsCompanyQuery, useGetAnalyticsTaskQuery } from "@/api/Analytics/apiAnalytics";
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import DashboardCard from "@/components/Dashboard/DashboardCard";
import { RootState } from "@/store/store";
import { Card, Col, Row, Statistic, DatePicker, Form, Spin } from "antd";
import { ApexOptions } from "apexcharts";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { CiViewList } from "react-icons/ci";
import { FcAlarmClock } from "react-icons/fc";
import { GiCheckeredFlag, GiAlarmClock } from "react-icons/gi";
import { MdOutlineAccessAlarm } from "react-icons/md";
import { useSelector } from "react-redux";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const { RangePicker } = DatePicker;

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AnalyticsTask = () => {
  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const t: any = useTranslations();
  const router = useRouter();

  const { data: analyticsTaskData, isLoading, refetch, error } = useGetAnalyticsTaskQuery({
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
  });

  // Redirect to custom 403 page if there's a 403 error
  if (error && 'status' in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push('/403/');
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  const baseBarChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 500,
    },
    plotOptions: {
      bar: {
        horizontal: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    yaxis: {
      title: {
        text: `${t('card.jobNumber')}`,
      },
      labels: {
        formatter: function (val: number | bigint) {
          // Định dạng số để hiển thị đẹp hơn trên trục y
          return new Intl.NumberFormat("en-US", { maximumSignificantDigits: 3 }).format(val);
        },
      },
    },
    xaxis: {
      // Cấu hình mặc định cho trục x, có thể được ghi đè ở mỗi biểu đồ cụ thể
    },

    fill: {
      opacity: 1,
    },
    // Các cấu hình khác...
  };

  // Xử lý dữ liệu cho biểu đồ
  const activeCardsByBoardData = {
    series: [
      {
        name: `${t('card.jobNumber')}`,
        data: analyticsTaskData?.active_cards_by_board.map((item: { count: number }) => item.count),
      },
    ],
    xaxis: {
      categories: analyticsTaskData?.active_cards_by_board.map(
        (item: { trello_list__board__name: string }) => `${item.trello_list__board__name}`
      ),
    },
  };

  const activeCardsByBoardChartOptions = {
    ...baseBarChartOptions,
    xaxis: {
      categories: analyticsTaskData?.active_cards_by_board.map(
        (item: { trello_list__board__name: string }) => `${item.trello_list__board__name}`
      ),
    },
  };

  const handleRefresh = () => {
    refetch(); // Kích hoạt việc tải lại dữ liệu
  };

  return (
    <div
      className={`overflow-x-auto w-screen ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"
        }   min-h-[calc(100vh-138px)] p-6 `}
    >
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-3">
        <DashboardCard
          title={t('card.numberOfJobsAvailable')}
          statistics={analyticsTaskData?.total_active_cards}
          icon={<CiViewList />}
          onRefresh={handleRefresh}
        />
        <DashboardCard
          title={t('card.numberOfJobsCompleted')}
          titleTable={t('card.listIsComplete')}
          statistics={analyticsTaskData?.completed_active_cards}
          statisticsCardList={analyticsTaskData?.completed_active_cards_detail}
          icon={<GiCheckeredFlag />}
          onRefresh={handleRefresh}
        />
        <DashboardCard
          title={t('card.ofOverdueJobs')}
          titleTable={t('card.listOfOverdueJobs')}
          statistics={analyticsTaskData?.active_cards_overdue}
          statisticsCardList={analyticsTaskData?.active_cards_overdue_detail}
          icon={<FcAlarmClock />}
          onRefresh={handleRefresh}
        />
        <DashboardCard
          title={t('card.withinDays')}
          titleTable={t('card.workDuringTheDay')}
          statistics={analyticsTaskData?.active_cards_due_today}
          statisticsCardList={analyticsTaskData?.active_cards_due_today_detail}
          icon={<MdOutlineAccessAlarm />}
          onRefresh={handleRefresh}
        />
        <DashboardCard
          title={t('card.inWeek')}
          titleTable={t('card.workDuringTheWeek')}
          statistics={analyticsTaskData?.active_cards_due_this_week}
          statisticsCardList={analyticsTaskData?.active_cards_due_this_week_detail}
          icon={<GiAlarmClock />}
          onRefresh={handleRefresh}
        />
      </div>
      <Card title={t('chart.jobBoard')} className="text-black">
        <ReactApexChart
          options={activeCardsByBoardChartOptions}
          series={activeCardsByBoardData.series}
          type="bar"
          height={470}

        />
      </Card>
    </div>
  );
};

export default AnalyticsTask;
