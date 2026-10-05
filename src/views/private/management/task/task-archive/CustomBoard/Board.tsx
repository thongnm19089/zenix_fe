"use client";

import ListInput from "./ListInput";
import TrelloList from "./TrelloList";
import {
  useGetBoardDetailQuery,
  useCreateTrelloListMutation,
  useDeleteTrelloListMutation,
  useReorderTrelloListMutation,
  useReorderCardMutation,
  useDeleteCardMutation,
  useCreateCardMutation,
  useGetArchiveListQuery,
  useGetArchiveCardQuery,
} from "@/api/Task/apiTask";
import Archive from "@/components/FunctionsManagement/Task/Task-archive/Archive";
import ChangeBackground from "@/components/FunctionsManagement/Task/Task-archive/ChangeBackground";
import SelectBoard from "@/components/FunctionsManagement/Task/Task-archive/SelectBoard";
import SearchTask from "@/components/Search/SearchTask";
import { RootState } from "@/store/store";
import { ICard, ILabel, IList, IUser } from "@/types/taskTypes";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Avatar, Form, Spin, Tooltip, notification } from "antd";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

// Color constants
const PRIMARY_COLOR = "#f1692f";
const PRIMARY_LIGHT = "#fff3ec";
const PRIMARY_DARK = "#d8561f";
const PRIMARY_RGBA = "rgba(241, 105, 47, 0.2)";

interface BoardProps {
  slug: string | string[] | undefined;
}

const Board: React.FC<BoardProps> = ({ slug }) => {
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const t: any = useTranslations();
  const router = useRouter();

  const [form] = Form.useForm();
  const searchParams = useSearchParams()!;
  const searchCard = searchParams.get("card");
  const searchUsers = searchParams.get("users");
  const searchLabels = searchParams.get("labels");
  const searchDeadline = searchParams.get("deadline");
  const searchLists = searchParams.get("lists");
  const { data: boardQuery, refetch, error, isLoading } = useGetBoardDetailQuery(slug, { skip: !slug });
  const [currentBoard, setCurrentBoard] = useState<any>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState<boolean>(false);

  // Redirect to custom 403 page if there's a 403 error
  if (error && "status" in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push("/403/");
    }
  }

  useEffect(() => {
    let newLists = boardQuery?.lists || [];

    const labelArray = searchLabels ? (searchLabels === "NONE" ? "NONE" : searchLabels.split(",").map(Number)) : null;
    const userArray = searchUsers ? (searchUsers === "NONE" ? "NONE" : searchUsers.split(",").map(Number)) : null;
    const listArray = searchLists ? searchLists.split(",").map(Number) : null;

    newLists = newLists.filter((list: IList) => !listArray || listArray.includes(list.id)).map((list: IList) => ({
      ...list,
      cards: list.cards.filter((card: ICard) => {
        // Conditions for label filtering
        const labelCondition =
          !labelArray ||
          (labelArray === "NONE"
            ? card?.label_list?.length === 0
            : labelArray.every((labelId) => card?.label_list?.some((label: ILabel) => label.id === labelId)));

        // Conditions for user filtering
        const userCondition =
          !userArray ||
          (userArray === "NONE"
            ? card.users.length === 0
            : userArray.every((userId) => card.users.some((user: IUser) => user.id === userId)));

        // Combine conditions if searching card name
        const nameCondition = !searchCard || card.name.toLowerCase().includes(searchCard.toLowerCase());

        // Conditions for deadline filtering
        let deadlineCondition = true;
        if (searchDeadline) {
          if (searchDeadline === "NONE") {
            deadlineCondition = card.deadline === null;
          } else if (searchDeadline === "overdue") {
            deadlineCondition = !!card.deadline && new Date(card.deadline) < new Date() && card.is_completed === false;
          } else if (searchDeadline === "withinDeadline") {
            deadlineCondition = !!card.deadline && new Date(card.deadline) >= new Date();
          } else if (searchDeadline === "completedDeadline") {
            deadlineCondition = card.is_completed === true;
          }
        }

        // Return whether card meets all conditions
        return labelCondition && userCondition && nameCondition && deadlineCondition;
      }),
    }));

    setCurrentBoard({
      ...boardQuery,
      lists: newLists,
    });

    // Update field values if necessary
    if (searchCard) {
      form.setFieldsValue({ card: searchCard });
    }
    if (labelArray || userArray) {
      form.setFieldsValue({ users: userArray, labels: labelArray, lists: listArray });
    }
    if (listArray) {
      form.setFieldsValue({ lists: listArray });
    }
  }, [boardQuery, searchCard, searchLabels, searchUsers, searchDeadline, searchLists]);

  const [deleteTrelloList] = useDeleteTrelloListMutation();
  const [createTrelloList] = useCreateTrelloListMutation();
  const [reorderTrelloList] = useReorderTrelloListMutation();
  const [reorderCard] = useReorderCardMutation();
  const [deleteCard] = useDeleteCardMutation();
  const [createCard, { isLoading: isLoadingCreate }] = useCreateCardMutation();

  // Add necessary functions to use
  function deepCopy(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }

  const handleNotification = (type: "success" | "error", message: string) => {
    notification[type]({
      message: message,
      placement: "bottomRight",
      className: "h-16",
    });
  };

  // List functions to add, remove and update list (later on)
  const addTrelloList = async (boardId: number, name: string) => {
    const body = { name: name, board: boardId };
    try {
      const response = await createTrelloList(body);
      notification.success({
        message: "Thêm danh sách thành công",
        placement: "bottomRight",
        className: "h-16",
      });
      if ("data" in response) {
        const newList = response.data;
        // Create a new board object with the added list
        const updatedBoard = {
          ...currentBoard,
          lists: [...currentBoard.lists, newList],
        };
        setCurrentBoard(updatedBoard);
      }
    } catch (error) {
      handleNotification("error", "Failed to create list");
    }
  };

  const removeList = async (trelloListId: number) => {
    // Keep a copy of the current board state for restoration in case of an error.
    let originalBoard = deepCopy(currentBoard); // Deep copy the board

    // Optimistically remove the list from local state to make the UI look fast.
    const updatedLists = currentBoard?.lists?.filter((list: IList) => list.id !== trelloListId);
    setCurrentBoard((prevBoard: any) => ({
      ...prevBoard,
      lists: updatedLists,
    }));

    try {
      await deleteTrelloList(trelloListId);
      notification.success({
        message: "Lưu trữ thẻ thành công",
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      // Restore the original board state because the deletion API call failed.
      notification.error({
        message: "Lưu trữ thẻ lỗi",
        placement: "bottomRight",
        className: "h-16",
      });
      setCurrentBoard(originalBoard);
      handleNotification("error", "Failed to delete list");
    }
  };

  // List functions to add, remove and update card
  const addCard = async (listId: number, name: string) => {
    const body = {
      name: name,
      trello_list: listId,
      user_ids: [],
    };
    try {
      const response = await createCard(body);
      if ("data" in response) {
        notification.success({
          message: "Thêm thẻ thành công",
          placement: "bottomRight",
          className: "h-16",
        });
        setCurrentBoard((prevBoard: { lists: any[] }) => {
          return {
            ...prevBoard,
            lists: prevBoard.lists.map((list) => {
              if (list.id === listId) {
                return {
                  ...list,
                  cards: [...list.cards, response.data],
                };
              }
              return list;
            }),
          };
        });
      }
    } catch (error) {
      handleNotification("error", "Failed to create card");
      notification.error({
        message: "Thêm bài viết lỗi",
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const removeCard = async (listId: number, cardId: number) => {
    try {
      await deleteCard(cardId);
      notification.success({
        message: "Lưu trữ thẻ thành công",
        placement: "bottomRight",
        className: "h-16",
      });
      // Update the current board by filtering out the deleted card from the appropriate list.
      setCurrentBoard((prevBoard: { lists: any[] }) => {
        return {
          ...prevBoard,
          lists: prevBoard.lists.map((list) => {
            if (list.id === listId) {
              return {
                ...list,
                cards: list.cards.filter((card: { id: number }) => card.id !== cardId),
              };
            }
            return list;
          }),
        };
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.failedToDeleteCard")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const refreshCardAndBoard = async () => {
    const boardResult = await refetch();
    if ("data" in boardResult && boardResult.data) {
      setCurrentBoard(boardResult.data);
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
    <div
      style={{
        background: boardQuery?.bg_color_type === 1 ? boardQuery?.bg_color : '',
        backgroundImage: boardQuery?.bg_color_type === 2
          ? `url(${boardQuery?.bg_color})`
          : boardQuery?.bg_color_type === 3
            ? `url(${boardQuery?.bg_image})`
            : '',
        border: "none",
        boxShadow: "none",
      }}
    >
      <div style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: "12px",
        backgroundColor: PRIMARY_RGBA,
        marginBottom: "12px",
        maxWidth: isCollapse ? "calc(100vw - 124px)" : "calc(100vw - 300px)",
        borderRadius: "12px",
        backdropFilter: "blur(10px)"
      }}>
        <div className="flex justify-between items-center  ">
          <SelectBoard board={currentBoard} />
        </div>
        <div className="mr-4 flex items-center sm:gap-3 max-sm:self-end">
          <SearchTask board={boardQuery} form={form} list={boardQuery?.lists} listFilter={currentBoard?.lists} />
          <div style={{ position: 'relative', cursor: "pointer" }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} />
            <ChangeBackground board={boardQuery} />
          </div>
          <Archive boardId={boardQuery?.id} refreshCardAndBoard={refreshCardAndBoard} isArchiveOpen={isArchiveOpen} setIsArchiveOpen={setIsArchiveOpen} />
          <Avatar.Group
            maxCount={3}
            maxPopoverTrigger="click"
            maxStyle={{
              color: "#fff",
              backgroundColor: PRIMARY_COLOR,
              cursor: "pointer",
              fontWeight: "bold",
              border: `2px solid ${PRIMARY_LIGHT}`
            }}
            className="max-sm:ml-2"
          >
            {boardQuery?.users?.map((user: IUser) => (
              <Tooltip title={`${user.first_name} ${user.last_name}`} key={user.id}>
                {user.image ? (
                  <Avatar src={user.image} />
                ) : (
                  <Avatar>{user.first_name.charAt(0) + user.last_name.charAt(0)}</Avatar>
                )}
              </Tooltip>
            ))}
          </Avatar.Group>
        </div>
      </div>
      <div
        style={{
          overflowX: "auto",
          width: "calc(100vw - 44px)",
          minHeight: "calc(100vh - 140px)",
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingTop: "8px"
        }}
      >
        <div style={{
          padding: "16px",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "row",
          gap: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${PRIMARY_LIGHT}`
        }}>
          {currentBoard?.lists?.map((item: IList) => (
            <div key={item.id} style={{
              width: "300px",
              minHeight: "150px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              padding: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "12px",
              border: `1px solid ${PRIMARY_LIGHT}`,
              boxShadow: "0 2px 8px rgba(241, 105, 47, 0.1)",
              transition: "all 0.3s ease"
            }}>
              <TrelloList
                key={item.id}
                board={currentBoard}
                list={item}
                removeList={removeList}
                addCard={addCard} // pass the functions as props
                removeCard={removeCard}
                refreshCardAndBoard={refreshCardAndBoard}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;
