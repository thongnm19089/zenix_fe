"use client";

import CopyItem from "./CustomBoard/CopyItem";
import { useDeleteBoardMutation, useGetBoardListQuery, useLeaveBoardMutation , useArchiveBoardMutation,useArchiveTrueBoardMutation } from "@/api/Task/apiTask";
import AddAndUpdateBoard from "@/components/FunctionsManagement/Task/Task-archive/AddAndUpdateBoard";
import AddBoardUsers from "@/components/FunctionsManagement/Task/Task-archive/AddBoardUsers";
import { IBoard } from "@/types/taskTypes";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Avatar, Button, Dropdown, List, Popconfirm, Tooltip, notification, Spin } from "antd";
import { motion } from "framer-motion";
import jwt_decode from "jwt-decode";
import { useTranslations } from "next-intl";
import Link from "next-intl/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AiOutlineUser, AiOutlineUsergroupAdd } from "react-icons/ai";
import { FiLogOut, FiMoreHorizontal, FiTrash2 } from "react-icons/fi";
import { MdLockOutline } from "react-icons/md";

const TaskManagement = () => {
  const t: any = useTranslations();
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null | undefined>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [leaveBoard, { isLoading: isLoadingLeave }] = useLeaveBoardMutation();

  useEffect(() => {
    if (typeof document !== "undefined") {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];
      setAccessToken(token);

      // Decode the token to get userId
      if (token) {
        try {
          const decodedToken: { user_id: string } = jwt_decode(token);
          setUserId(decodedToken.user_id);
        } catch (e) {
          console.error("Decoding accessToken failed", e);
        }
      }
    }
  }, []);

  const { data: boardList, isLoading, error } = useGetBoardListQuery({});

  // Redirect to custom 403 page if there's a 403 error
  if (error && "status" in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push("/403/");
    }
  }

  const [deleteBoard, { isLoading: isLoadingDelete }] = useDeleteBoardMutation();
  const [archiveBoard, { isLoading: isLoadingArchive }] = useArchiveBoardMutation();
  const [archiveTrueBoard, { isLoading: isLoadingArchiveTrue }] = useArchiveTrueBoardMutation();

  const preventNavigation = (e: { stopPropagation: () => void }, callback?: () => void) => {
    e.stopPropagation();
    setActiveDropdown(null);
    if (callback) callback();
  };

  const handleCardClick = (slug: string) => {
    router.push(`/business/task/${slug}`);
  };
  const handleCardArchiveClick = (slug: string) => {
    router.push(`/business/task/task-archive/${slug}`);
  };
  const getDropdownUser = (board: IBoard) => {
    const items = [
      {
        key: "1",
        label: (
          <div onClick={(e) => preventNavigation(e)}>
            <AddBoardUsers board={board} />
          </div>
        ),
      },
      {
        key: "2",
        label: (
          <div onClick={(e) => preventNavigation(e)}>
            <CopyItem type="board" itemId={board.id} name={board.name} />
          </div>
        ),
      },
      {
        key: "3",
        label: (
          <div onClick={(e) => preventNavigation(e)}>
            <AddAndUpdateBoard
              edit={true}
              title={t("noficationAddAndUpdate.editBoardTitle")}
              titleLabel={t("noficationAddAndUpdate.editBoardTitle")}
              board={board}
            />
          </div>
        ),
      },
      {
        key: "4",
        label: (
          <div onClick={(e) => preventNavigation(e)}>
            <Popconfirm
              title={t("noficationDelete.sureBoard")}
              onConfirm={() => onDelete(board.id)}
              okText={t("table.yes")}
              cancelText={t("table.no")}
              okButtonProps={{ loading: isLoadingDelete }}
            >
              <div>
                <FiTrash2 className="inline-block mr-2" />
                {t("general.delete")}
              </div>
            </Popconfirm>
          </div>
        ),
      },
      {
        key: "5",
        label: (
          <div onClick={(e) => preventNavigation(e)}>
            <Popconfirm
              title={t("general.deleteConfirm")}
              onConfirm={() => onArchive(board.id)}
              okText={t("table.yes")}
              cancelText={t("table.no")}
              okButtonProps={{ loading: isLoadingArchive }}
            >
              <div>
                <MdLockOutline className="inline-block mr-2" />
                {t("noficationAddAndUpdate.lockTable")}
              </div>
            </Popconfirm>
          </div>
        ),
      },
    ];

    return items;
  };
  const getDropdownArch = (board: IBoard) => {
    const items = [
      {
        key: "1",
        label: (
          <div onClick={(e) => preventNavigation(e)}>
            <AddBoardUsers board={board} />
          </div>
        ),
      },
      {
        key: "2",
        label: (
          <div onClick={(e) => preventNavigation(e)}>
            <CopyItem type="board" itemId={board.id} name={board.name} />
          </div>
        ),
      },
      {
        key: "4",
        label: (
          <div onClick={(e) => preventNavigation(e)}>
            <Popconfirm
              title={t("noficationDelete.sureBoard")}
              onConfirm={() => onDelete(board.id)}
              okText={t("table.yes")}
              cancelText={t("table.no")}
              okButtonProps={{ loading: isLoadingDelete }}
            >
              <div>
                <FiTrash2 className="inline-block mr-2" />
                {t("general.delete")}
              </div>
            </Popconfirm>
          </div>
        ),
      },
      {
        key: "5",
        label: (
          <div onClick={(e) => preventNavigation(e)}>
            <Popconfirm
              title={t("bạn có muốn mở bảng không")} //chưa đa ngôn ngữ
              onConfirm={() => onArchiveTrue(board.id)}
              okText={t("table.yes")}
              cancelText={t("table.no")}
              okButtonProps={{ loading: isLoadingArchiveTrue }}
            >
              <div>
                <MdLockOutline className="inline-block mr-2" />
                {t("Mở khoá bảng")}
              </div>
            </Popconfirm>
          </div>
        ),
      },
    ];

    return items;
  };
  const getDropdownGuest = (board: IBoard) => {
    const items = [
      {
        key: "1",
        label: (
          <div onClick={(e) => preventNavigation(e)}>
            <AddBoardUsers board={board} />
          </div>
        ),
      },
      {
        key: "2",
        label: (
          <div onClick={(e) => preventNavigation(e)}>
            <Popconfirm
              title={t("noficationDelete.sureBoard")}
              onConfirm={() => onLeave(board.id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ loading: isLoadingLeave }}
            >
              <div>
                <FiLogOut className="inline-block mr-2" />
                {t("table.leaveBoard")}
              </div>
            </Popconfirm>
          </div>
        ),
      },
    ];

    return items;
  };

  const onDelete = async (boardId: number) => {
    try {
      await deleteBoard(boardId);
      notification.success({
        message: `${t("noficationDelete.boardSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.boardError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const onArchive = async (boardId: number) => {
    try {
      await archiveBoard(boardId);
      notification.success({
        message: `${t("Khoá bảng thành công")}`, //chưa đa ngôn ngữ
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("Khoá bảng lỗi")}`, //chưa đa ngôn ngữ
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };
  const onArchiveTrue = async (boardId: number) => {
    try {
      await archiveTrueBoard(boardId);
      notification.success({
        message: `${t("Mở bảng thành công")}`, //chưa đa ngôn ngữ
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("Khoá bảng lỗi")}`, //chưa đa ngôn ngữ
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };
  const onLeave = async (boardId: number) => {
    try {
      await leaveBoard(boardId);
      notification.success({
        message: `${t("table.leaveBoardSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("table.leaveBoardError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="px-5">
        {/* Section for Archived Boards (is_archive = true) */}
        <div className="text-lg font-semibold mb-3 mt-6 flex items-center gap-2">
          <AiOutlineUser /> {t("task.yourWorkspace")}
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
          {boardList?.results
            .filter((board: IBoard) => board.creator === Number(userId) && board.is_archive === true)
            .map((board: IBoard, idx: number) => (
              <motion.div
                initial="hidden"
                onClick={() => handleCardClick(board.slug)}
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: (idx + 1) / 8, duration: 0.5 }}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0 },
                }}
                className={`w-full h-28 px-4 py-3 gap-4 rounded  cursor-pointer ${
                  board?.bg_color_type === 1 ? board?.bg_color : "bg-slate-300"
                } ${board?.bg_color_type === 2 || 3 ? "bg-cover bg-center" : ""}`}
                style={
                  board?.bg_color_type === 2
                    ? { backgroundImage: `url(${board?.bg_color})` }
                    : board?.bg_color_type === 3
                    ? { backgroundImage: `url(${board?.bg_image})` }
                    : {}
                }
              >
                <div className="flex justify-between items-center gap-3">
                  <div className="text-white font-semibold">{board.name}</div>
                  <Dropdown
                    menu={{ items: getDropdownUser(board) }}
                    placement="bottomLeft"
                    arrow
                    trigger={["click"]}
                    open={activeDropdown === board.id}
                    onOpenChange={(open) => (open ? setActiveDropdown(board.id) : setActiveDropdown(null))}
                  >
                    <Button
                      type="text"
                      icon={<FiMoreHorizontal className="text-white" size={20} />}
                      onClick={(e) => {
                        e.stopPropagation(); // This should prevent the card's click event
                      }}
                    />
                  </Dropdown>
                </div>
              </motion.div>
            ))}
          <AddAndUpdateBoard
            title={t("noficationAddAndUpdate.createBoardTask")}
            titleLabel={t("noficationAddAndUpdate.createBoardTask")}
          />
        </div>

        {/* Section for Active Boards (is_archive = false) */}
        <div className="text-lg font-semibold mb-3 mt-6 flex gap-2 items-center">
          <AiOutlineUser /> {t("Bảng đã khoá")}
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
          {boardList?.results
            .filter((board: IBoard) => board.creator === Number(userId) && board.is_archive === false)
            .map((board: IBoard, idx: number) => (
              <motion.div
                initial="hidden"
                onClick={() => handleCardArchiveClick(board.slug)}
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: (idx + 1) / 8, duration: 0.5 }}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0 },
                }}
                className={`w-full h-28 px-4 py-3 gap-4 rounded  cursor-pointer ${
                  board?.bg_color_type === 1 ? board?.bg_color : "bg-slate-300"
                } ${board?.bg_color_type === 2 || 3 ? "bg-cover bg-center" : ""}`}
                style={
                  board?.bg_color_type === 2
                    ? { backgroundImage: `url(${board?.bg_color})` }
                    : board?.bg_color_type === 3
                    ? { backgroundImage: `url(${board?.bg_image})` }
                    : {}
                }
              >
                <div className="flex justify-between items-center gap-3">
                  <div className="text-white font-semibold">{board.name}</div>
                  <Dropdown
                    menu={{ items: getDropdownArch(board) }}
                    placement="bottomLeft"
                    arrow
                    trigger={["click"]}
                    open={activeDropdown === board.id}
                    onOpenChange={(open) => (open ? setActiveDropdown(board.id) : setActiveDropdown(null))}
                  >
                    <Button
                      type="text"
                      icon={<FiMoreHorizontal className="text-white" size={20} />}
                      onClick={(e) => {
                        e.stopPropagation(); // This should prevent the card's click event
                      }}
                    />
                  </Dropdown>
                </div>
              </motion.div>
            ))}
          <AddAndUpdateBoard
            title={t("noficationAddAndUpdate.createBoardTask")}
            titleLabel={t("noficationAddAndUpdate.createBoardTask")}
          />
        </div>

        {/* Section for Guest Workspace Boards */}
        <div className="text-lg font-semibold mb-3 mt-6 flex gap-2 items-center">
          <AiOutlineUsergroupAdd /> {t("task.guestWorkspace")}
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
          {boardList?.results
            .filter((board: IBoard) => board.creator !== Number(userId) && board.is_archive === false)
            .map((board: IBoard, idx: number) => (
              <motion.div
                initial="hidden"
                onClick={() => handleCardClick(board.slug)}
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: (idx + 1) / 8, duration: 0.5 }}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0 },
                }}
                className={`w-full h-28 px-4 py-3 gap-4 rounded bg-slate-300 cursor-pointer ${
                  board?.bg_color_type === 1 ? board?.bg_color : ""
                } ${board?.bg_color_type === 2 || 3 ? "bg-cover bg-center" : ""}`}
                style={
                  board?.bg_color_type === 2
                    ? { backgroundImage: `url(${board?.bg_color})` }
                    : board?.bg_color_type === 3
                    ? { backgroundImage: `url(${board?.bg_image})` }
                    : {}
                }
              >
                <div className="flex justify-between items-center gap-3">
                  <div className="text-white font-semibold">{board.name}</div>
                  <Dropdown
                    menu={{ items: getDropdownGuest(board) }}
                    placement="bottomLeft"
                    arrow
                    trigger={["click"]}
                    open={activeDropdown === board.id}
                    onOpenChange={(open) => (open ? setActiveDropdown(board.id) : setActiveDropdown(null))}
                  >
                    <Button
                      type="text"
                      icon={<FiMoreHorizontal className="text-white" size={20} />}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  </Dropdown>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TaskManagement;
