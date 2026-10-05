"use client";

import React, { useState } from "react";
import { Card, Row, Col, Form, DatePicker, Input } from "antd";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import dayjs from "dayjs";
import { TimeRangePickerProps } from "antd/lib";

const { RangePicker } = DatePicker;

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const CourseProgress = () => {
  const t: any = useTranslations();
  const router = useRouter();
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");

  // Example data for charts
  const exampleProgressData = {
    series: [
      {
        name: "Progress",
        data: [80, 90, 70, 85, 95, 60],
      },
    ],
    categories: ["Student 1", "Student 2", "Student 3", "Student 4", "Student 5", "Student 6"],
  };

  const exampleCompletionData = {
    series: [45, 55, 30, 65, 75],
    labels: ["Module 1", "Module 2", "Module 3", "Module 4", "Module 5"],
  };

  const barChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: exampleProgressData.categories,
    },
  };

  const pieChartOptions: ApexOptions = {
    chart: {
      type: "pie",
    },
    labels: exampleCompletionData.labels,
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const rangePresets: TimeRangePickerProps['presets'] = [
    { label: `${t("rangePreset.Last 7 days")}`, value: [dayjs().add(-7, 'd'), dayjs()] },
    { label: `${t("rangePreset.Last Month")}`, value: [dayjs().add(-1, 'month'), dayjs()] },
    { label: `${t("rangePreset.Last three Months")}`, value: [dayjs().add(-3, 'month'), dayjs()] },
    { label: `${t("rangePreset.Last Year")}`, value: [dayjs().add(-1, 'year'), dayjs()] },
    { label: `${t("rangePreset.Last two Year")}`, value: [dayjs().add(-2, 'year'), dayjs()] },
  ];

  return (
    <div className={`w-screen ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"} px-6`}>
      <div className="flex justify-between items-center flex-1 pt-2 max-md:flex-col max-md:gap-3">
        <Input placeholder="Search courses..." onChange={(e) => setTempSearchTerm(e.target.value)} />
        <div className="flex justify-end text-right w-full gap-2"></div>
      </div>

      <div className="mt-4">
        <Form layout="inline" className="mb-4">
          <Form.Item>
            <RangePicker
              presets={rangePresets}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([dates[0], dates[1]]);
                } else {
                  setDateRange([]);
                }
              }}
              placeholder={[`${t('general.startDate')}`, `${t('general.endDate')}`]}
            />
          </Form.Item>
        </Form>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="Student Progress">
              <ReactApexChart options={barChartOptions} series={exampleProgressData.series} type="bar" height={350} />
            </Card>
          </Col>
          <Col span={24}>
            <Card title="Module Completion">
              <ReactApexChart options={pieChartOptions} series={exampleCompletionData.series} type="pie" height={350} />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CourseProgress;
