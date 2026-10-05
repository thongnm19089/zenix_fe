"use client";

import React, { useEffect, useState } from "react";
import { Descriptions, Avatar, Tag, Rate, Tooltip, Button, Typography } from "antd";
import { UserOutlined, TeamOutlined } from "@ant-design/icons";
import { useGetPostQuery } from "@/api/Branding/apiBranding";
import { useTranslations } from "next-intl";
import { User } from "@/types/userTypes";
import AddAndUpdateComment from "./AddAndUpdateComment";

const { Text } = Typography;

interface PostDetailProps {
  postId: number;
}

const PostDetail: React.FC<PostDetailProps> = ({ postId }) => {
  const t: any = useTranslations();
  const { data: post, refetch } = useGetPostQuery(postId);
  const [user, setUser] = useState<User | null>(null);
  const [visibleComments, setVisibleComments] = useState<number[]>([]);
  const [editingComments, setEditingComments] = useState<number[]>([]);
  const initialVisibleComments = 5; // Initial number of comments to show

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    const parsedUserData = userDataString ? JSON.parse(userDataString) : null;
    setUser(parsedUserData);
  }, []);

  const toggleCommentVisibility = (commentId: number) => {
    const newVisibleComments = visibleComments.includes(commentId)
      ? visibleComments.filter(id => id !== commentId)
      : [...visibleComments, commentId];
    setVisibleComments(newVisibleComments);
  };

  const toggleEditComment = (commentId: number) => {
    const newEditingComments = editingComments.includes(commentId)
      ? editingComments.filter(id => id !== commentId)
      : [...editingComments, commentId];
    setEditingComments(newEditingComments);
  };

  const HtmlContent = (content: any) => {
    return (
      <div dangerouslySetInnerHTML={{ __html: content }} />
    );
  };

  useEffect(() => {
    refetch();
  }, [postId, refetch]);

  if (!post) {
    return <p>Loading...</p>;
  }

  // Reverse the comments array to display the most recent comments first
  const reversedComments = [...post.comments].reverse();

  return (
    <Descriptions title={t("Post Details")} bordered>
      <Descriptions.Item label={t("Title")} span={3}>
        {post.title}
      </Descriptions.Item>
      <Descriptions.Item label={t("Content")} span={3}>
        {HtmlContent(post.content)}
      </Descriptions.Item>
      <Descriptions.Item label={t("Comment")} span={3}>
        <h3>{t("Comments")}</h3>
        {reversedComments.slice(0, visibleComments.length || initialVisibleComments).map((comment: any) => (
          <div key={comment.id} className="flex items-center space-x-2 mb-2">
            <Text type="secondary">{comment.created_by_username} {" : "}
              {new Date(comment.created_at).toLocaleString()} {" : "}
            </Text>
            <div className="flex-grow">
              {HtmlContent(comment.content)}
            </div>
            {user?.username === comment.created_by_username && (
              <Button type="link" onClick={() => toggleEditComment(comment.id)}>
                {editingComments.includes(comment.id) ? 'Hide' : 'Edit'}
              </Button>
            )}
            {editingComments.includes(comment.id) && (
              <AddAndUpdateComment
                postId={postId.toString()}
                initialComment={comment.content}
                commentId={comment.id}
                refetch={refetch}
              />
            )}
          </div>
        ))}
        {post.comments.length > initialVisibleComments && (
          <div>
            {visibleComments.length < post.comments.length ? (
              <Button onClick={() => setVisibleComments(post.comments.map((comment: { id: any; }) => comment.id))}>
                {t("Show More Comments")}
              </Button>
            ) : (
              <Button onClick={() => setVisibleComments(post.comments.slice(0, initialVisibleComments).map((comment: { id: any; }) => comment.id))}>
                {t("Show Less Comments")}
              </Button>
            )}
          </div>
        )}
        <div className="mt-4">
          <AddAndUpdateComment
            postId={postId.toString()}
            refetch={refetch}
          />
        </div>
      </Descriptions.Item>

      <Descriptions.Item label={t("Platform")} span={3}>
        <Tag color={post.platform_name.color}>{post.platform_name}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label={t("Creator")} span={3}>
        <Tag color={post.creator_info?.color || "#108ee9"}>
          {post.creator_info?.user_info?.username || "Unknown"}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label={t("Category")} span={3}>
        <Tag color="#f50">{post.category_name}</Tag>
        <Tag color="#87d068">{post.subcategory_name}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label={t("Is Ads")} span={3}>
        {post.is_ads ? <Tag color="#ff4d4f">{t("Yes")}</Tag> : <Tag color="#87d068">{t("No")}</Tag>}
      </Descriptions.Item>
      <Descriptions.Item label={t("Created By")} span={3}>
        {post.created_by_username}
      </Descriptions.Item>
      <Descriptions.Item label={t("Images")} span={3}>
        {post.images.length > 0 ? (
          post.images.map((image: any) => (
            <div key={image.id}>
              <img src={image.file} alt="Post Image" style={{ width: '100%', marginBottom: '10px' }} />
            </div>
          ))
        ) : (
          <span>{t("No Images")}</span>
        )}
      </Descriptions.Item>
      <Descriptions.Item label={t("Videos")} span={3}>
        {post.videos.length > 0 ? (
          post.videos.map((video: any) => (
            <div key={video.id}>
              <video controls style={{ width: '100%', marginBottom: '10px' }}>
                <source src={video.file} type="video/mp4" />
                {t("Your browser does not support the video tag.")}
              </video>
            </div>
          ))
        ) : (
          <span>{t("No Videos")}</span>
        )}
      </Descriptions.Item>
    </Descriptions>
  );
};

export default PostDetail;
