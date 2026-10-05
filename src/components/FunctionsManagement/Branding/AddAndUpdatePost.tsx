"use client";

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Upload, DatePicker, Select, Switch, notification, Space, Row, Col } from 'antd';
import { UploadOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useCreatePostMutation, useSetUpBrandQuery } from '@/api/Branding/apiBranding';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const { Option } = Select;
const { TextArea } = Input;

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function AddAndUpdatePost() {
    const t: any = useTranslations();
    const [form] = Form.useForm();
    const [isAds, setIsAds] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [createPost, { isLoading }] = useCreatePostMutation();
    const [filteredSubcategories, setFilteredSubcategories] = useState([]);
    const { data: setupData, isLoading: isLoadingSetup } = useSetUpBrandQuery({});

    useEffect(() => {
        if (selectedCategory && setupData?.subcategory_list) {
            const filtered = setupData.subcategory_list.filter(
                (subcategory: { category: number }) => subcategory.category === selectedCategory
            );
            setFilteredSubcategories(filtered);
        }
    }, [selectedCategory, setupData]);

    const onFinish = async (values: any) => {
        const formData = new FormData();
        for (const key in values) {
            if (values.hasOwnProperty(key)) {
                if (key === 'images' || key === 'videos') {
                    values[key]?.fileList.forEach((file: any) => {
                        formData.append(key, file.originFileObj);
                    });
                } else if (key === 'urls' && Array.isArray(values[key])) {
                    values[key].forEach((url: string) => {
                        formData.append(key, url);
                    });
                } else if (key === 'post_date') {
                    if (values[key]) {
                        formData.append(key, dayjs(values[key]).format('YYYY-MM-DD'));
                    }
                } else if (key === 'branding_channels') {
                    values[key].forEach((id: number) => {
                        formData.append(key, id.toString());
                    });
                }
                else if (key === 'tags' && Array.isArray(values[key])) {
                    values[key].forEach((id: number) => {
                        if (id !== undefined && id !== null) {
                            formData.append(key, id.toString());
                        }
                    });
                }
                else if (values[key] !== undefined && values[key] !== null) {
                    formData.append(key, values[key]);
                }
            }
        }
        formData.append('is_ads', isAds.toString());
        try {
            await createPost(formData).unwrap();
            notification.success({
                message: 'Post created successfully!',
            });
            form.resetFields();
        } catch (error: any) {
            notification.error({
                message: 'Failed to create post!',
                description: error.message,
            });
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' },
            { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video'
    ];

    const handleAdsChange = (checked: boolean) => {
        setIsAds(checked);
    };

    const handleCategoryChange = (value: number) => {
        setSelectedCategory(value);
        form.setFieldsValue({ subcategory: null });
    };

    return (
        <div className='px-3'>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    is_ads: isAds,
                }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="title" label={t("table.title")} rules={[{ required: true, message: 'Please input the title!' }]}>
                            <Input placeholder="Enter the title" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="post_date" label="Ngày đăng bài">
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="content"
                            label="Content"
                            rules={[{ required: true, message: 'Please input the content!' }]}
                        >
                            <ReactQuill
                                modules={modules}
                                formats={formats}
                                placeholder="Nhập nội dung content..."
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="desc" label="Mô tả">
                            <TextArea rows={2} placeholder="Nhập mô tả ngắn gọn" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="category" label={t("setup.categories")} rules={[{ required: true, message: 'Please select a category!' }]}>
                            <Select placeholder="Select a category" loading={isLoadingSetup} onChange={handleCategoryChange}>
                                {setupData?.category_list.map((category: { id: number, name: string }) => (
                                    <Option key={category.id} value={category.id}>
                                        {category.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="subcategory" label={t("setup.subcategories")} rules={[{ required: true, message: 'Please select a subcategory!' }]}>
                            <Select placeholder="Select a subcategory" loading={isLoadingSetup} disabled={!selectedCategory}>
                                {filteredSubcategories.map((subcategory: { id: number, name: string }) => (
                                    <Option key={subcategory.id} value={subcategory.id}>
                                        {subcategory.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="platform" label={t("setup.platforms")} rules={[{ required: true, message: 'Please select a platform!' }]}>
                            <Select placeholder="Chọn một nền tảng" loading={isLoadingSetup}>
                                {setupData?.platform_list.map((platform: { id: number, name: string }) => (
                                    <Option key={platform.id} value={platform.id}>
                                        {platform.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="creator" label={t("setup.creators")} rules={[{ required: true, message: 'Please select a creator!' }]}>
                            <Select placeholder="Chọn một người tạo" loading={isLoadingSetup}>
                                {setupData?.creator_list.map((creator: { id: number, user_info: { username: string, first_name: string, last_name: string } }) => (
                                    <Option key={creator.id} value={creator.id}>
                                        {`${creator.user_info.last_name} ${creator.user_info.first_name} (${creator.user_info.username})`}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="branding_channels" label="Branding Channels" rules={[{ required: true, message: 'Please select at least one branding channel!' }]}>
                            <Select mode="multiple" placeholder="Select branding channels" loading={isLoadingSetup}>
                                {setupData?.branding_channel_list.map((channel: { id: number, name: string }) => (
                                    <Option key={channel.id} value={channel.id}>
                                        {channel.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="tags" label={t("general.card")}>
                            <Select mode="tags" placeholder="Select or add tags" loading={isLoadingSetup}>
                                {setupData?.tag_list.map((tag: { id: number, name: string }) => (
                                    <Option key={tag.id} value={tag.id}>
                                        {tag.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select a status!' }]}>
                            <Select placeholder="Select status" loading={isLoadingSetup}>
                                {setupData?.status_list.map((status: { id: number, name: string }) => (
                                    <Option key={status.id} value={status.id}>
                                        {status.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.List name="urls">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item
                                        {...restField}
                                        name={[name]}
                                        rules={[
                                            { type: 'url', message: 'Enter a valid URL!' }
                                        ]}
                                    >
                                        <Input placeholder="Vui lòng chọn link" />
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(name)} rev={undefined} />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined rev={undefined} />}>
                                    Thêm mới đường link
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="images" label="Ảnh">
                            <Upload multiple listType="picture" beforeUpload={() => false}>
                                <Button icon={<UploadOutlined rev={undefined} />}>Tải ảnh</Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="videos" label="Video">
                            <Upload multiple accept="video/*" listType="picture" beforeUpload={() => false}>
                                <Button icon={<UploadOutlined rev={undefined} />}>Tải Video</Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="is_ads" label="Quảng cáo" valuePropName="unchecked">
                    <Switch onChange={handleAdsChange} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={isLoading}>
                        Đăng bài
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
