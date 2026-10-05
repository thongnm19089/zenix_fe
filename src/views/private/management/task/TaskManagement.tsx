"use client";

import CopyItem from "./CustomBoard/CopyItem";
import {
  useDeleteBoardMutation,
  useGetBoardListQuery,
  useLeaveBoardMutation,
  useArchiveBoardMutation,
  useArchiveTrueBoardMutation,
  useGetTypeBoardListQuery,
  useDeleteTypeBoardMutation,
} from "@/api/Task/apiTask";
import AddAndUpdateBoard from "@/components/FunctionsManagement/Task/AddAndUpdateBoard";
import AddAndUpdateGuestBoard from "@/components/FunctionsManagement/Task/AddAndUpdateGuestBoard";
import AddAndUpdateType from "@/components/FunctionsManagement/Task/AddAndUpdateType";
import AddBoardUsers from "@/components/FunctionsManagement/Task/AddBoardUsers";
import { IBoard } from "@/types/taskTypes";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Avatar, Button, Dropdown, List, Popconfirm, Tooltip, notification, Spin, Row, Col, Select, Input } from "antd";
import { motion } from "framer-motion";
import jwt_decode from "jwt-decode";
import { useTranslations } from "next-intl";
import Link from "next-intl/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AiOutlineUser, AiOutlineUsergroupAdd } from "react-icons/ai";
import { FiLogOut, FiMoreHorizontal, FiTrash2 } from "react-icons/fi";
import { MdLockOutline } from "react-icons/md";

const { Option } = Select;

const PRIMARY_COLOR = "#f1692f";
const PRIMARY_LIGHT = "#fff3ec";
const PRIMARY_DARK = "#d8561f";

const TaskManagement = () => {
  const t: any = useTranslations();
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null | undefined>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [leaveBoard, { isLoading: isLoadingLeave }] = useLeaveBoardMutation();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [typeId, setTypeId] = useState<number>();

  const [deleteTypeBoard] = useDeleteTypeBoardMutation();

  useEffect(() => {
    if (typeof document !== "undefined") {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];
      setAccessToken(token);

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
  const { data: typeBoardList, isLoading: isLoadingTypes, refetch: refetchTypeBoards } = useGetTypeBoardListQuery();

  if (error && "status" in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push("/403/");
    }
  }

  useEffect(() => {
    setSelectedType("");
  }, []);

  const handleDeleteTypeBoard = async (typeId: number) => {
    if (confirm(t("Bạn có chắc muốn xóa loại bảng này?"))) {
      try {
        await deleteTypeBoard(typeId);
        notification.success({
          message: t("Xóa loại bảng thành công"),
          placement: "bottomRight",
        });
        refetchTypeBoards();
      } catch (error) {
        notification.error({
          message: t("Xóa loại bảng thất bại"),
          placement: "bottomRight",
        });
      }
    }
  };

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
              title={t("bạn có muốn khoá không")}
              onConfirm={() => onArchive(board.id)}
              okText={t("table.yes")}
              cancelText={t("table.no")}
              okButtonProps={{ loading: isLoadingArchive }}
            >
              <div>
                <MdLockOutline className="inline-block mr-2" />
                {t("Khoá bảng")}
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
          <div className="disabled-item" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} />
            <AddBoardUsers board={board} />
          </div>
        ),
        disabled: true, // Vô hiệu hóa chức năng này

      },
      {
        key: "2",
        label: (
          <div className="disabled-item" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} />
            <CopyItem type="board" itemId={board.id} name={board.name} />
          </div>
        ),
        disabled: true, // Vô hiệu hóa chức năng này
      },
      {
        key: "3",
        label: (
          <div className="disabled-item" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} />
            <AddAndUpdateBoard
              edit={true}
              title={t("noficationAddAndUpdate.editBoardTitle")}
              titleLabel={t("noficationAddAndUpdate.editBoardTitle")}
              board={board}
            />
          </div>

        ),
        disabled: true, // Vô hiệu hóa chức năng này
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
            <AddAndUpdateGuestBoard
              board={board}
            />
          </div>
        ),
      },
      {
        key: "3",
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

  // console.log("boardList", boardList)
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

  const handleModalType = (id?: number) => {
    if (id) {
      setTypeId(id);
    } else if (id === undefined) {
      setTypeId(undefined);
    }
    setIsModalVisible(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-5 py-6">
        <div className="mb-6">
          {/* <h1 className="text-2xl font-bold text-gray-800 mb-2">{t("task.taskManagement")}</h1> */}
          <p className="text-gray-600">Quản lý và tổ chức các bảng công việc của bạn</p>
        </div>

        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={10}>
            <Input
              placeholder={t("Tìm kiếm theo tên")}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              size="large"
              style={{ borderRadius: "8px" }}
              prefix={<AiOutlineUser className="text-gray-400" />}
            />
          </Col>
          <Col xs={24} sm={12} md={10}>
            <Select
              value={selectedType || ""}
              onChange={(value) => setSelectedType(value)}
              className="w-full"
              size="large"
              onDropdownVisibleChange={(open) => setDropdownVisible(open)}
              dropdownRender={(menu) => (
                <div>
                  <Option value="">{t("crm.all")}</Option>
                  {menu}
                </div>
              )}
              style={{ borderRadius: "8px" }}
            >
              <Option value="">{t("crm.all")}</Option>
              {typeBoardList?.results && typeBoardList.results.map((type: { id: number, name: string }) => (
                <Option key={type.id} value={type.id.toString()}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{type.name}</span>
                    <div
                      className={dropdownVisible ? '' : 'hidden'}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        visibility: dropdownVisible ? 'visible' : 'hidden',
                      }}
                    >
                      {/* <Button type="primary" onClick={() => handleModalType(type.id)} size="small" className="bg-teal-600 hover:!bg-teal-500">
                        Sửa Type
                      </Button> */}
                      {/* <AddAndUpdateType edit={true} typeBoardId={type.id} /> */}
                      <Button
                        type="link"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTypeBoard(type.id);
                        }}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
            <AddAndUpdateType
              edit={typeId ? true : false}
              typeBoardId={typeId}
              open={isModalVisible}
              setOpen={setIsModalVisible}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              type="primary"
              onClick={() => handleModalType(undefined)}
              size="large"
              style={{
                backgroundColor: PRIMARY_COLOR,
                borderColor: PRIMARY_COLOR,
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(241, 105, 47, 0.3)",
                transition: "all 0.3s ease",
                height: "40px",
                borderRadius: "8px"
              }}
              className="hover:shadow-lg w-full"
            >
              Tạo mới Type
            </Button>
          </Col>
        </Row>
        {/* Section for Archived Boards (is_archive = true) */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-800">{t("task.yourWorkspace")}</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
          {boardList?.results
            .filter((board: IBoard) => {
              const isFiltered =
                board.creator === Number(userId) &&
                board.is_archive === true &&
                board.name.toLowerCase().includes(searchKeyword.toLowerCase()) &&
                (!selectedType || (board.type_name && board.type_name.includes(
                  typeBoardList?.results.find((type: { id: number; name: string }) => type.id.toString() === selectedType)?.name
                )));
              return isFiltered;
            })
            .map((board: IBoard, idx: number) => {
              return (
                <motion.div
                  key={board.id}  // Đảm bảo có key duy nhất
                  initial="hidden"
                  onClick={() => handleCardClick(board.slug)}
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: (idx + 1) / 8, duration: 0.5 }}
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className={`w-full h-28 px-4 py-3 gap-4 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${board?.bg_color_type === 1 ? board?.bg_color : "bg-slate-300"
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
                    <div className="text-white font-semibold">
                      {board.name}
                      {board.type_name && (
                        <>
                          - loại: {Array.isArray(board.type_name) ? board.type_name.join(", ") : board.type_name}
                        </>
                      )}
                    </div>


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
              );
            })}

          <AddAndUpdateBoard
            title={t("noficationAddAndUpdate.createBoardTask")}
            titleLabel={t("noficationAddAndUpdate.createBoardTask")}
          />
        </div>

        {/* Section for Guest Workspace Boards */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-800">{t("task.guestWorkspace")}</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
          {boardList?.results
            .filter((board: IBoard) => {
              const isFiltered =
                board.creator !== Number(userId) &&
                board.is_archive === true &&
                board.name.toLowerCase().includes(searchKeyword.toLowerCase()) &&
                (!selectedType || (board.type_name && board.type_name.includes(
                  typeBoardList?.results.find((type: { id: number; name: string }) => type.id.toString() === selectedType)?.name
                )));
              return isFiltered;
            })
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
                className={`w-full h-28 px-4 py-3 gap-4 rounded bg-slate-300 cursor-pointer ${board?.bg_color_type === 1 ? board?.bg_color : ""
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
                  <div className="text-white font-semibold">{board.name}
                    {board.type_name && (
                      <>

                        - loại: {board.type_name}
                      </>
                    )}
                  </div>
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

        {/* Section for Active Boards (is_archive = false) */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-800">{t("Bảng đã khoá")}</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
          {boardList?.results
            .filter((board: IBoard) => {
              const isFiltered =
                board.creator === Number(userId) &&
                board.is_archive === false &&
                board.name.toLowerCase().includes(searchKeyword.toLowerCase()) &&
                (!selectedType || (board.type_name && board.type_name.includes(
                  typeBoardList?.results.find((type: { id: number; name: string }) => type.id.toString() === selectedType)?.name
                )));
              return isFiltered;
            })
            .map((board: IBoard, idx: number) => (
              <motion.div
                key={board.id}  // Đảm bảo có key duy nhất
                initial="hidden"
                onClick={() => handleCardArchiveClick(board.slug)}
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: (idx + 1) / 8, duration: 0.5 }}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0 },
                }}
                className={`w-full h-28 px-4 py-3 gap-4 rounded cursor-pointer ${board?.bg_color_type === 1 ? board?.bg_color : "bg-slate-300"
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
                  <div className="text-white font-semibold">
                    {board.name}
                    {board.type_name && (
                      <>
                        - loại: {Array.isArray(board.type_name) ? board.type_name.join(", ") : board.type_name}
                      </>
                    )}
                  </div>


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
        </div>
      </div>
    </div>
  );
};

export default TaskManagement;
