"use client";

import {
  useGetGroupsQuery,
  useAdminJoinGroupMutation,
  useGetMessagesQuery,
} from "@/api/Chat/apiAppChat";
import ClickOutside from "@/components/ClickOutside";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import EmojiPicker from "emoji-picker-react";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";

interface MessageType {
  sender: string;
  message: string;
  file?: string;
  filename?: string;
  filetype?: string;
  timestamp: string;
}

interface GroupItem {
  id: string;
  avt_member: string;
  members: string[];
  status_message: boolean;
  last_message: string;
  last_message_time: string;
}

const CustomerCare = () => {
  const [userObject, setUserObject] = useState<any>(null);
  const { data: groupData, refetch: refetchGroups } = useGetGroupsQuery({});
  const [adminJoinGroup] = useAdminJoinGroupMutation();
  const [itemData, setItemData] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState("messages");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUserObject(JSON.parse(userData));
    }
  }, []);

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [message, setMessage] = useState("");
  const [groupId, setGroupId] = useState("");
  const [chatSocket, setChatSocket] = useState<WebSocket | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { data: GetMessages } = useGetMessagesQuery(groupId, {
    skip: !groupId,
  });

  useEffect(() => {
    if (GetMessages) {
      const formattedMessages = GetMessages.map((msg: any) => ({
        sender: msg.sender,
        message: msg.content,
        file: msg.file_url,
        filename: msg.file_url ? msg.file_url.split("/").pop() : undefined,
        filetype: msg.file_url ? msg.file_url.split(".").pop() : undefined,
        timestamp: msg.timestamp,
      }));
      setMessages(formattedMessages);
      setIsLoading(false);
    }
  }, [GetMessages]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (groupId) {
      const webSocketURL = `${process.env.NEXT_PUBLIC_API_WSK}/ws/chat/${groupId}/`;

      console.log("WebSocket URL:", webSocketURL);

      const socket = new WebSocket(webSocketURL);

      socket.onmessage = function (e) {
        const data = JSON.parse(e.data);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: data.sender,
            message: data.message,
            file: data.file,
            filename: data.filename,
            filetype: data.filetype,
            timestamp: data.timestamp,
          },
        ]);
      };

      socket.onopen = () => {
        console.log("WebSocket connection opened!");
      };

      socket.onclose = () => {
        console.error("Chat socket closed unexpectedly");
      };

      socket.onerror = (e) => {
        console.error("WebSocket error:", e);
      };

      setChatSocket(socket);

      return () => {
        socket.close();
      };
    }
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({});
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() && !file) {
      console.log("Message is empty and no file selected");
      return;
    }
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
      const currentTimestamp = new Date().toISOString();
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64File = reader.result as string;
          chatSocket.send(
            JSON.stringify({
              message: message,
              file: base64File,
              filename: file.name,
              filetype: file.type,
              sender: userObject.username,
              timestamp: currentTimestamp,
            })
          );
          setMessage("");
          setFile(null);
          setFileName("");
          refetchGroups();
        };
        reader.readAsDataURL(file);
      } else {
        chatSocket.send(
          JSON.stringify({
            message: message,
            file: "",
            filename: "",
            filetype: "",
            sender: userObject.username,
            timestamp: currentTimestamp,
          })
        );
        setMessage("");
        refetchGroups();
      }
    } else {
      console.error("Chat socket is not open");
    }
  };

  const isImageFile = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase();
    return extension === "jpg" || extension === "jpeg" || extension === "png";
  };

  const clearFile = () => {
    setFile(null);
    setFileName("");
  };

  const updateGroup = async (item: any) => {
    const newData = {
      name: userObject.last_name,
      avt_member: item.avt_member,
      members: [item?.members[0], userObject.username],
      status_message: true,
    };

    try {
      const response = await adminJoinGroup({
        id: item.id,
        data: newData,
      }).unwrap();
      if (response?.success) {
        console.log("update success", response.data);
        refetchGroups();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleItemClick = async (item: GroupItem) => {
    if (item && item.id) {
      setIsLoading(true);
      setGroupId(item.id);
      setItemData(item);
      if (item.status_message === false) {
        await updateGroup(item);
      }
    } else {
      console.error("Item data doesn't have a value", item);
    }
  };

  const pendingMessagesCount =
    groupData?.filter((item: GroupItem) => item.status_message === false)
      .length || 0;

  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.extend(isSameOrBefore);

  const formatTimes = (timeData: string) => {
    const messageTime = dayjs(timeData).tz("Asia/Ho_Chi_Minh");
    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    const isSameWeek = messageTime.isSame(now, "week");
    const isSameDay = messageTime.isSame(now, "day");
    let formattedTime;

    if (isSameWeek) {
      if (isSameDay) {
        formattedTime = messageTime.format("HH:mm");
      } else {
        formattedTime = messageTime.format("DD/MM HH:mm");
      }
    } else {
      formattedTime = messageTime.format("DD/MM HH:mm");
    }

    return formattedTime;
  };

  const truncateMessage = (message: string, maxLength: number) => {
    if (message.length > maxLength) {
      return message.substring(0, maxLength) + "...";
    }
    return message;
  };

  const filterGroupItems = (items: GroupItem[]) => {
    const trimmedQuery = searchQuery.toLowerCase().replace(/\s+/g, "");
    return items.filter((item) =>
      item.members.some((member) =>
        member.toLowerCase().replace(/\s+/g, "").includes(trimmedQuery)
      )
    );
  };

  const onEmojiClick = (emojiObject: any) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 h-full overflow-auto bg-white border-r border-gray-300 p-2">
        <input
          type="text"
          placeholder="Tìm kiếm"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.trim())}
        />
        <div className="flex mb-4">
          <button
            className={`flex-1 p-2 rounded ${
              currentTab === "messages"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setCurrentTab("messages")}
          >
            Tin nhắn
          </button>
          <button
            className={`relative flex-1 p-2 rounded ${
              currentTab === "pendingMessages"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setCurrentTab("pendingMessages")}
          >
            Tin nhắn chờ
            {pendingMessagesCount > 0 && (
              <span className="absolute top-0 right-0 mt-1 mr-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {pendingMessagesCount}
              </span>
            )}
          </button>
        </div>
        {groupData &&
          filterGroupItems(
            groupData.filter((item: GroupItem) =>
              currentTab === "messages"
                ? item.status_message === true
                : item.status_message === false
            )
          ).map((item: GroupItem, index: number) => (
            <div
              key={index}
              className="flex items-center mb-4 cursor-pointer bg-gray-100 rounded hover:bg-gray-300 h-24"
              onClick={() => handleItemClick(item)}
            >
              <Image
                src={item.avt_member || "/images/avatar.png"}
                alt=""
                width={50}
                height={50}
                className="rounded-full ml-5"
                style={{ width: "40px", height: "40px" }}
              />

              <div className="ml-5 w-full">
                <div className="flex flex-wrap items-center mb-2">
                  <div className="font-semibold mr-2 max-w-full truncate break-all">
                    {item.members[0]}
                  </div>
                  <div className="bg-blue-200 p-1 rounded  inline-block">
                    {item.members[1] || "Tin nhắn chờ..."}
                  </div>
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {truncateMessage(item.last_message || "", 30)}
                  {" -"}
                  {formatTimes(item.last_message_time) || ""}
                </div>
              </div>
            </div>
          ))}
      </div>
      <div className="w-3/4 flex flex-col">
        <div className="p-4 bg-white border-b border-gray-300 h-19">
          {itemData && (
            <div className="flex flex-row">
              <Image
                src={itemData?.avt_member || "/images/avatar.png"}
                alt=""
                width={50}
                height={50}
                className="rounded-full ml-5"
                style={{ width: "40px", height: "40px" }}
              />
              <div className="ml-4 font-semibold">
                {itemData?.members[0] || ""}
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 p-4 bg-gray-100 overflow-y-auto">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="flex flex-col space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    (itemData?.members[1] === userObject?.username &&
                      msg.sender === userObject?.username) ||
                    (itemData?.members[1] !== userObject?.username &&
                      msg.sender === itemData?.members[1])
                      ? "justify-end"
                      : ""
                  }`}
                >
                  {msg.sender !== userObject?.username &&
                    msg.sender !== itemData?.members[1] && (
                      <div className="flex-shrink-0">
                        <Image
                          className="rounded-full"
                          src="/images/avatar.png"
                          width={40}
                          height={40}
                          alt=""
                          style={{ width: "40px", height: "40px" }}
                        />
                      </div>
                    )}
                  <div
                    className={`ml-4 mr-4 p-2 rounded-lg ${
                      (itemData?.members[1] === userObject?.username &&
                        msg.sender === userObject?.username) ||
                      (itemData?.members[1] !== userObject?.username &&
                        msg.sender === itemData?.members[1])
                        ? "bg-blue-600 text-white self-start"
                        : "bg-gray-200 self-end text-right"
                    }`}
                    style={{ maxWidth: "60%" }}
                  >
                    {msg.message}
                    <div
                      className={`${
                        (itemData?.members[1] === userObject?.username &&
                          msg.sender === userObject?.username) ||
                        (itemData?.members[1] !== userObject?.username &&
                          msg.sender === itemData?.members[1])
                          ? "text-white mt-1"
                          : "text-black mt-1"
                      } text-xs`}
                    >
                      {formatTimes(msg.timestamp)}
                    </div>
                    {msg.file &&
                      (isImageFile(msg.filename || "") ? (
                        <img
                          src={msg.file}
                          alt={msg.filename}
                          style={{ maxWidth: "200px" }}
                        />
                      ) : (
                        <a
                          className="font-medium underline hover:bg-blue-300"
                          href={msg.file}
                          download={msg.filename}
                        >
                          Download {msg.filename}
                        </a>
                      ))}
                  </div>
                  {(itemData?.members[1] === userObject?.username &&
                    msg.sender === userObject?.username) ||
                  (itemData?.members[1] !== userObject?.username &&
                    msg.sender === itemData?.members[1]) ? (
                    <div className="flex-shrink-0">
                      <Image
                        className="rounded-full"
                        src={
                          userObject.user_profile.image || "/images/avatar.png"
                        }
                        width={40}
                        height={40}
                        alt=""
                        style={{ width: "40px", height: "40px" }}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {fileName && (
          <div className="pl-4 pt-4 bg-gray-100 rounded-b-lg flex items-center">
            <span className="text-gray-700">{fileName}</span>
            <button
              className="ml-2 p-2 rounded-full hover:bg-gray-200"
              onClick={clearFile}
            >
              <Image
                src="/images/cross.png"
                width={10}
                height={10}
                alt="remove file"
              />
            </button>
          </div>
        )}

        {showEmojiPicker && (
          <ClickOutside onClick={() => setShowEmojiPicker(false)}>
            <div className="absolute bottom-18">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          </ClickOutside>
        )}

        {itemData?.members[1] === userObject?.username && (
          <div className="p-4 bg-white border-t border-gray-300 flex items-center">
            <button
              className="ml-2 p-2 rounded-full hover:bg-gray-200"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Image
                src="/images/happiness.png"
                width={24}
                height={24}
                alt="emoji"
              />
            </button>
            <input
              type="text"
              placeholder="Tin Nhắn"
              className="flex-1 p-2 border rounded-lg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <div className="relative ml-2 cursor-pointer">
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files ? e.target.files[0] : null;
                  setFile(file);
                  setFileName(file ? file.name : "");
                }}
                onKeyUp={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="w-6 h-6">
                <Image
                  src="/images/attach-file.png"
                  width={24}
                  height={24}
                  alt="Attach file"
                />
              </div>
            </div>
            <button
              className="ml-2 p-2 rounded-full hover:bg-gray-200"
              onClick={sendMessage}
            >
              <Image
                src="/images/send-message.png"
                width={24}
                height={24}
                alt="send message"
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerCare;
