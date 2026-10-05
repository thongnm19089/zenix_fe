import React, { useState } from 'react';
import { Modal, Typography, Button, Collapse, Tag } from 'antd';
import { useGetDuplicateLeadsMarketerQuery, useGetDuplicateLeadsSellerQuery } from '@/api/CRM/apiLead';

const { Text } = Typography;
const { Panel } = Collapse;

type CustomerDuplicateLeadType = {
    name: string;
    id: number;
    isMarketer: boolean;
};

const CustomerDuplicateLead = (props: CustomerDuplicateLeadType) => {
    const { name, id, isMarketer } = props;
    const [isModalVisible, setIsModalVisible] = useState(false);

    const { data: duplicateLeads, isLoading } =
        useGetDuplicateLeadsMarketerQuery({ id }, { skip: !isModalVisible })

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            {isMarketer ? (
                <Text onClick={showModal} style={{ cursor: 'pointer', color: 'white' }}>
                    {name}
                </Text>
            ) : (
                <Button
                    className="flex items-center justify-center border-red-500 text-red-500"
                    onClick={showModal}
                    block
                    size="small"
                >
                    Danh sách trùng lặp
                </Button>
            )}

            <Modal
                title="Danh sách khách hàng trùng lặp"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null}
                bodyStyle={{ maxHeight: '500px', overflowY: 'auto' }}
            >
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <Collapse accordion>
                        {duplicateLeads?.map((customer: any) => (
                            <Panel
                                header={
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text strong>{customer?.name}</Text>
                                        <Text>{customer?.mobile}</Text>
                                    </div>
                                }
                                key={customer?.id}
                            >
                                <div style={{ padding: '10px' }}>
                                    <div style={{ display: 'flex', marginBottom: '16px' }}>
                                        <Text strong style={{ minWidth: '120px' }}>Người tiếp thị:</Text>
                                        <Text>{customer?.seller}</Text>
                                    </div>

                                    <div style={{ display: 'flex', marginBottom: '16px' }}>
                                        <Text strong style={{ minWidth: '120px' }}>Nguồn:</Text>

                                        {customer?.source_lead?.title ? (
                                            <Tag color={customer?.source_lead?.color}>
                                                {customer?.source_lead?.title}
                                            </Tag>
                                        ) : (
                                            <Tag>
                                                Chưa xác định
                                            </Tag>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', marginBottom: '16px' }}>
                                        <Text strong style={{ minWidth: '120px' }}>Trạng thái:</Text>
                                        {customer?.stage_value ? (
                                            <Tag color={customer?.stage_value?.color}>
                                                {customer?.stage_value?.stage}
                                            </Tag>
                                        ) : (
                                            <Tag>
                                                Chưa liên hệ
                                            </Tag>
                                        )}
                                    </div>
                                </div>

                                {/* Hiển thị follower_list */}
                                <Collapse>
                                    {customer?.follower_list?.map((follower: any) => (
                                        <Panel header={`${follower?.user_str}`} key={follower?.id}>
                                            <div style={{ display: 'flex', marginBottom: '8px' }}>
                                                <Text strong style={{ minWidth: '180px' }}>Phương thức liên lạc:</Text>
                                                <Text>{follower?.contact_type_str ? follower?.contact_type_str : 'Chưa có thông tin'}</Text>
                                            </div>
                                            <div style={{ display: 'flex', marginBottom: '8px' }}>
                                                <Text strong style={{ minWidth: '180px' }}>Phương thức liên lạc kế tiếp:</Text>
                                                <Text className='ml-1'>{follower?.next_contact_type_str ? follower?.next_contact_type_str : 'Chưa có thông tin'}</Text>
                                            </div>
                                            <div style={{ display: 'flex', marginBottom: '8px' }}>
                                                <Text strong style={{ minWidth: '180px' }}>Trạng thái:</Text>
                                                {follower?.stage_str ? (
                                                    <Tag color={follower?.stage_color}>
                                                        {follower?.stage_str}
                                                    </Tag>
                                                ) : (
                                                    <Tag>
                                                        Chưa liên hệ
                                                    </Tag>
                                                )}
                                            </div>
                                        </Panel>
                                    ))}
                                </Collapse>
                            </Panel>
                        ))}
                    </Collapse>
                )}
            </Modal>
        </>
    );
};

export default CustomerDuplicateLead;
