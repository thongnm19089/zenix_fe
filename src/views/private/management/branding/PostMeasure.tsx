"use client";

import React, { useState, useEffect } from "react";
import { List, Button, Pagination, notification, Input, Drawer, Tag, Popconfirm, Spin } from "antd";
import { useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { IoRefresh } from "react-icons/io5";
import { UserOutlined, DollarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { RootState } from "@/store/store";
import { useGetPostDetailsListQuery, useDeletePostMutation, useSetUpBrandQuery } from "@/api/Branding/apiBranding";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useTranslations } from "next-intl";
import PostDetail from "@/components/FunctionsManagement/Branding/PostDetail";
import AddAndUpdateMeasure from "@/components/FunctionsManagement/Branding/AddAndUpdateMeasure";
import AddAndUpdateCost from "@/components/FunctionsManagement/Branding/AddAndUpdateCost";
import { useWindowSize } from "@/utils/responsiveSm";
import { User } from "@/types/userTypes";
import AddAndUpdateComment from "@/components/FunctionsManagement/Branding/AddAndUpdateComment";
import UpdatePostStatus from "@/components/FunctionsManagement/Branding/UpdatePostStatus";
import dayjs from "dayjs";
import Filter from "@/components/Filter/Filter";

interface MetricType {
  total: number;
  name: string;
}

const initialStateFilter = {
  status: [],           // Bộ lọc theo trạng thái
  category: [],         // Bộ lọc theo danh mục
  brandingChannels: [], // Bộ lọc theo branding channels
  platform: [],         // Bộ lọc theo nền tảng
  creator: [],          // Bộ lọc theo người tạo
};

const PostMeasure = () => {
  const t: any = useTranslations();
  const router = useRouter();
  const params = useParams();
  const [width] = useWindowSize();
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const [locale, setLocale] = useState(params?.locale === "vi" ? "vi-VN" : "en-US");
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [selectedPostForStatusUpdate, setSelectedPostForStatusUpdate] = useState(null);
  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [filterObject, setFilterObject] = useState(initialStateFilter);

  const { data: setupBrand } = useSetUpBrandQuery({});

  const {
    data: postList,
    isLoading: isLoadingListPost,
    isError,
    refetch,
    error,
  } = useGetPostDetailsListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    status: filterObject.status,
    category: filterObject.category,
    brandingChannels: filterObject.brandingChannels,
    platform: filterObject.platform,
    creator: filterObject.creator,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
  });
  const [deletePost, { isLoading: isLoadingDelete }] = useDeletePostMutation();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(tempSearchTerm);
      setPagination({ ...pagination, current: 1 });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [tempSearchTerm]);

  const onSearchChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setTempSearchTerm(e.target.value);
  };

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({
      current: page,
      pageSize,
    });
  };
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    const parsedUserData = userDataString ? JSON.parse(userDataString) : null;
    setUser(parsedUserData);
  }, []);

  // Kiểm tra nếu người dùng hiện tại là người tạo bài viết hoặc creator của bài viết
  const canDelete = (post: {
    creator_info: any; created_by_username: string | undefined;
  }) => {
    return post.created_by_username === user?.username || post.creator_info?.user_info?.username === user?.username;
  };

  const handleRefresh = () => {
    setTempSearchTerm("");
    setSearchTerm("");
    refetch();
  };

  const onDelete = async (postId: number) => {
    try {
      await deletePost({ postId });
      notification.success({
        message: `${t("noficationDelete.postSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.postError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const onViewPost = (postId: number) => {
    setSelectedPostId(postId);
  };

  const onCloseDrawer = () => {
    setSelectedPostId(null);
  };

  const handleStatusUpdateClick = (post: any) => {
    setSelectedPostForStatusUpdate(post);
    setIsStatusModalVisible(true);
  };

  const closeStatusModal = () => {
    setIsStatusModalVisible(false);
    setSelectedPostForStatusUpdate(null);
  };

  if (error && "status" in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push("/403/");
    }
  }
  if (isLoadingListPost) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  const dataArrQuery = [
    {
      id: 1,
      placeholder: `${t("setup.statuses")}`,
      data: setupBrand?.status_list,
      displayProps: "name",
      key: "status",
    },
    {
      id: 2,
      placeholder: `${t("setup.categories")}`,
      data: setupBrand?.category_list,
      displayProps: "name",
      key: "category",
    },
    {
      id: 3,
      placeholder: `${t("setup.creators")}`,
      data: setupBrand?.creator_list,
      displayProps: "user_info?.first_name",
      key: "creator",
      user: "user"
    },
    {
      id: 4,
      placeholder: `${t("setup.platforms")}`,
      data: setupBrand?.platform_list,
      displayProps: "name",
      key: "platform",
    },
    {
      id: 5,
      placeholder: `${t("setup.brandingChannels")}`,
      data: setupBrand?.branding_channel_list,
      displayProps: "name",
      key: "brandingChannels",
    },
  ];
  return (
    <div className={`w-screen ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"} px-6`}>
      <div className="flex justify-between items-center flex-1 pt-2 max-md:flex-col max-md:gap-3">
        <Input placeholder="Search posts..." onChange={onSearchChange} />
        <div className="flex justify-end text-right w-full gap-2">
          <Filter
            dataQuery={dataArrQuery}
            objectFilter={filterObject}
            setObjectFilter={setFilterObject}
            setDateRange={setDateRange}
            isLoading={isLoadingListPost}
            initialState={initialStateFilter}
            setPagination={setPagination}
            pagination={pagination}
            dateRange={dateRange} />

          <Button
            type="dashed"
            icon={<IoRefresh className="text-blue-500" />}
            className="flex items-center justify-center border-blue-500 text-blue-500"
            onClick={handleRefresh}
          >
            Làm mới trang
          </Button>
        </div>
      </div>

      <List
        itemLayout={width > 768 ? "horizontal" : "vertical"}
        dataSource={postList?.results || []}
        renderItem={(post: any, index) => (
          <List.Item
            actions={[
              <div className="flex">
                <AddAndUpdateMeasure post={post} refetch={refetch} />,
                <AddAndUpdateCost post={post} refetch={refetch} />,
                <AddAndUpdateComment postId={post.id.toString()} refetch={refetch} useModal={true} />,
                <Button type="link" onClick={() => onViewPost(post.id)}>View</Button>,
                {canDelete(post) && (
                  <Popconfirm
                    title="Bạn có chắc muốn xóa bài viết này không?"
                    onConfirm={() => onDelete(post.id)}
                    okText={t("general.confirm")}
                    cancelText={t("general.cancel")}
                    okButtonProps={{ loading: isLoadingDelete }}
                  >
                    <Button type="dashed" danger>
                      Delete
                    </Button>
                  </Popconfirm>
                )}
              </div>
            ]}
          >
            <List.Item.Meta
              title={
                <span onClick={() => onViewPost(post.id)}>
                  {`${index + 1 + (pagination.current - 1) * pagination.pageSize}. ${post.title}`}
                </span>
              }
              description={
                <>
                  <div className="flex">
                    {post.post_date && (
                      <div className="mt-2">
                        <span style={{ display: 'block' }}>
                          Ngày đăng: <ClockCircleOutlined style={{ marginRight: "8px" }} rev={undefined} />
                          {new Date(post.post_date).toLocaleDateString()} {/* Chỉ hiển thị ngày */}
                        </span>
                      </div>
                    )}
                    <div className="mx-2 mt-2">
                      <span>
                        <Tag color={post.creator_info?.color || "#108ee9"}>
                          {post.creator_info?.user_info?.username || "Unknown"}
                        </Tag>
                        {post.platform_name && (
                          <Tag color="#108ee9">{post.platform_name}</Tag>
                        )}
                        {/* Make the status tag clickable to open the UpdatePostStatus modal */}
                        <Tag color={post.status_info?.color || "#108ee9"} onClick={() => handleStatusUpdateClick(post)} style={{ cursor: 'pointer' }}>
                          {post.status_info?.name || "Unknown"}
                        </Tag>
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <UserOutlined style={{ marginRight: '8px' }} rev={undefined} />
                    <span>created by: {post.created_by_username || 'Unknown'} {" "}
                      <ClockCircleOutlined style={{ marginRight: "8px" }} rev={undefined} />
                      {new Date(post.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    {post.branding_channels?.map((channel: any) => (
                      <Tag color={channel.color} key={channel.id}>
                        {channel.name}
                      </Tag>
                    ))}
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    {post.tags?.map((tag: any) => (
                      <Tag color={tag.color} key={tag.id}>
                        {tag.name}
                      </Tag>
                    ))}
                  </div>
                  {post.is_ads && <Tag color="#ff4d4f">Ads</Tag>}
                  {post.total_cost > 0 && (
                    <div className="mt-2">
                      <DollarOutlined style={{ marginRight: '8px' }} rev={undefined} />
                      <span>Total Cost: {new Intl.NumberFormat(locale).format(post.total_cost)} VND</span>
                    </div>
                  )}
                  {/* Hiển thị metrics dựa trên locale */}
                  <div style={{ marginTop: '10px' }}>
                    {Object.entries(
                      post.metrics.reduce((acc: Record<string, MetricType>, metric: any) => {
                        const { metric_type, value, metric_type_name } = metric;
                        if (!acc[metric_type]) {
                          acc[metric_type] = { total: 0, name: metric_type_name };
                        }
                        acc[metric_type].total += value;
                        return acc;
                      }, {} as Record<string, MetricType>)
                    ).map(([metricType, metric]) => {
                      const typedMetric = metric as MetricType; // Type assertion here
                      return typedMetric.name !== undefined && typedMetric.total !== undefined ? (
                        <div key={metricType}>
                          <Tag color={locale === 'vi-VN' ? 'green' : 'blue'}>{typedMetric.name}</Tag>
                          <span>{`: ${new Intl.NumberFormat(locale).format(typedMetric.total)}`}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </>
              }
            />
          </List.Item>
        )
        }
      />

      < Pagination
        className="mt-4 text-right"
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={postList?.total || 0}
        showSizeChanger
        onChange={handleTableChange}
        pageSizeOptions={["10", "20", "50", "100", "200"]}
      />

      <Drawer
        title="Post Details"
        width={width > 768 ? '65%' : '100%'}
        open={!!selectedPostId}
        onClose={onCloseDrawer}
        destroyOnClose
      >
        {selectedPostId && <PostDetail postId={selectedPostId} />}
      </Drawer>

      {/* UpdatePostStatus Modal */}
      {selectedPostForStatusUpdate && (
        <UpdatePostStatus
          visible={isStatusModalVisible}
          onClose={closeStatusModal}
          post={selectedPostForStatusUpdate}
          refetch={refetch}
        />
      )}

    </div >
  );
};

export default PostMeasure;
