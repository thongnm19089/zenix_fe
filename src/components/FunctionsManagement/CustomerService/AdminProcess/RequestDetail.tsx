"use client";

import React, { useEffect, useState } from "react";
import { Descriptions, Tag, Button, Typography, Image, Modal, Select, DatePicker, message } from "antd";
import { useGetUserRequestByIdQuery, useUpdateUserRequestForAdminMutation } from "@/api/CustomerService/apiCustomerService";
import AddAndUpdateRequestComment from "./AddAndUpdateRequestComment";
import AddAndUpdateAdminProcess from "./AddAndUpdateAdminProcess";
import { useAvailableFunctionsQuery } from "@/api/SetUp/apiFunction";
import dayjs from "dayjs";
import { useGetUserMcsQuery } from "@/api/SetUp/apiAccount";

const { Text } = Typography;
const { Option } = Select;

interface RequestDetailProps {
    requestId: number;
    isAdminSolution?: boolean;
    onClose?: () => void;
    refetch?: () => void;
}

const getSeverityTextInVietnamese = (severity: string) => {
    switch (severity) {
        case 'low':
            return 'Thấp';
        case 'medium':
            return 'Trung bình';
        case 'high':
            return 'Cao';
        case 'critical':
            return 'Nghiêm trọng';
        default:
            return 'Không xác định';
    }
};

const getSeverityColor = (severity: string | null) => {
    switch (severity) {
        case 'low':
            return 'green'; // Thấp
        case 'medium':
            return 'orange'; // Trung bình
        case 'high':
            return 'red'; // Cao
        case 'critical':
            return 'volcano'; // Nghiêm trọng
        default:
            return 'default'; // Màu mặc định của Ant Design
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "pending":
            return "yellow";
        case "in_progress":
            return "blue";
        case "completed":
            return "green";
        case "failed":
            return "red";
        default:
            return "default"; // Màu mặc định của Ant Design
    }
};

const getStatusTextInVietnamese = (status: string) => {
    switch (status) {
        case 'pending':
            return 'Chờ xử lý';
        case 'in_progress':
            return 'Đang xử lý';
        case 'completed':
            return 'Hoàn thành';
        case 'failed':
            return 'Thất bại';
        default:
            return 'Không xác định'; // Trạng thái không xác định
    }
};

const RequestDetail: React.FC<RequestDetailProps> = ({ requestId, isAdminSolution = false, onClose, refetch: listRequestRefetch }) => {
    const { data: request, refetch } = useGetUserRequestByIdQuery({ id: requestId });
    const [editRequestStatus, { isLoading: isUpdatingStatus }] = useUpdateUserRequestForAdminMutation();
    const { data: availableFunctionsData, isLoading: isLoadingGET, error } = useAvailableFunctionsQuery({});
    const { data: userMcs } = useGetUserMcsQuery()

    const [user, setUser] = useState<any>(null);
    const [visibleComments, setVisibleComments] = useState<number[]>([]);
    const [visibleProcesses, setVisibleProcesses] = useState<number[]>([]);
    const [editingComments, setEditingComments] = useState<number[]>([]);

    const [severityModalVisible, setSeverityModalVisible] = useState(false);
    const [typeModalVisible, setTypeModalVisible] = useState(false);
    const [assignAdminModalVisible, setAssignAdminModalVisible] = useState(false);
    const [functionCategoryModalVisible, setFunctionCategoryModalVisible] = useState(false);
    const [detailFunctionModalVisible, setDetailFunctionModalVisible] = useState(false);

    // Form state values
    const [severity, setSeverity] = useState<string | null>(null);
    const [type, setType] = useState<string | null>(null);
    const [assignAdmin, setAssignAdmin] = useState<string | null>(null);
    const [functionCategory, setFunctionCategory] = useState<number | null>(null);
    const [detailFunction, setDetailFunction] = useState<number | null>(null);
    const [expectedCompletionDate, setExpectedCompletionDate] = useState<any>(null);
    const [actualCompletionDate, setActualCompletionDate] = useState<any>(null);
    const initialVisibleComments = 5;
    const initialVisibleProcesses = 5;

    const [functionCategoryName, setFunctionCategoryName] = useState<string | null>(null);
    const [detailFunctionName, setDetailFunctionName] = useState<string | null>(null);

    useEffect(() => {
        const userDataString = localStorage.getItem("user");
        const parsedUserData = userDataString ? JSON.parse(userDataString) : null;
        setUser(parsedUserData);
    }, []);

    const handleRefetch = async () => {
        await refetch();  // Refetch the user request
        listRequestRefetch?.();  // Call listRequestRefetch after refetching the request data
    };


    useEffect(() => {
        if (request) {
            setSeverity(request.severity);
            setType(request.type);
            setAssignAdmin(request.assign_admin_username);
            setFunctionCategory(request.function_category);
            setDetailFunction(request.detail_function);
            setExpectedCompletionDate(request.expected_completion_date ? dayjs(request.expected_completion_date) : null);
            setActualCompletionDate(request.actual_completion_date ? dayjs(request.actual_completion_date) : null);

            const selectedCategory = availableFunctionsData?.categories?.find((category: any) => category.id === request.function_category);
            const selectedDetailFunction = selectedCategory?.detail_function_list?.find((func: any) => func.id === request.detail_function);

            setFunctionCategoryName(selectedCategory?.title || "Chưa xác định");
            setDetailFunctionName(selectedDetailFunction?.title || "Chưa xác định");
        }
    }, [request]);

    useEffect(() => {
        if (requestId) {
            refetch();
        }
    }, [requestId, refetch]);

    const handleSeverityClick = () => {
        setSeverityModalVisible(true);
    };

    const handleTypeClick = () => {
        setTypeModalVisible(true);
    };

    const handleAssignAdminClick = () => {
        setAssignAdminModalVisible(true);
    };


    const updateRequestField = async (field: string, value: any) => {
        try {
            await editRequestStatus({
                id: requestId,  // The ID of the request
                data: { [field]: value } // Field being updated dynamically
            }).unwrap();
            message.success(`Cập nhật thành công!`);
            handleRefetch();  // Optionally refetch data to get updated request
        } catch (error) {
            message.error(`Cập nhật thất bại`);
        }
    };

    if (!request) {
        return <p>Đang tải...</p>;
    }

    const handleSeverityChange = (value: string) => {
        setSeverity(value);
        setSeverityModalVisible(false);
        updateRequestField("severity", value);
    };

    const handleTypeChange = (value: string) => {
        setType(value);
        setTypeModalVisible(false);
        updateRequestField("type", value);
    };

    const handleAssignAdminChange = (value: string) => {
        setAssignAdmin(value);
        setAssignAdminModalVisible(false);
        updateRequestField("assign_admin", value);
    };

    const handleFunctionCategoryChange = (value: number) => {
        const selectedCategory = availableFunctionsData?.categories?.find((category: any) => category.id === value);
        setFunctionCategory(value);
        setFunctionCategoryName(selectedCategory?.title || "Chưa xác định");
        setFunctionCategoryModalVisible(false);
        updateRequestField("function_category", value);
        updateRequestField("detail_function", null);

    };

    const handleDetailFunctionChange = (value: number) => {
        const selectedCategory = availableFunctionsData?.categories?.find((category: any) => category.id === functionCategory);
        const selectedDetailFunction = selectedCategory?.detail_function_list?.find((func: any) => func.id === value);
        setDetailFunction(value);
        setDetailFunctionName(selectedDetailFunction?.title || "Chưa xác định");
        setDetailFunctionModalVisible(false);
        updateRequestField("detail_function", value);
    };

    const handleExpectedCompletionDateChange = (date: any) => {
        setExpectedCompletionDate(date);
        updateRequestField("expected_completion_date", date ? date.format("YYYY-MM-DD") : null);
    };

    const handleActualCompletionDateChange = (date: any) => {
        setActualCompletionDate(date);
        updateRequestField("actual_completion_date", date ? date.format("YYYY-MM-DD") : null);
    };

    const getAssignAdminName = (adminId: number) => {
        if (userMcs) {
            const admin = userMcs.find((admin: any) => admin.id === adminId);
            return admin ? admin.full_name : "Chưa xác đinh ";
        }
        return "Đang tải...";
    };

    const HtmlContent = (content: string) => {
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
    };
    return (
        <>
            <Descriptions bordered labelStyle={{ width: '25%' }} contentStyle={{ width: '75%' }}>
                <Descriptions.Item label="ID Yêu cầu" span={3}>
                    {request.id.toString().padStart(4, '0')}
                </Descriptions.Item>
                <Descriptions.Item label="Tiêu đề" span={3}>
                    {request.title}
                </Descriptions.Item>

                {/* New fields: Created By and Assign Admin */}
                <Descriptions.Item label="Người tạo" span={3}>
                    {request.created_by_username || "Unknown"}
                </Descriptions.Item>
                {isAdminSolution && (
                    <Descriptions.Item label="Quản trị viên được giao" span={3}>
                        <Tag onClick={handleAssignAdminClick}>
                            {request.assign_admin ? request.assign_admin_username : "Chưa được giao"}
                        </Tag>
                    </Descriptions.Item>
                )}
                <Descriptions.Item label="Mô tả" span={3}>
                    <div dangerouslySetInnerHTML={{ __html: request.description }} />
                </Descriptions.Item>

                {/* Severity Tag - Click to open modal */}
                <Descriptions.Item label="Mức độ nghiêm trọng" span={3}>
                    <Tag
                        color={getSeverityColor(severity || request.severity)}
                        onClick={isAdminSolution ? () => handleSeverityClick() : undefined}
                        className={isAdminSolution ? "cursor-pointer" : ""}
                    >
                        {getSeverityTextInVietnamese(severity || request.severity)}
                    </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Trạng Thái" span={3}>
                    <Tag
                        color={getStatusColor(request.status)}
                    >
                        {getStatusTextInVietnamese(request.status)}
                    </Tag>
                </Descriptions.Item>

                {/* Type Tag - Click to open modal */}
                <Descriptions.Item label="Loại" span={3}>
                    <Tag onClick={isAdminSolution ? () => handleTypeClick() : undefined} className={isAdminSolution ? "cursor-pointer" : ""}>
                        {type || "Xác định loại"}</Tag>
                </Descriptions.Item>

                {/* Function Category and Detail Function - Dropdown */}
                <Descriptions.Item label="Danh mục chức năng" span={3}>
                    <Tag onClick={isAdminSolution ? () => setFunctionCategoryModalVisible(true) : undefined}
                        className={isAdminSolution ? "cursor-pointer" : ""}>
                        {functionCategoryName || "Chọn danh mục"}
                    </Tag>
                </Descriptions.Item>

                {/* Detail Function Name */}
                <Descriptions.Item label="Chi tiết chức năng" span={3}>
                    <Tag onClick={isAdminSolution ? () => setDetailFunctionModalVisible(true) : undefined}
                        className={isAdminSolution ? "cursor-pointer" : ""}>
                        {detailFunctionName || "Chọn chi tiết"}
                    </Tag>
                </Descriptions.Item>

                {isAdminSolution && (
                    <><Descriptions.Item label="Ngày hoàn thành dự kiến" span={3}>
                        <DatePicker
                            value={expectedCompletionDate}
                            onChange={isAdminSolution ? handleExpectedCompletionDateChange : undefined}
                            format="YYYY-MM-DD"
                            disabled={!isAdminSolution} />
                    </Descriptions.Item><Descriptions.Item label="Ngày hoàn thành thực tế" span={3}>
                            <DatePicker
                                value={actualCompletionDate}
                                onChange={isAdminSolution ? handleActualCompletionDateChange : undefined}
                                format="YYYY-MM-DD"
                                disabled={!isAdminSolution} />
                        </Descriptions.Item></>
                )}
                {/* Admin Processes and Request Comments code remains the same */}
                <Descriptions.Item label="Quy trình xử lý" span={3}>
                    {request.admin_process.length > 0 ? (
                        [...request.admin_process]
                            .reverse()
                            .slice(0, visibleProcesses.length || initialVisibleProcesses)
                            .map((process: any) => (
                                <div key={process.id} className="process-item" style={{ marginBottom: '16px' }}>
                                    {/* Process User and Date */}
                                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                        <Text type="secondary">
                                            {process.created_by_username} - {new Date(process.created_at).toLocaleString()}
                                        </Text>
                                        <Tag color={getStatusColor(process.status)}>
                                            {getStatusTextInVietnamese(process.status)}
                                        </Tag>
                                    </div>

                                    {/* Process Feedback Content */}
                                    <div style={{ marginBottom: '12px' }}>
                                        {HtmlContent(process.feedback)}
                                    </div>

                                    {/* Process Images */}
                                    {process.process_images.length > 0 && (
                                        <Image.PreviewGroup>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                                                {process.process_images.map((image: any) => (
                                                    <Image
                                                        key={image.id}
                                                        src={image.image}
                                                        alt="Process Image"
                                                        style={{ width: '150px', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                                                    />
                                                ))}
                                            </div>
                                        </Image.PreviewGroup>
                                    )}

                                    {/* Process Files */}
                                    {process.process_files.length > 0 && (
                                        <div style={{ marginBottom: '12px' }}>
                                            {process.process_files.map((file: any) => (
                                                <a key={file.id} href={file.file} target="_blank" rel="noopener noreferrer" className="font-semibold me-2">
                                                    {`File ${file.id}`}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                    ) : (
                        <span>Tiến trình sẽ được cập nhật sớm!</span>
                    )}

                    {/* Show More / Show Less Buttons */}
                    {request.admin_process.length > initialVisibleProcesses && (
                        <div style={{ marginTop: '16px' }}>
                            {visibleProcesses.length < request.admin_process.length ? (
                                <Button onClick={() => setVisibleProcesses(request.admin_process.map((process: { id: number }) => process.id))}>
                                    Show More Processes
                                </Button>
                            ) : (
                                <Button onClick={() => setVisibleProcesses(request.admin_process.slice(0, initialVisibleProcesses).map((process: { id: number }) => process.id))}>
                                    Show Less Processes
                                </Button>
                            )}
                        </div>
                    )}

                    {isAdminSolution && (
                        <div style={{ marginTop: '16px' }}>
                            <AddAndUpdateAdminProcess
                                requestId={requestId}
                                refetch={handleRefetch}
                                useModal={true}
                                request={request}
                                onCloseDrawer={onClose}
                            />
                        </div>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Bình luận" span={3}>
                    {request.request_comment.length > 0 ? (
                        [...request.request_comment]
                            .reverse()
                            .slice(0, visibleComments.length || initialVisibleComments)
                            .map((comment: any) => (
                                <div key={comment.id} className="comment-item" style={{ marginBottom: '24px' }}>
                                    {/* Comment User and Date */}
                                    <div style={{ marginBottom: '8px' }}>
                                        <Text type="secondary">
                                            {comment.created_by_username} - {new Date(comment.created_at).toLocaleString()}
                                        </Text>
                                    </div>

                                    {/* Comment Content */}
                                    <div style={{ marginBottom: '12px' }}>
                                        {HtmlContent(comment.content)}
                                    </div>

                                    {/* Comment Images */}
                                    {comment.comment_images.length > 0 && (
                                        <Image.PreviewGroup>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                                                {comment.comment_images.map((image: any) => (
                                                    <Image
                                                        key={image.id}
                                                        src={image.image}
                                                        alt="Comment Image"
                                                        style={{ width: '150px', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                                                    />
                                                ))}
                                            </div>
                                        </Image.PreviewGroup>
                                    )}

                                    {/* Comment Files */}
                                    {comment.comment_files.length > 0 && (
                                        <div style={{ marginBottom: '12px' }}>
                                            {comment.comment_files.map((file: any) => (
                                                <a key={file.id} href={file.file} target="_blank" rel="noopener noreferrer" className="font-semibold me-2">
                                                    {`File ${file.id}`}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                    ) : (
                        <span>Chưa có bình luận</span>
                    )}

                    {request.request_comment.length > initialVisibleComments && (
                        <div style={{ marginTop: '16px' }}>
                            {visibleComments.length < request.request_comment.length ? (
                                <Button onClick={() => setVisibleComments(request.request_comment.map((comment: { id: number }) => comment.id))}>
                                    Show More Comments
                                </Button>
                            ) : (
                                <Button onClick={() => setVisibleComments(request.request_comment.slice(0, initialVisibleComments).map((comment: { id: number }) => comment.id))}>
                                    Show Less Comments
                                </Button>
                            )}
                        </div>
                    )}

                    <div style={{ marginTop: '16px' }}>
                        <AddAndUpdateRequestComment
                            requestId={requestId}
                            refetch={refetch}
                            useModal={true}
                        />
                    </div>
                </Descriptions.Item>
                <Descriptions.Item label="Hình ảnh mô tả" span={3}>
                    {request.request_images.length > 0 ? (
                        <Image.PreviewGroup>
                            {request.request_images.map((image: any) => (
                                <Image key={image.id} src={image.image} alt="Request Image" style={{ width: '150px', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                                />
                            ))}
                        </Image.PreviewGroup>
                    ) : (
                        <span>Không có hình ảnh</span>
                    )}
                </Descriptions.Item>

                <Descriptions.Item label="Tệp mô tả" span={3}>
                    {request.request_files && request.request_files.length > 0 ? (
                        request.request_files.map((file: any) => (
                            <div key={file.id}>
                                <a href={file.file} target="_blank" rel="noopener noreferrer" className="font-semibold me-2">{`File ${file.id}`}</a>
                            </div>
                        ))
                    ) : (
                        <span>Không có tệp</span>
                    )}
                </Descriptions.Item>

            </Descriptions>

            {/* Modals */}
            <Modal
                title="Lựa Chọn Mức Độ"
                visible={severityModalVisible}
                onCancel={() => setSeverityModalVisible(false)}
                onOk={() => setSeverityModalVisible(false)}
            >
                <Select defaultValue={severity || request.severity} style={{ width: '100%' }} onChange={handleSeverityChange}>
                    <Option value="low">Thấp</Option>
                    <Option value="medium">Trung Bình</Option>
                    <Option value="high">Cao</Option>
                    <Option value="critical">Đặc biệt</Option>
                </Select>
            </Modal>

            <Modal
                title="Cập Nhật Loại"
                open={typeModalVisible}
                onOk={() => setTypeModalVisible(false)}
                onCancel={() => setTypeModalVisible(false)}
            >
                <Select defaultValue={type || "Xác định loại"} style={{ width: '100%' }} onChange={handleTypeChange}>
                    <Option value="issue">Vấn đề</Option>
                    <Option value="bug">Lỗi</Option>
                    <Option value="feature">Tính năng mới</Option>
                    <Option value="other">Khác</Option>
                </Select>
            </Modal>

            {/* Assign Admin Modal */}
            <Modal
                title="Chọn Quản Trị Viên Được Giao"
                visible={assignAdminModalVisible}
                onCancel={() => setAssignAdminModalVisible(false)}
                onOk={() => setAssignAdminModalVisible(false)}
            >
                <Select defaultValue={assignAdmin || request.assign_admin_username || "Not Assigned"} style={{ width: '100%' }} onChange={handleAssignAdminChange}>
                    {userMcs?.map((user: any) => (
                        <Option key={user.id} value={user.user.id}>
                            {user.user.full_name}
                        </Option>
                    ))}
                </Select>
            </Modal>

            <Modal
                title="Chọn Danh Mục Chức Năng"
                visible={functionCategoryModalVisible}
                onCancel={() => setFunctionCategoryModalVisible(false)}
                onOk={() => setFunctionCategoryModalVisible(false)}
            >
                <Select defaultValue={functionCategory || request.function_category_name || "No category"} style={{ width: '100%' }} onChange={handleFunctionCategoryChange}>
                    {availableFunctionsData?.categories?.map((category: any) => (
                        <Option key={category.id} value={category.id}>
                            {category.title}
                        </Option>
                    ))}
                </Select>
            </Modal>

            {/* Detail Function Modal */}
            <Modal
                title="Chọn Chi Tiết Chức Năng"
                visible={detailFunctionModalVisible}
                onCancel={() => setDetailFunctionModalVisible(false)}
                onOk={() => setDetailFunctionModalVisible(false)}
            >
                <Select defaultValue={detailFunction || request.detail_function_name || "No details"} style={{ width: '100%' }} onChange={handleDetailFunctionChange}>
                    {availableFunctionsData?.categories
                        ?.filter((category: any) => category.id === functionCategory)
                        .flatMap((category: any) => category.detail_function_list)
                        .map((func: any) => (
                            <Option key={func.id} value={func.id}>
                                {func.title}
                            </Option>
                        ))}
                </Select>
            </Modal>
        </>
    );
};

export default RequestDetail;
