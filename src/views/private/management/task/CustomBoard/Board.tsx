"use client";

import ListInput from "./ListInput";
import Timeline, { TimelineView } from "./Timeline";
import TrelloList from "./TrelloList";
import {
  useGetBoardDetailQuery,
  useGetCardDetailQuery,
  useCreateTrelloListMutation,
  useDeleteTrelloListMutation,
  useReorderTrelloListMutation,
  useReorderCardMutation,
  useDeleteCardMutation,
  useCreateCardMutation,
} from "@/api/Task/apiTask";
import Archive from "@/components/FunctionsManagement/Task/Archive";
import ChangeBackground from "@/components/FunctionsManagement/Task/ChangeBackground";
import DeadlineStats, { isDeadlineInToday } from "@/components/FunctionsManagement/Task/DeadlineStats";
import UpdateCardDetail from "@/components/FunctionsManagement/Task/UpdateCardDetail";

import SearchTask from "@/components/Search/SearchTask";
import { RootState } from "@/store/store";
import { ICard, ILabel, IList, IUser } from "@/types/taskTypes";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Avatar, Button, Form, Modal, Segmented, Spin, Tooltip, notification } from "antd";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { DropResult } from "react-beautiful-dnd";
import { BiChevronLeft } from "react-icons/bi";
import { AiOutlineBarChart, AiOutlineCloseCircle, AiOutlineUnorderedList } from "react-icons/ai";
import { useSelector } from "react-redux";

interface BoardProps {
  slug: string | string[] | undefined;
}

type BoardView = "kaban" | "timeline";

const Board: React.FC<BoardProps> = ({ slug }) => {
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const t: any = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [form] = Form.useForm();
  const searchParams = useSearchParams()!;
  const searchCard = searchParams.get("card");
  const searchUsers = searchParams.get("users");
  const searchLabels = searchParams.get("labels");
  const searchDeadline = searchParams.get("deadline");
  const searchLists = searchParams.get("lists");
  const searchView = searchParams.get("view");
  const searchTimelineView = searchParams.get("timelineView");
  const searchCardSlug = searchParams.get("card_slug");
  const { data: boardQuery, refetch, error, isLoading } = useGetBoardDetailQuery(slug, { skip: !slug });
  const [currentBoard, setCurrentBoard] = useState<any>(null);
  const [baseBoard, setBaseBoard] = useState<any>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState<boolean>(false);
  const [boardView, setBoardView] = useState<BoardView>("kaban");
  const [timelineView, setTimelineView] = useState<TimelineView>("day");
  const [selectedCardSlug, setSelectedCardSlug] = useState<string | null>(searchCardSlug);
  const {
    data: selectedCard,
    refetch: refetchSelectedCard,
    isLoading: isSelectedCardLoading,
    isFetching: isSelectedCardFetching,
  } = useGetCardDetailQuery(selectedCardSlug, { skip: !selectedCardSlug });
  const isSelectedCardPending = !!selectedCardSlug && (isSelectedCardLoading || isSelectedCardFetching);

  const [activeFilter, setActiveFilter] = useState<{ type: string, value: string } | null>(null);

  const handleFilterChange = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValue = params.get(type);

    if (value === "ALL") {
      setActiveFilter(null);
      params.delete(type);
    } else if (currentValue === value || (activeFilter?.type === type && activeFilter?.value === value)) {
      // Nếu click vào filter đang active thì tắt filter
      setActiveFilter(null);
      params.delete(type);
    } else {
      // Nếu click vào filter khác thì cập nhật filter
      setActiveFilter({ type, value });
      params.set(type, value);
    }

    // Cập nhật URL với tham số mới
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    // Làm mới dữ liệu
    refetch();
  };

  const hasTaskFilters = !!(searchCard || searchUsers || searchLabels || searchDeadline || searchLists);

  const clearTaskFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("card");
    params.delete("users");
    params.delete("labels");
    params.delete("deadline");
    params.delete("lists");

    setActiveFilter(null);
    form.setFieldsValue({
      card: "",
      users: [],
      labels: [],
      deadline: [],
      lists: [],
    });

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    refetch();
  };

  const pushBoardQuery = (params: URLSearchParams) => {
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleBoardViewChange = (value: BoardView) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", value);
    if (value === "timeline" && !params.get("timelineView")) {
      params.set("timelineView", timelineView);
    }
    setBoardView(value);
    pushBoardQuery(params);
  };

  const handleTimelineViewChange = (value: TimelineView) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "timeline");
    params.set("timelineView", value);
    setBoardView("timeline");
    setTimelineView(value);
    pushBoardQuery(params);
  };

  const getTaskPathPrefix = () => {
    if (typeof window === "undefined") return "";
    const marker = "/business/task";
    const markerIndex = window.location.pathname.indexOf(marker);
    return markerIndex >= 0 ? window.location.pathname.slice(0, markerIndex) : "";
  };

  const getBoardQueryString = () => {
    const params =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams(searchParams.toString());
    params.set("view", boardView);
    if (boardView === "timeline") {
      params.set("timelineView", timelineView);
    }
    return params.toString();
  };

  const updateBrowserUrl = (path: string, query: string, replace = false) => {
    if (typeof window === "undefined") return;
    const nextUrl = query ? `${path}?${query}` : path;
    if (replace) {
      window.history.replaceState({}, "", nextUrl);
      return;
    }
    window.history.pushState({}, "", nextUrl);
  };

  const openCardDetail = (cardSlug: string) => {
    const boardSlug = boardQuery?.slug || (Array.isArray(slug) ? slug[0] : slug);
    const params = new URLSearchParams(getBoardQueryString());
    const selectedBoardCard = getBoardCardBySlug(cardSlug);
    params.delete("card_slug");
    params.set("card_slug", selectedBoardCard?.slug || cardSlug);
    setSelectedCardSlug(cardSlug);
    if (boardSlug) {
      updateBrowserUrl(`${getTaskPathPrefix()}/business/task/${boardSlug}`, params.toString(), true);
    }
  };

  const closeCardDetail = () => {
    const boardSlug = boardQuery?.slug || (Array.isArray(slug) ? slug[0] : slug);
    const params = new URLSearchParams(getBoardQueryString());
    params.delete("card_slug");
    setSelectedCardSlug(null);
    if (boardSlug) {
      updateBrowserUrl(`${getTaskPathPrefix()}/business/task/${boardSlug}`, params.toString(), true);
    }
  };

  // Redirect to custom 403 page if there's a 403 error
  if (error && "status" in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push("/403/");
    }
  }

  useEffect(() => {
    if (searchView === "timeline" || searchView === "kaban") {
      setBoardView(searchView);
    } else if (searchView === "trello") {
      setBoardView("kaban");
    } else {
      setBoardView("kaban");
    }
  }, [searchView]);

  useEffect(() => {
    if (searchTimelineView === "hour" || searchTimelineView === "day" || searchTimelineView === "week") {
      setTimelineView(searchTimelineView);
    } else {
      setTimelineView("day");
    }
  }, [searchTimelineView]);

  useEffect(() => {
    setSelectedCardSlug(searchCardSlug);
  }, [searchCardSlug]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedCardSlug(params.get("card_slug"));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    setBaseBoard(boardQuery);
    setCurrentBoard(applyTaskFilters(boardQuery));

    const labelArray = searchLabels ? (searchLabels === "NONE" ? "NONE" : searchLabels.split(",").map(Number)) : null;
    const userArray = searchUsers ? (searchUsers === "NONE" ? "NONE" : searchUsers.split(",").map(Number)) : null;
    const listArray = searchLists ? searchLists.split(",").map(Number) : null;

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
  const [hasCardArchived, setHasCardArchived] = useState(false);
  const boardRef = useRef();


  useEffect(() => {
    const tasksBoard = boardRef.current
    const storageKey = "tasksBoardScrollPosition";

    // Check if the element exists to avoid errors
    if (!tasksBoard) return;

    // 1. Restore the scroll position on page load
    const savedPosition = localStorage.getItem(storageKey);
    if (savedPosition !== null) {
      //@ts-ignore
      tasksBoard.scrollLeft = parseInt(savedPosition, 10) ?? 0;
    }

    // 2. Save the scroll position when the user scrolls
    //@ts-ignore
    tasksBoard.addEventListener("scroll", (_: any) => {
      //@ts-ignore
      localStorage.setItem(storageKey, tasksBoard.scrollLeft);
    });
  }, [boardRef.current]);

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

  const patchCard = (
    listId: number,
    cardId: number,
    patch: Partial<ICard>
  ) => {
    setBaseBoard((prev: any) => {
      const sourceBoard = prev ?? boardQuery;
      if (!sourceBoard) return prev;

      const updatedBoard = {
        ...sourceBoard,
        lists: sourceBoard.lists.map((list: any) => {
          if (list.id !== listId) return list;
          return {
            ...list,
            cards: list.cards.map((card: any) =>
              card.id === cardId ? { ...card, ...patch } : card
            ),
          };
        }),
      };

      setCurrentBoard(applyTaskFilters(updatedBoard));
      return updatedBoard;
    });
  };

  const applyTaskFilters = (sourceBoard: any) => {
    if (!sourceBoard) return sourceBoard;

    const labelArray = searchLabels ? (searchLabels === "NONE" ? "NONE" : searchLabels.split(",").map(Number)) : null;
    const userArray = searchUsers ? (searchUsers === "NONE" ? "NONE" : searchUsers.split(",").map(Number)) : null;
    const listArray = searchLists ? searchLists.split(",").map(Number) : null;

    const newLists = (sourceBoard.lists || []).filter((list: IList) => !listArray || listArray.includes(list.id)).map((list: IList) => ({
      ...list,
      cards: list.cards.filter((card: ICard) => {
        const labelCondition =
          !labelArray ||
          (labelArray === "NONE"
            ? card?.label_list?.length === 0
            : labelArray.every((labelId) => card?.label_list?.some((label: ILabel) => label.id === labelId)));

        const userCondition =
          !userArray ||
          (userArray === "NONE"
            ? card.users.length === 0
            : userArray.every((userId) => card.users.some((user: IUser) => user.id === userId)));

        const nameCondition = !searchCard || card.name.toLowerCase().includes(searchCard.toLowerCase());

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
          } else if (searchDeadline === "today") {
            deadlineCondition = isDeadlineInToday(card);
          }
        }

        return labelCondition && userCondition && nameCondition && deadlineCondition;
      }),
    }));

    return {
      ...sourceBoard,
      lists: newLists,
    };
  };

  const getBoardCardBySlug = (cardSlug: string) => {
    const sourceBoard = currentBoard ?? boardQuery;

    for (const list of sourceBoard?.lists ?? []) {
      const matchedCard = list.cards?.find((card: ICard) => card.slug === cardSlug);
      if (matchedCard) return matchedCard;
    }

    return null;
  };

  const addTrelloList = async (boardId: number, name: string) => {
    const originalBoard = currentBoard;

    // List tạm để UI hiện ngay
    const tempId = -Date.now();
    const tempList = {
      id: tempId,
      name,
      board: boardId,
      cards: [],
      __optimistic: true,
    };

    // 1) Optimistic: add ngay vào UI
    setCurrentBoard((prev: any) => ({
      ...prev,
      lists: [...(prev?.lists ?? []), tempList],
    }));

    // 2) Call API sau (không await để UI không bị block)
    createTrelloList({ name, board: boardId })
      .unwrap()
      .then((newList: any) => {
        notification.success({
          message: "Thêm danh sách thành công",
          placement: "bottomRight",
          className: "h-16",
        });

        // 3) Replace list tạm bằng list thật
        setCurrentBoard((prev: any) => ({
          ...prev,
          lists: prev.lists.map((l: any) => (l.id === tempId ? newList : l)),
        }));
      })
      .catch(() => {
        // 4) rollback
        setCurrentBoard(originalBoard);

        notification.error({
          message: "Thêm danh sách lỗi",
          placement: "bottomRight",
          className: "h-16",
        });
      });
  };

  const removeList = async (trelloListId: number) => {
    let originalBoard = deepCopy(currentBoard);

    const updatedLists = currentBoard?.lists?.filter((list: IList) => list.id !== trelloListId);
    setCurrentBoard((prevBoard: any) => ({
      ...prevBoard,
      lists: updatedLists,
    }));

    try {
      await deleteTrelloList(trelloListId);
      notification.success({
        message: "Lưu trữ danh sách thành công",
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: "Lưu trữ danh sách lỗi",
        placement: "bottomRight",
        className: "h-16",
      });
      setCurrentBoard(originalBoard);
      handleNotification("error", "Failed to delete list");
    }
  };

  const addCard = async (listId: number, value: string, startDate?: String, deadline?: String) => {
    const body: any  = {
      name: value, trello_list: listId, user_ids: []
    };
    if (deadline) body.deadline = deadline;
    if (startDate) body.start_date = startDate;
    const originalBoard = currentBoard;
    const tempId = -Date.now(); 
    const tempCard = {
      id: tempId,
      name: value,
      trello_list: listId,
      users: [],
      label_list: [],
      deadline,
      is_completed: false,
      __optimistic: true,
    };

    // 1) Optimistic: add ngay vào UI
    setCurrentBoard((prev: any) => ({
      ...prev,
      lists: prev.lists.map((list: any) =>
        list.id === listId ? { ...list, cards: [...list.cards, tempCard] } : list
      ),
    }));

    // 2) Call API sau (không await để UI không bị block)
    createCard(body)
      .unwrap()
      .then((createdCard: any) => {
        notification.success({
          message: "Thêm thẻ thành công",
          placement: "bottomRight",
          className: "h-16",
        });

        // 3) Thay card tạm bằng card thật (đúng id từ server)
        setCurrentBoard((prev: any) => ({
          ...prev,
          lists: prev.lists.map((list: any) => {
            if (list.id !== listId) return list;
            return {
              ...list,
              cards: list.cards.map((c: any) => (c.id === tempId ? createdCard : c)),
            };
          }),
        }));
      })
      .catch(() => {
        // 4) rollback: trả lại trạng thái trước đó
        setCurrentBoard(originalBoard);

        notification.error({
          message: "Thêm thẻ lỗi",
          placement: "bottomRight",
          className: "h-16",
        });
      });
  };

  const removeCard = async (listId: number, cardId: number) => {
    // 1) backup để rollback
    const originalBoard = currentBoard;

    // 2) Optimistic: xoá ngay khỏi UI
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

    try {
      // 3) gọi API sau
      await deleteCard(cardId);
      // await deleteCard(cardId).unwrap?.() ?? await deleteCard(cardId);
      notification.success({
        message: "Lưu trữ thẻ thành công",
        placement: "bottomRight",
        className: "h-16",
      });
      // 4) nếu cần Archive tự refresh thì chỉ refresh archive, KHÔNG refetch board
      // setHasCardArchived(true)
    } catch (error) {
      // 5) rollback
      setCurrentBoard(originalBoard);

      notification.error({
        message: `${t("noficationDelete.failedToDeleteCard")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const reorderListItem = async (current: number, destination: number) => {
    let updatedBoard = deepCopy(currentBoard);
    const reorderedLists = Array.from(updatedBoard?.lists || []);
    destination = Math.min(reorderedLists.length, destination);

    const [removed] = reorderedLists.splice(current, 1);
    reorderedLists.splice(destination, 0, removed as any);
    updatedBoard.lists = reorderedLists;
    setCurrentBoard(updatedBoard);

    const body = {
      list_id: (removed as any).id,
      new_position: destination,
    };

    reorderTrelloList(body).unwrap()
      .then((_) => {
        handleNotification("success", `${t("noficationAddAndUpdate.updateSuccessed")}`);
      })
      .catch((error) => {
        handleNotification("error", `${t("noficationDelete.failedToReorderList")}`);
    });
  }

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) return;


    if (type === "LIST") {
      await reorderListItem(source.index, destination.index);
    }

    if (type === "CARD") {
      let updatedBoard = deepCopy(currentBoard);

      const sourceListId = parseInt(source.droppableId.replace("list-", ""), 10);
      const destinationListId = parseInt(destination.droppableId.replace("list-", ""), 10);

      const sourceList = updatedBoard?.lists.find((list: { id: number }) => list.id === sourceListId);
      const destinationList = updatedBoard?.lists.find((list: { id: number }) => list.id === destinationListId);

      const [draggedCard] = sourceList.cards.splice(source.index, 1);
      destinationList.cards.splice(destination.index, 0, draggedCard);

      setCurrentBoard(updatedBoard);
      if (!sourceList || !destinationList) return;

      if (!draggedCard) {
        return;
      }

      const body = {
        card_id: draggedCard.id,
        new_position: destination.index,
        new_list_id: destinationListId,
      };

      try {
        await reorderCard(body).unwrap();
      } catch (error) {
        notification.error({
          message: `${t("noficationDelete.failedToReorderCard")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    }
  };

  const refreshCardAndBoard = async () => {
    const boardResult = await refetch();
    if ("data" in boardResult && boardResult.data) {
      setCurrentBoard(boardResult.data);
    }
    if (selectedCardSlug && refetchSelectedCard) {
      await refetchSelectedCard();
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  const renderBoardViewSegmented = () => (
    <Segmented
      value={boardView}
      onChange={(value) => handleBoardViewChange(value as BoardView)}
      options={[
        {
          label: (
            <div className="flex items-center gap-1 px-1">
              <AiOutlineUnorderedList />
              <span>{t("task.kaban")}</span>
            </div>
          ),
          value: "kaban",
        },
        {
          label: (
            <div className="flex items-center gap-1 px-1">
              <AiOutlineBarChart />
              <span>{t("task.timeline")}</span>
            </div>
          ),
          value: "timeline",
        },
      ]}
    />
  );

  return (
    <div
      className={`relative w-full max-sm:max-w-[100vw] max-w-full ${boardQuery?.bg_color_type === 1 ? boardQuery?.bg_color : ""} ${boardQuery?.bg_color_type === 2 || 3 ? "bg-cover bg-center" : ""
        }`}
      style={
        boardQuery?.bg_color_type === 2
          ? { backgroundImage: `url(${boardQuery?.bg_color})` }
          : boardQuery?.bg_color_type === 3
            ? { backgroundImage: `url(${boardQuery?.bg_image})` }
            : {}
      }
    >
      <div className="board-header flex flex-col gap-2 justify-between px-4 py-3 bg-black/30 mb-2 rounded-xl mt-12 w-full max-w-[100vw] sm:max-w-full">
        {/* Row 1: Back button + Action buttons (luôn trên cùng) */}
        <div className="flex items-center justify-between gap-2 w-full">
          <Button ghost className="mr-2 shrink-0" onClick={() => router.push("/business/task")}>
            <div className="flex items-center gap-2">
              <BiChevronLeft size={20} /><span className="font-semibold">{t("general.back")}</span>
            </div>
          </Button>

          {/* Action buttons — luôn hiện bên phải */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="max-sm:hidden">{renderBoardViewSegmented()}</div>
            <SearchTask board={boardQuery} form={form} list={boardQuery?.lists} listFilter={currentBoard?.lists} />
            {hasTaskFilters && (
              <Button className="flex items-center" icon={<AiOutlineCloseCircle />} onClick={clearTaskFilters}>
                {t("general.deleteFilter")}
              </Button>
            )}
            <ChangeBackground board={boardQuery} />
            <Archive boardId={boardQuery?.id} refreshCardAndBoard={refreshCardAndBoard} isArchiveOpen={isArchiveOpen} setIsArchiveOpen={setIsArchiveOpen} hasCardArchived={hasCardArchived}
              setHasCardArchived={setHasCardArchived} />
            <Avatar.Group
              maxCount={3}
              maxPopoverTrigger="click"
              maxStyle={{ color: "#f56a00", backgroundColor: "#fde3cf", cursor: "pointer" }}
              className="shrink-0"
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

        {/* Row 2: DeadlineStats — wrap xuống dòng riêng */}
        <div className="flex w-full items-center gap-2 max-sm:flex-wrap">
          <DeadlineStats
            board={currentBoard ?? boardQuery}
            onFilterChange={handleFilterChange}
            activeFilter={searchDeadline || (activeFilter?.type === 'deadline' ? activeFilter.value : undefined)}
            className="sm:flex-1 sm:min-w-0 max-sm:contents"
          />
          <div className="sm:hidden pb-1">{renderBoardViewSegmented()}</div>
        </div>
      </div>
      <div
        className={`overflow-x-auto overflow-y-auto w-full
  ${isCollapse ? "md:max-w-[calc(100vw-124px)]" : "md:max-w-[calc(100vw-300px)]"}
  md:min-h-[calc(100vh-140px)] min-h-[calc(100vh-110px)] px-2 sm:px-4 pb-4 custom-scrollbar`}
        //@ts-ignore
        ref={boardRef}
      >
        {boardView === "timeline" ? (
          <div className="p-3">
            <Timeline
              board={currentBoard ?? boardQuery}
              detailQuery={(() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("view", boardView);
                params.set("timelineView", timelineView);
                return params.toString();
              })()}
              timelineView={timelineView}
              onTimelineViewChange={handleTimelineViewChange}
              openCardDetail={openCardDetail}
              onFilterChange={handleFilterChange}
              patchCard={patchCard}
            />
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="lists" direction="horizontal" type="LIST">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="p-3 rounded-xl flex flex-row gap-4 w-fit"
                >
                  {currentBoard?.lists?.map((item: IList, index: number) => (
                    <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <TrelloList
                            board={currentBoard}
                            list={item}
                            index={index}
                            reorderCard={(destination) => reorderListItem(index, destination)}
                            removeList={removeList}
                            addCard={addCard}
                            removeCard={removeCard}
                            refreshCardAndBoard={refreshCardAndBoard}
                            patchCard={patchCard}
                            openCardDetail={openCardDetail}
                            onFilterChange={handleFilterChange}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <ListInput
                    text={t("noficationAddAndUpdate.addList")}
                    placeholder={t("noficationAddAndUpdate.enterListTitle")}
                    displayClass="task-list min-w-[272px] w-[272px] text-center cursor-pointer hover:ring-2 hover:ring-[#f1692f]"
                    editClass="rounded-xl p-3 min-w-[252px] w-[252px] focus:ring-2 focus:ring-[#f1692f]"
                    onSubmit={(value: string) => addTrelloList(currentBoard?.id || 0, value)}
                  />
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
      {selectedCardSlug && currentBoard && isSelectedCardPending && (
        <Modal open footer={null} closable={false} centered width={240}>
          <div className="flex items-center justify-center py-6">
            <Spin />
          </div>
        </Modal>
      )}
      {selectedCardSlug && currentBoard && !isSelectedCardPending && selectedCard && (
        <UpdateCardDetail
          isOpen={true}
          board={currentBoard}
          card={selectedCard}
          refreshCardAndBoard={refreshCardAndBoard}
          patchCard={patchCard}
          onClose={closeCardDetail}
        />
      )}
    </div>
  );
};

export default Board;
