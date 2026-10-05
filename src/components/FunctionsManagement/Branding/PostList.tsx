"use client";

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, notification, Drawer, Tag, Popconfirm, Pagination, Spin } from "antd";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { UserOutlined, DollarOutlined, TagOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { RootState } from "@/store/store";
import { useGetPostDetailsListQuery, useDeletePostMutation, useSetUpBrandQuery } from "@/api/Branding/apiBranding";
import PostDetail from "./PostDetail";
import UpdatePost from "./UpdatePost";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import UpdatePostStatus from "./UpdatePostStatus";
import { useWindowSize } from "@/utils/responsiveSm";
import { useTranslations } from "next-intl";
import { User } from "@/types/userTypes";

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export default function PostList() {
  const t: any = useTranslations();
  const router = useRouter();
  const [width] = useWindowSize();
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const [selectedPostIdForDetail, setSelectedPostIdForDetail] = useState<number | null>(null);
  const [selectedPostIdForUpdate, setSelectedPostIdForUpdate] = useState<number | null>(null);

  const [selectedUpdatedPost, setSelectedUpdatedPost] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const { data: setupData, isLoading: isLoadingSetup } = useSetUpBrandQuery({});
  const [deletePost, { isLoading: isLoadingDelete }] = useDeletePostMutation();
  const {
    data: postList,
    isLoading: isLoadingListPost,
    isError,
    error,
    refetch,
  } = useGetPostDetailsListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

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
  const canDelete = (post: {creator_info: any; created_by_username: string | undefined;
}) => {
    console.log(post, user);
    return post.created_by_username === user?.username || post.creator_info?.user_info?.username === user?.username;
  };

  const onDelete = async (postId: number) => {
    try {
      await deletePost({ postId });
      notification.success({
        message: `Post deleted successfully!`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `Failed to delete post!`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const onViewPost = (postId: number) => {
    setSelectedPostIdForDetail(postId);
    setSelectedPostIdForUpdate(null); // Đảm bảo không hiển thị UpdatePost khi đang xem chi tiết
  };

  const onUpdatePost = (postId: number) => {
    setSelectedPostIdForUpdate(postId);
    setSelectedPostIdForDetail(null); // Đảm bảo không hiển thị PostDetail khi đang cập nhật
  };

  const onCloseDrawer = () => {
    setSelectedPostIdForDetail(null);
    setSelectedPostIdForUpdate(null);
  };

  const onUpdateStatus = (post: any) => {
    setSelectedUpdatedPost(post);
    setIsModalVisible(true); // Hiển thị modal
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedUpdatedPost(null);
  };

  if (isLoadingListPost) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <Spin size="large" />
      </div>
    );
  }
  if (error && "status" in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push("/403/");
    }
  }

  return (
    <div className={`w-screen ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"} px-6`}>
      <Row wrap={false} style={{ overflowX: "auto" }} className="mt-4">
        {setupData?.status_list.map((status: { id: number; name: string; color: string }) => (
          <Col key={status.id} flex="0 0 320px" style={{ paddingRight: "16px" }}>
            <Card
              title={
                <Tag color={status.color} className="w-full text-center">
                  {status.name}
                </Tag>
              }
            >
              {postList?.results
                .filter((post: any) => post.status === status.id)
                .map((post: any) => (
                  <Card
                    className="mb-4"
                    key={post.id}
                    cover={
                      <div onClick={() => onViewPost(post.id)} style={{ cursor: "pointer" }}>
                        {post.images?.[0]?.file ? (
                          <img
                            alt={post.content}
                            src={post.images[0].file}
                            style={{ height: "150px", objectFit: "cover" }}
                          />
                        ) : null}
                      </div>
                    }
                    actions={[
                      <div className="p-2">
                        <Button type="dashed" className="border-blue-600 text-blue-600" onClick={() => onViewPost(post.id)}>
                          View
                        </Button>

                        <Button type="dashed" className="border-green-600 text-green-600" onClick={() => onUpdateStatus(post)}>
                          Update Stt
                        </Button>

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

                        <div className="mt-2">
                          <Button type="primary" className="w-full" onClick={() => onUpdatePost(post.id)}>
                            Update Bài viết
                          </Button>
                        </div>
                      </div>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div>
                          {truncateText(post.title, 100)}
                          <div className="mt-2">
                            <UserOutlined style={{ marginRight: "8px" }} rev={undefined} />
                            <span>
                              created by:
                              {post.created_by_username || "Unknown"}
                            </span>
                          </div>
                          <div className="mt-2">
                            <span style={{ display: 'block' }}>
                              created:
                            </span>
                            <span>
                              <ClockCircleOutlined style={{ marginRight: "8px" }} rev={undefined} />
                              {new Date(post.created_at).toLocaleString()}
                            </span>
                          </div>
                          {post.post_date && (
                            <div className="mt-2">
                              <span style={{ display: 'block' }}>
                                Ngày đăng:
                              </span>
                              <span>
                                <ClockCircleOutlined style={{ marginRight: "8px" }} rev={undefined} />
                                {new Date(post.post_date).toLocaleDateString()} {/* Chỉ hiển thị ngày */}
                              </span>
                            </div>
                          )}
                          <div className="mt-2">
                            <TagOutlined style={{ marginRight: "8px" }} rev={undefined} />
                            <Tag color={post.creator_info?.color || "#108ee9"}>
                              {post.creator_info?.user_info?.username || "Unknown"}
                            </Tag>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Tag color="#108ee9">{post.platform_name}</Tag>
                            <Tag color="#f50">{post.category_name}</Tag>
                            <Tag color="#87d068">{post.subcategory_name}</Tag>
                            {post.is_ads && <Tag color="#ff4d4f">Ads</Tag>}
                          </div>
                          {post.branding_channels.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span>Branding Channels: </span>
                              {post.branding_channels.map((channel: any) => (
                                <Tag color={channel?.color} key={channel?.id}>
                                  {channel?.name}
                                </Tag>
                              ))}
                            </div>
                          )}
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              <TagOutlined style={{ marginRight: "8px" }} rev={undefined} />
                              {post.tags.map((tag: any) => (
                                <Tag color={tag?.color} key={tag?.id}>
                                  {tag.name}
                                </Tag>
                              ))}
                            </div>
                          )}
                          {post.total_cost > 0 && (
                            <div className="mt-2">
                              <DollarOutlined style={{ marginRight: "8px" }} rev={undefined} />
                              <span>Total Cost: {post.total_cost} VND</span>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </Card>
                ))}
            </Card>
          </Col>
        ))}
      </Row>

      <Pagination
        className="m-4 text-right"
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={postList?.total || 0}
        showSizeChanger
        onChange={handleTableChange}
        pageSizeOptions={["10", "20", "50", "100", "200"]}
      />

      <Drawer
        title="Post Details"
        width={width > 768 ? "65%" : "100%"}
        open={!!selectedPostIdForDetail}
        onClose={onCloseDrawer}
        destroyOnClose
      >
        {selectedPostIdForDetail && <PostDetail postId={selectedPostIdForDetail} />}
      </Drawer>

      <Drawer
        title="Post Update"
        width={width > 768 ? "65%" : "100%"}
        open={!!selectedPostIdForUpdate}
        onClose={onCloseDrawer}
        destroyOnClose
      >
        {selectedPostIdForUpdate && <UpdatePost postId={selectedPostIdForUpdate} onClose={onCloseDrawer} />}
      </Drawer>

      <UpdatePostStatus
        visible={isModalVisible}
        onClose={handleModalClose}
        post={selectedUpdatedPost}
        refetch={refetch}
      />
    </div>
  );
}
