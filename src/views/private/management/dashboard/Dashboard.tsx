"use client";

import { useGetHomeUserDashboardQuery } from "@/api/SetUp/apiAccount";
import {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useGetMessagesQuery,
} from "@/api/Chat/apiAppChat";
import ClickOutside from "@/components/ClickOutside";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import { Spin } from "antd";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import EmojiPicker from "emoji-picker-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next-intl/link";
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

interface Group {
  id: string;
  members: string[];
}

const Dashboard = () => {
  const { data: dashboard, isLoading } = useGetHomeUserDashboardQuery({});
  const { data: groupData, refetch: refetchGroups } = useGetGroupsQuery({});
  const [createGroup] = useCreateGroupMutation();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const { data: GetMessages, isLoading: isLoadingMessages } =
    useGetMessagesQuery(selectedGroupId, {
      skip: !selectedGroupId,
    });
  const t: any = useTranslations();
  const [visible, setVisible] = useState(false);
  const [userObject, setUserObject] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Get data User
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUserObject(JSON.parse(userData));
    }
  }, []);

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
    }
  }, [GetMessages]);

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [message, setMessage] = useState("");
  const [groupId, setGroupId] = useState("");
  const [chatSocket, setChatSocket] = useState<WebSocket | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      }
    } else {
      console.error("Chat socket is not open");
    }
  };

  const createGroups = async () => {
    const newGroup = {
      name: "New Chat Group " + userObject.username,
      members: [userObject.username],
      status_message: false,
      avt_member: userObject.user_profile.image,
    };

    try {
      const response = await createGroup(newGroup).unwrap();
      if (response?.success) {
        console.log("New group created:", response?.data);
        setGroupId(response.data.id);
        console.log(response.data.id);
        setVisible(true);
        refetchGroups();
      } else {
        console.error("Failed to create group");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handldeOnChat = async () => {
    if (userObject && groupData) {
      const isUserInGroup = groupData.some((group: Group) =>
        group.members.includes(userObject.username)
      );

      if (isUserInGroup) {
        const userGroup = groupData.find((group: Group) =>
          group.members.includes(userObject.username)
        );
        if (userGroup) {
          setGroupId(userGroup.id);
          setSelectedGroupId(userGroup.id);
          setVisible(true);
        }
      } else {
        createGroups();
      }
    }
  };

  const handleCloseChat = () => {
    setVisible(false);
  };

  const isImageFile = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase();
    return extension === "jpg" || extension === "jpeg" || extension === "png";
  };

  const clearFile = () => {
    setFile(null);
    setFileName("");
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

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

  const onEmojiClick = (emojiObject: any) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  return (
    <>
      <div className="uppercase text-[32px] max-w-90 font-semibold italic mx-auto py-15">
        {t("admin.useZenix")}
      </div>

      <div className="grid lg:grid-cols-4 sm:grid-cols-3 gap-3 lg:px-15 px-5">
        {api.map((items, idx) => (
          <Link key={items.key} href={items.href}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: (idx + 2) / 5, duration: 0.5 }}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="rounded-xl min-h-[215px] transition duration-300 hover:scale-105 shadow-2xl bg-gradient-to-br from-orange-400 to-orange-500 text-white from-10% hover:bg-gradient-to-b hover:from-orange-300 hover:to-orange-500 via-orange-500 via-30% hover:text-gray-100">
                <div className="flex flex-col text-center items-center justify-center">
                  <div>
                    <Image
                      className="mx-auto my-5"
                      src={items.image}
                      width={100}
                      height={100}
                      alt=""
                    />
                  </div>
                  <div className="flex flex-col md:text-lg text-base mb-5">
                    <strong>{items.name}</strong>
                  </div>
                </div>
                <div></div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
      <div
        className="flex justify-end mt-10 mr-8 cursor-pointer"
        onClick={() => {
          handldeOnChat();
        }}
      >
        <div className="relative flex h-20 items-center justify-between px-6 py-3 text-orange-700 bg-orange-200 rounded-full shadow-md hover:bg-orange-300 focus:outline-none">
          <span className="ml-4 text-[20px] font-semibold italic">
            BẠN CÓ CÂU HỎI?
          </span>
          <span className="flex items-center justify-center w-20 h-20 bg-orange-600 rounded-full transform translate-x-1/2">
            <Image
              src={"/images/Home/helpdesk.png"}
              width={60}
              height={60}
              alt="helpdesk"
            />
          </span>
        </div>
      </div>

      {visible && (
        <div className="fixed bottom-0 right-4 w-full md:w-1/3 h-2/3 bg-white shadow-2xl rounded-t-lg flex flex-col">
          <div className="flex justify-between items-center p-4 bg-orange-600 text-white rounded-t-lg">
            <div className="flex items-center">
              <Image
                className="rounded-full"
                src="/images/avatar.png"
                width={40}
                height={40}
                alt=""
              />
              <span className="ml-4">Hỗ trợ</span>
            </div>
            <button
              onClick={handleCloseChat}
              className="rounded-full hover:bg-gray-200"
            >
              <Image src="/images/cross.png" width={24} height={24} alt="" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {isLoadingMessages ? (
              <LoadingSpinner />
            ) : (
              <div className="flex flex-col space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === userObject?.username ? "justify-end" : ""
                      }`}
                  >
                    {msg.sender !== userObject?.username && (
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
                      className={`ml-2 mr-2 p-2 rounded-lg ${msg.sender === userObject?.username
                        ? "bg-orange-600 text-white self-start"
                        : "bg-gray-200 self-end text-right"
                        }`}
                      style={{ maxWidth: "60%" }}
                    >
                      {msg.message}

                      <div
                        className={`${msg.sender === userObject?.username
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
                            className="font-medium underline hover:bg-orange-300"
                            href={msg.file}
                            download={msg.filename}
                          >
                            Download {msg.filename}
                          </a>
                        ))}
                    </div>
                    {msg.sender === userObject?.username && (
                      <div className="flex-shrink-0">
                        <Image
                          className="rounded-full"
                          src={
                            userObject.user_profile.image ||
                            "/images/avatar.png"
                          }
                          width={40}
                          height={40}
                          alt=""
                          style={{ width: "40px", height: "40px" }}
                        />
                      </div>
                    )}
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
          <div className="p-4 bg-gray-100 rounded-b-lg flex items-center">
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
        </div>
      )}
    </>
  );
};

const api = [
  {
    key: 1,
    name: "Quản trị công ty",
    image: "/images/Home/hardware.png",
    href: "business/admin/guide/admin",
  },
  {
    key: 2,
    name: "Quản lý khách hàng",
    image: "/images/Home/technology.png",
    href: "business/admin/guide/crm",
  },
  {
    key: 3,
    name: "Quản trị nhân sự",
    image: "/images/Home/qualityPersonnel.png",
    href: "business/admin/guide/hr",
  },
  {
    key: 4,
    name: " Kế toán nội bộ",
    image: "/images/Home/productSass.png",
    href: "business/admin/guide/finance",
  },
  {
    key: 5,
    name: "Quản trị kho vận",
    image: "/images/Home/productSass.png",
    href: "business/admin/guide/inventory",
  },
  {
    key: 6,
    name: "Quản trị cung ứng",
    image: "/images/Home/productSass.png",
    href: "usiness/admin/guide/procurement",
  },
  {
    key: 7,
    name: "Quản lý công việc",
    image: "/images/Home/productSass.png",
    href: "business/admin/guide/task",
  },
];

export default Dashboard;
