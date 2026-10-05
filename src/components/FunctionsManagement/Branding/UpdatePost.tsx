"use client";

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Upload, DatePicker, Select, Switch, notification, Space, Row, Col } from 'antd';
import { UploadOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useUpdatePostMutation, useSetUpBrandQuery, useGetPostQuery } from '@/api/Branding/apiBranding';
import { useTranslations } from 'next-intl';
import { UploadFile } from 'antd/es/upload/interface';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const { Option } = Select;
const { TextArea } = Input;

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function UpdatePost({ postId, onClose }: {postId?: number,onClose: any}) {
    const t: any = useTranslations();
    const [form] = Form.useForm();
    const [isAds, setIsAds] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
    const [filteredSubcategories, setFilteredSubcategories] = useState([]);
    const { data: setupData, isLoading: isLoadingSetup } = useSetUpBrandQuery({});
    const { data: post, isLoading: isPostLoading } = useGetPostQuery(postId!, { skip: !postId });
    const [imageList, setImageList] = useState<UploadFile[]>([]);
    const [videoList, setVideoList] = useState<UploadFile[]>([]);

    useEffect(() => {
        if (selectedCategory && setupData?.subcategory_list) {
            const filtered = setupData.subcategory_list.filter(
                (subcategory: { category: number }) => subcategory.category === selectedCategory
            );
            setFilteredSubcategories(filtered);
        }
    }, [selectedCategory, setupData]);

    useEffect(() => {
            if (post) {

                let urlsArray = [];
            
            if (post.urls && post.urls.length > 0) {
                const urlData = post.urls[0].url;

                // Check if the URL data is an array (JSON format) or a single URL (string)
                if (urlData.startsWith('[') && urlData.endsWith(']')) {
                    try {
                        urlsArray = JSON.parse(urlData.replace(/'/g, '"'));
                    } catch (error) {
                        console.error("Error parsing JSON URL data:", error);
                    }
                } else {
                    urlsArray = [urlData]; // Treat it as a single URL
                }
            }


            const channels = post.branding_channels.map((item: any) => item.id);
            const tags = post.tags.map((item: any) => item.id);
            const images = post.images.map((image: any) => ({
                uid: String(image.id),
                name: image.file.split("/").pop(),
                status: "done",
                url: image.file,
            }));
            const videos = post.videos.map((video: any) => ({
                uid: String(video.id),
                name: video.file.split("/").pop(),
                status: "done",
                url: video.file,
            }));

            form.setFieldsValue({
                ...post,
                branding_channels: channels,
                tags: tags,
                post_date: post.post_date ? dayjs(post.post_date) : null,
                urls: urlsArray,
                subcategory: post.subcategory,  // Set the subcategory value here
                platform: post.platform,  // Set the platform value here
                creator: post.creator,  // Set the creator value here

            });

            setIsAds(post.is_ads);
            setSelectedCategory(post.category);
            setImageList(images);
            setVideoList(videos);
        }
    }, [post, form]);

    const onFinish = async (values: any) => {
        // Kiểm tra nếu có nhiều hơn 1 URL và chuyển đổi thành chuỗi JSON nếu cần
        const updatedUrls = values.urls.length === 1 ? values.urls[0] : JSON.stringify(values.urls);
    
        const body: any = {
            id: postId,
            title: values.title,
            content: values.content,
            category: values.category,
            subcategory: values.subcategory,  // Đảm bảo subcategory được bao gồm
            platform: values.platform,  // Bao gồm platform
            creator: values.creator,  // Bao gồm creator
            post_date: values.post_date ? values.post_date.format('YYYY-MM-DD') : null,  // Định dạng ngày
    
            status: values.status,  // Đảm bảo status được bao gồm
            desc: values.desc,
            urls: updatedUrls,
        };
    
        const formData = new FormData();
    
        // Thêm các trường từ body vào formData
        Object.keys(body).forEach((key) => {
            // Kiểm tra giá trị không phải là null trước khi thêm vào formData
            if (body[key] !== null && body[key] !== undefined) {
                formData.append(key, body[key]);
            }
        });
    
        // Xử lý danh sách hình ảnh
        imageList.forEach((file) => {
            if (file.originFileObj) {
                formData.append('images', file.originFileObj);
            } else {
                // Giữ lại hình ảnh hiện tại nếu không có tệp mới được thêm
                formData.append('existing_images', file.uid);
            }
        });
    
        // Xử lý danh sách kênh branding
        if (Array.isArray(values.branding_channels)) {
            values.branding_channels.forEach((channel: number) => {
                formData.append('branding_channels', channel.toString());
            });
        }
    
        // Xử lý danh sách tags
        if (Array.isArray(values.tags)) {
            values.tags.forEach((tag: number) => {
                formData.append('tags', tag.toString());
            });
        }
    
        // Xử lý danh sách video
        if (videoList.length > 0) {
            videoList.forEach((file) => {
                if (file.originFileObj) {
                    formData.append('videos', file.originFileObj);
                } else {
                    // Giữ lại video hiện tại nếu không có tệp mới được thêm
                    formData.append('existing_videos', file.uid);
                }
            });
        }
    
        try {
            // Gửi yêu cầu cập nhật
            const result = await updatePost({ formData, id: postId }).unwrap();
            if (result && "error" in result) {
                notification.error({
                    message: "Cập nhật bài viết lỗi",
                    placement: "bottomRight",
                    className: "h-16",
                });
            } else {
                form.resetFields();
                onClose();
                notification.success({
                    message: "Cập nhật bài viết thành công",
                    placement: "bottomRight",
                    className: "h-16",
                });
            }
        } catch (error) {
            console.error(error);
        }
    };
    
    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
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

    const handleImageChange = ({ fileList }: { fileList: UploadFile[] }) => {
        setImageList(fileList);
    };

    const handleVideoChange = ({ fileList }: { fileList: UploadFile[] }) => {
        setVideoList([...fileList]);
    };

    // console.log("post", post)

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
                        <Form.Item name="content" label="Content" rules={[{ required: true, message: 'Please input the content!' }]}>
                            <ReactQuill modules={modules} formats={formats} placeholder="Nhập nội dung content..." />
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
                            <Select mode="multiple" allowClear showSearch optionFilterProp="children" placeholder="Select branding channels" loading={isLoadingSetup}>
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
                            <Select mode="multiple" allowClear showSearch optionFilterProp="children" placeholder="Select or add tags" loading={isLoadingSetup}>
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
                                            { type: 'url', message: 'Nhập một URL hợp lệ!' }
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
                        <Form.Item name="images" label={t("general.image")}>
                            <Upload
                                listType="picture"
                                fileList={imageList}
                                onChange={handleImageChange}
                                beforeUpload={() => false}
                            >
                                <Button icon={<UploadOutlined rev={undefined} />}>{t("general.upload")}</Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                    <Form.Item name="videos" label="Video">
                        <Upload
                            listType="text"
                            fileList={videoList}
                            onChange={handleVideoChange}
                            beforeUpload={() => false}
                            multiple={true}  // Cho phép upload nhiều file
                        >
                            <Button icon={<UploadOutlined rev={undefined} />}>{t("general.upload")}</Button>
                        </Upload>
                    </Form.Item>

                    </Col>
                </Row>

                <Form.Item name="is_ads" label="Quảng cáo" valuePropName="unchecked">
                    <Switch onChange={handleAdsChange} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={isUpdating}>
                        {postId ? 'Cập nhật bài viết' : 'Đăng bài'}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

