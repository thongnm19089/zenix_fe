"use client";
import React, { useState } from "react";
import { Card, Row, Typography } from "antd";
import SwiperCore, { Navigation } from "swiper";
SwiperCore.use([Navigation]);

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

const { Title, Text } = Typography;

type PaymentPlan = {
    size: number;
    time: number;
    original_price: number;
    discount_price: number;
    discount_percentage: number;
};

type PlanSelectionProps = {
    setSize: (size: number) => void;
    setTime: (time: number) => void;
};

function PlanSelection({ setSize, setTime }: PlanSelectionProps) {
    const [activeCard, setActiveCard] = useState<number | null>(null);
    const planData = [
        { size: 10, time: 3, original_price: 1497000, discount_price: 1422150, discount_percentage: 5 },
        { size: 10, time: 6, original_price: 2994000, discount_price: 2694600, discount_percentage: 10 },
        { size: 10, time: 12, original_price: 5988000, discount_price: 4790400, discount_percentage: 20 },
        { size: 70, time: 36, original_price: 62748000, discount_price: 37648800, discount_percentage: 40 },
    ];
    const handleCardClick = (plan: PaymentPlan, index: number) => {
        setTime(plan.time);
        setSize(plan.size)
        setActiveCard(index); // Đánh dấu card được chọn
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    };

    return (
        <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
            <Swiper
                spaceBetween={30}
                slidesPerView="auto" // Tự động điều chỉnh chiều rộng của slide
                navigation={{
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                }}
                modules={[Navigation]}
                style={{
                    paddingBottom: '30px',
                }}
            >
                {planData.map((plan, index) => (
                    <SwiperSlide
                        key={index}
                        style={{
                            width: 'auto', // Slide tự động co giãn theo nội dung
                            flexShrink: 0, // Đảm bảo slide không co lại nếu không đủ không gian
                        }}
                    >
                        <Card
                            hoverable
                            style={{
                                border: activeCard === index ? '2px solid #1890ff' : '1px solid #e8e8e8',
                                backgroundColor: activeCard === index ? '#f0f5ff' : '#fff',
                                borderRadius: "8px",
                                textAlign: "center",
                                width: "100%",
                                maxWidth: "280px", // Giới hạn chiều rộng tối đa
                                paddingLeft: "20px",
                                paddingRight: "20px"
                            }}
                            onClick={() => handleCardClick(plan, index)}
                        >
                            <Text style={{ color: "#9ABFFB", fontSize: "26px", fontWeight: "bold" }}>
                                {formatCurrency(plan.discount_price)}
                            </Text>
                            <Title level={4}>
                                {plan.size} user / {plan.time} months
                            </Title>
                            {plan.discount_percentage > 0 && (
                                <Row className="justify-center align-middle items-center">
                                    <Text className="text-sm" type="secondary" delete>
                                        {formatCurrency(plan.original_price)}
                                    </Text>
                                    <Text className="text-sm ml-1" style={{ display: "block", color: "#f5222d" }}>
                                        {plan.discount_percentage}% Off
                                    </Text>
                                </Row>
                            )}

                        </Card>
                    </SwiperSlide>
                ))}
                <div
                    className="swiper-button-next"
                    style={{
                        width: "25px",
                        height: "25px",
                        backgroundSize: "25px 25px",
                        color: "#000",
                    }}
                />
                <div
                    className="swiper-button-prev"
                    style={{
                        width: "25px",
                        height: "25px",
                        backgroundSize: "25px 25px",
                        color: "#000",
                    }}
                />
            </Swiper>
        </div>
    );
}

export default PlanSelection;
