"use client";

import {
  useGetAnalyticsHrQuery,
} from "@/api/Analytics/apiAnalytics";
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import DashboardCard from "@/components/Dashboard/DashboardCard";
import { RootState } from "@/store/store";
import { Card, DatePicker, Form, Spin } from "antd";
import { ApexOptions } from "apexcharts";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { MdCreateNewFolder, MdFormatListBulletedAdd } from "react-icons/md";
import { IoCalendarNumberSharp } from "react-icons/io5";
import { FaFileSignature } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { TimeRangePickerProps } from "antd/lib";

const { RangePicker } = DatePicker;

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AnalyticsHR = () => {
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const t: any = useTranslations();
  const router = useRouter();
  const currentMonthStart = dayjs().startOf('month');
  const currentDate = dayjs();

  const { data: analyticsHrData, isLoading, error } = useGetAnalyticsHrQuery({
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

  const onDateChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null, formatString: [string, string]) => {
    if (dates && dates[0] && dates[1]) {
      // Cả hai ngày đều không phải là null
      setDateRange([dates[0], dates[1]]);
    } else {
      // Ít nhất một trong hai ngày là null, hoặc cả 'dates' là null
      setDateRange([]);
    }
  };

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
      height: 200,
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
        text: `${t('general.quantity')}`,
      },
      labels: {
        formatter: function (val: number | bigint) {
          return new Intl.NumberFormat("en-US", { maximumSignificantDigits: 3 }).format(val);
        },
      },
    },
    xaxis: {},
    tooltip: {
      y: {
        formatter: function (val: { toLocaleString: () => string }) {
          return val.toLocaleString() + `${t('general.people')}`;
        },
      },
    },
    fill: {
      opacity: 1,
    },
  };

  const staffByContractTypeData = {
    series: [
      {
        name: `${t('general.quantity')}`,
        data: analyticsHrData?.staff_by_contract_type.map((item: { count: any }) => item.count),
      },
    ],
    xaxis: {
      categories: analyticsHrData?.staff_by_contract_type.map((item: { type__title: any }) => `${item.type__title} `),
    },
  };
  const staffByContractTypeDataChartOptions = {
    ...baseBarChartOptions,
    xaxis: {
      categories: analyticsHrData?.staff_by_contract_type.map((item: { type__title: any }) => `${item.type__title}`),
    },
  };

  const rangePresets: TimeRangePickerProps['presets'] = [
    { label: `${t("rangePreset.Last 7 days")}`, value: [dayjs().add(-7, 'd'), dayjs()] },
    { label: `${t("rangePreset.Last Month")}`, value: [dayjs().add(-1, 'month'), dayjs()] },
    { label: `${t("rangePreset.Last three Months")}`, value: [dayjs().add(-3, 'month'), dayjs()] },
    { label: `${t("rangePreset.Last Year")}`, value: [dayjs().add(-1, 'year'), dayjs()] },
    { label: `${t("rangePreset.Last two Year")}`, value: [dayjs().add(-2, 'year'), dayjs()] },
  ];
  return (
    <div
      className={`overflow-x-auto w-screen ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"
        }   min-h-[calc(100vh-138px)] p-6 `}
    >
      <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-3">
        <DashboardCard title={t('card.numberOfNewCv')} statistics={analyticsHrData?.new_applications} icon={<MdCreateNewFolder />} />
        <DashboardCard title={t('card.numberOfEmployees')} statistics={analyticsHrData?.total_staff} icon={<IoCalendarNumberSharp />} />
        <DashboardCard title={t('card.newPersonnel')} statistics={analyticsHrData?.new_staff} icon={<MdFormatListBulletedAdd />} />
        <DashboardCard
          title={t('card.reSigned')}
          statistics={analyticsHrData?.upcoming_renewals}
          icon={<FaFileSignature />}
        />
      </div>
      <Form layout="inline" className="mb-4">
        <Form.Item>
          <RangePicker
            presets={rangePresets}
            onChange={onDateChange}
            placeholder={[`${t('general.startDate')}`, `${t('general.endDate')}`]}
            defaultValue={[currentMonthStart, currentDate]}
          />
        </Form.Item>
      </Form>

      <Card title={t('card.numberOfContracts')} className="text-black">
        <ReactApexChart
          options={staffByContractTypeDataChartOptions}
          series={staffByContractTypeData.series}
          type="bar"
          height={530}
        />
      </Card>
    </div>
  );
};

export default AnalyticsHR;
