import React, { useState } from "react";
import { Button, Modal, Spin, Tag } from "antd";
import { useTranslations } from "next-intl";
import { useGetSubordinatesQuery } from "@/api/SetUp/apiHRConfiguration";
import { Collapse } from "antd";

const { Panel } = Collapse;

interface ModalRelationshipProps {
    type: string;
    manager: string;
    idManager: any;
    rank: any;
    typeCode: any;
}

const ModalRelationship: React.FC<ModalRelationshipProps> = ({ type, manager, idManager, rank, typeCode }) => {
    const t: any = useTranslations();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const { data: subordinates, isLoading } = useGetSubordinatesQuery(
        { staffManagerId: idManager },
        { skip: !isModalVisible || !idManager }
    );

    const handleShowManagerDetail = () => {
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    const rankColors = [
        "blue",   // Rank 1
        "green",  // Rank 2
        "orange", // Rank 3
        "blue",     // Rank 4
        "purple", // Rank 5
        "cyan",   // Rank 6
        "magenta",// Rank 7
        "yellow", // Rank 8
        "volcano",// Rank 9
        "lime"    // Rank 10
    ];
    // Hàm đệ quy để hiển thị tất cả các cấp
    const renderPanels = (currentRank: number, managerId?: number) => {
        if (currentRank > 10) return null; // Dừng lại nếu đã đến cấp 10

        const filteredSubordinates = subordinates?.filter(
            (item: any) => item.rank === currentRank.toString() && (!managerId || item.manager === managerId) &&  item.management_type_code === typeCode
        );

        if (filteredSubordinates.length === 0) return null; // Nếu không có dữ liệu thì không hiển thị Collapse

        return (
            <Collapse accordion>
                {filteredSubordinates.map((item: any) => {
                    const nextRank = currentRank + 1;
                    const hasChildren = subordinates?.some(
                        (child: any) => child.rank === nextRank.toString() && child.manager === item.staff
                    );

                    return (
                        <Panel
                            header={item.staff_str.full_name}
                            key={item.id}
                            showArrow={hasChildren} // Chỉ hiển thị mũi tên nếu có cấp dưới
                        >
                            {hasChildren && (
                                <Tag color={rankColors[currentRank] || "default"} className="mb-2">
                                    Rank {currentRank + 1}
                                </Tag>
                            )}

                            {/* Đệ quy gọi renderPanels cho các cấp tiếp theo */}
                            {renderPanels(nextRank, item.staff)}
                        </Panel>
                    );
                })}
            </Collapse>
        );
    };

    return (
        <>
            <Button type="link" onClick={handleShowManagerDetail}>
                {manager}
            </Button>
            <Modal
                title={`${manager} - ${type}`}
                visible={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
            >
                {isLoading ? (
                    <Spin />
                ) : subordinates ? (
                    <>
                        <Tag color="red" className="mb-2 mt-2">Rank {parseInt(rank)}</Tag>
                        {renderPanels(parseInt(rank), idManager)} {/* Bắt đầu từ rank hiện tại */}
                    </>
                ) : (
                    <p>{t("admin.noDetailsAvailable")}</p>
                )}
            </Modal>
        </>
    );
};

export default ModalRelationship;
