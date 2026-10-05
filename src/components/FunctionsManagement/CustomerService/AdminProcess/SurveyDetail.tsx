"use client";

import React, { useEffect, useState } from "react";
import { Descriptions, Tag, Rate, Typography } from "antd";

const { Text } = Typography;

interface SurveyDetailProps {
    survey: any;
}

const SurveyDetail: React.FC<SurveyDetailProps> = ({ survey }) => {

    if (!survey) {
        return <p>Đang tải...</p>;
    }

    return (
        <Descriptions title="Chi tiết khảo sát" bordered labelStyle={{ width: '20%' }} contentStyle={{ width: '80%' }}>
            <Descriptions.Item label="Người tạo" span={3}>
                {survey.created_by_username}
            </Descriptions.Item>

            <Descriptions.Item label="Tháng khảo sát" span={3}>
                {survey.survey_month}
            </Descriptions.Item>

            <Descriptions.Item label="Mức độ hài lòng" span={3}>
                <Rate disabled defaultValue={survey.satisfaction_level} />
            </Descriptions.Item>

            <Descriptions.Item label="Mức độ hỗ trợ" span={3}>
                <Rate disabled defaultValue={survey.support_level} />
            </Descriptions.Item>

            <Descriptions.Item label="Mức độ thân thiện với người dùng" span={3}>
                <Rate disabled defaultValue={survey.user_friendly_level} />
            </Descriptions.Item>

            <Descriptions.Item label="Mức độ hiệu suất" span={3}>
                <Rate disabled defaultValue={survey.performance_level} />
            </Descriptions.Item>

            <Descriptions.Item label="Mức độ đáng giá tiền" span={3}>
                <Rate disabled defaultValue={survey.value_for_money_level} />
            </Descriptions.Item>

            <Descriptions.Item label="Đề xuất cho người khác" span={3}>
                <Tag color={survey.recommend_to_others ? "green" : "red"}>
                    {survey.recommend_to_others ? "Đã đề xuất" : "Không đề xuất"}
                </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Cần theo dõi" span={3}>
                <Tag color={survey.follow_up_needed ? "yellow" : "blue"}>
                    {survey.follow_up_needed ? "Cần theo dõi" : "Không cần theo dõi"}
                </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Điểm không hài lòng" span={3}>
                <Text>{survey.dissatisfaction_points || "Không có điểm không hài lòng"}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Ý kiến đóng góp" span={3}>
                <Text>{survey.building_comment || "Không có ý kiến"}</Text>
            </Descriptions.Item>
        </Descriptions>
    );
};

export default SurveyDetail;
