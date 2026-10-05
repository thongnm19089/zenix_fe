import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IBoard } from "@/types/taskTypes";
export const apiTask = createApi({
  // baseQuery: baseQueryWithAxios,
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/apis/v1/`,
    prepareHeaders: (headers, { getState }) => {
      const accessToken = getAccessTokenFromCookie();
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return headers;
    },
  }),
  reducerPath: "taskApi",
  tagTypes: [
    "Board",
    "BoardDetail",
    "BoardSelect",
    "TrelloList",
    "Card",
    "CardDetail",
    "Checklist",
    "Task",
    "CardFile",
    "Label",
    "CardLabel",
    "TypeBoard",

  ],
  endpoints: (builder) => ({
    //--------------------------Sample Board API ------------------------------//

    // Fetch Sample Boards (both user and shared sample boards)
    getSampleBoards: builder.query({
      query: (board_type) => {
        return board_type ? `sample-boards/?board_type=${board_type}` : `sample-boards/`;
      },
      providesTags: [{ type: "Board" }],
    }),

    getSampleBoardDetail: builder.query({
      query: (boardSlug) => `sample-boards-detail/${boardSlug}/`,
      providesTags: (result, error) => [{ type: "Board" }],
    }),

    // Create a Copy of a Sample Board
    createSampleBoardCopy: builder.mutation<IBoard, string>({
      query: (slug) => ({
        url: `create-sample-board-copy/${slug}/`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "Board" }],
    }),
    //--------------------------Board API ------------------------------//
    getBoardList: builder.query({
      query: () => `boards/`,
      providesTags: [{ type: "Board" }],
    }),
    getBoardListSelect: builder.query({
      query: () => `boards-list/`,
      providesTags: [{ type: "BoardSelect" }],
    }),
    createBoard: builder.mutation({
      query: (data) => ({
        url: "boards/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Board" }],
    }),
    getBoard: builder.query({
      query: (boardId) => `boards/${boardId}/`,
      providesTags: (result, error) => [{ type: "Board" }],
    }),
    editBoard: builder.mutation({
      query: ({ boardId, body }) => ({
        url: `boards/${boardId}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { boardId }) => [{ type: "Board" }, { type: "BoardDetail" }],
    }),
    deleteBoard: builder.mutation({
      query: (boardId) => ({
        url: `boards/${boardId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Board" }],
    }),
    archiveBoard: builder.mutation({
      query: (boardId) => ({
        url: `boards/${boardId}/archive/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Board" }],
    }),
    archiveTrueBoard: builder.mutation({
      query: (boardId) => ({
        url: `boards/${boardId}/archive_true/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Board" }],
    }),
    addUserBoard: builder.mutation({
      query: (body) => ({
        url: `boards/${body.id}/add-user/`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: (result, error, { boardId }) => [{ type: "Board" }, { type: "BoardDetail" }],
    }),
    leaveBoard: builder.mutation({
      query: (boardId) => ({
        url: `boards/${boardId}/remove-user/`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { boardId }) => [{ type: "Board" }, { type: "BoardDetail" }],
    }),
    // Board Detail Read only API
    getBoardDetail: builder.query({
      query: (boardSlug) => `board-detail/${boardSlug}/`,
      providesTags: (result, error) => [{ type: "BoardDetail" }],
    }),
    copyBoard: builder.mutation({
      query: (data) => ({
        url: `boards/${data.id}/copy_board/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Board" }],
    }),

    //--------------------------TrelloList API ------------------------------//

    getTrelloListList: builder.query({
      query: () => `lists/`,
      providesTags: [{ type: "TrelloList" }],
    }),
    createTrelloList: builder.mutation({
      query: (data) => ({
        url: "lists/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "TrelloList" }],
    }),
    getTrelloList: builder.query({
      query: (trelloListId) => `lists/${trelloListId}/`,
      providesTags: (result, error) => [{ type: "TrelloList" }],
    }),
    editTrelloList: builder.mutation({
      query: (body) => ({
        url: `lists/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { trelloListId }) => [
        { type: "TrelloList", trelloListId },
        { type: "TrelloList" },
      ],
    }),
    deleteTrelloList: builder.mutation({
      query: (trelloListId) => ({
        url: `lists/${trelloListId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "TrelloList" }],
    }),
    reorderTrelloList: builder.mutation({
      query: (data) => ({
        url: "reorder-list/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "TrelloList" }],
    }),
    copyList: builder.mutation({
      query: (data) => ({
        url: `lists/${data.id}/copy_list/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "BoardDetail" }],
    }),
    moveList: builder.mutation({
      query: (data) => ({
        url: `lists/${data.id}/move_list/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "BoardDetail" }],
    }),

    //--------------------------Card API ------------------------------//

    getCardList: builder.query({
      query: () => `cards/`,
      providesTags: [{ type: "Card" }],
    }),
    createCard: builder.mutation({
      query: (data) => ({
        url: "cards/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Card" }],
    }),
    getCard: builder.query({
      query: (cardId) => `cards/${cardId}/`,
      providesTags: (result, error) => [{ type: "Card" }],
    }),
    editCard: builder.mutation({
      query: (body) => ({
        url: `cards/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Card", id },
        { type: "Card" },
        { type: "CardDetail" },
        { type: "BoardDetail" },
      ],
    }),
    deleteCard: builder.mutation({
      query: (cardId) => ({
        url: `cards/${cardId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Card" }],
    }),
    reorderCard: builder.mutation({
      query: (data) => ({
        url: "reorder-card/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "TrelloList" }],
    }),
    copyCard: builder.mutation({
      query: (data) => ({
        url: `cards/${data.id}/copy_card/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "BoardDetail" }],
    }),
    moveCard: builder.mutation({
      query: (data) => ({
        url: `cards/${data.id}/move_card/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "BoardDetail" }],
    }),
    // Card Detail Read only API
    getCardDetail: builder.query({
      query: (cardSlug) => `card-detail/${cardSlug}/`,
      providesTags: (result, error, { cardSlug }) => [{ type: "CardDetail", slug: cardSlug }],
    }),

    //--------------------------Checklist CRUD API ------------------------------//
    getChecklists: builder.query({
      query: () => `checklists/`,
      providesTags: [{ type: "Checklist" }],
    }),
    createChecklist: builder.mutation({
      query: (data) => ({
        url: "checklists/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "CardDetail" }],
    }),
    getChecklist: builder.query({
      query: (checklistId) => `checklists/${checklistId}/`,
      providesTags: (result, error) => [{ type: "Checklist" }],
    }),
    editChecklist: builder.mutation({
      query: (body) => ({
        url: `checklists/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { checklistId }) => [{ type: "Checklist", checklistId }, { type: "Checklist" }],
    }),
    deleteChecklist: builder.mutation({
      query: (checklistId) => ({
        url: `checklists/${checklistId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "CardDetail" }],
    }),

    //--------------------------Task CRUD API ------------------------------//
    getTasks: builder.query({
      query: () => `tasks/`,
      providesTags: [{ type: "Task" }],
    }),
    createTask: builder.mutation({
      query: (data) => ({
        url: "tasks/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "CardDetail" }],
    }),
    getTask: builder.query({
      query: (taskId) => `tasks/${taskId}/`,
      providesTags: (result, error) => [{ type: "Task" }],
    }),
    editTask: builder.mutation({
      query: (body) => ({
        url: `tasks/${body.id}/?user_id=${body.user}`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { taskId }) => [{ type: "CardDetail" }],
    }),
    deleteTask: builder.mutation({
      query: (taskId) => ({
        url: `tasks/${taskId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "CardDetail" }],
    }),

    //--------------------------Card File API ------------------------------//
    createCardFile: builder.mutation({
      query: (data) => ({
        url: "card-files/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "CardFile" }],
    }),
    deleteCardFile: builder.mutation({
      query: (cardFileId) => ({
        url: `card-files/${cardFileId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "CardFile" }],
    }),

    getLabelList: builder.query({
      query: () => `labels/`,
      providesTags: [{ type: "Label" }],
    }),

    //--------------------------Label API ------------------------------//
    createLabel: builder.mutation({
      query: (data) => ({
        url: "labels/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Label" }]),
    }),
    getLabel: builder.query({
      query: (labelId) => `labels/${labelId}/`,
      providesTags: (result, error) => [{ type: "Label" }],
    }),
    editLabel: builder.mutation({
      query: (body) => ({
        url: `labels/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Label", id }, { type: "Label" }]),
    }),
    deleteLabel: builder.mutation({
      query: (labelId) => ({
        url: `labels/${labelId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Label" }]),
    }),
    assignLabel: builder.mutation({
      query: (data) => ({
        url: "card-labels/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "CardLabel" }]),
    }),

    //--------------------------Activity API ------------------------------//

    getActivityList: builder.query<any, void>({
      query: () => `activities/`,
      providesTags: [{ type: "CardDetail" }],
    }),
    createActivity: builder.mutation({
      query: (data) => ({
        url: "activities/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "CardDetail" }],
    }),
    getActivity: builder.query({
      query: (activityId) => `activities/${activityId}/`,
      providesTags: (result, error) => [{ type: "CardDetail" }],
    }),
    editActivity: builder.mutation({
      query: (body) => ({
        url: `activities/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { activityId }) => [{ type: "CardDetail", activityId }, { type: "Checklist" }],
    }),
    deleteActivity: builder.mutation({
      query: (activityId) => ({
        url: `activities/${activityId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "CardDetail" }],
    }),
    createActivityEmoji: builder.mutation({
      query: (data) => ({
        url: "activity-emojis/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "CardDetail" }],
    }),
    deleteActivityEmoji: builder.mutation({
      query: (activityEmojiId) => ({
        url: `activity-emojis/${activityEmojiId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "CardDetail" }],
    }),

    //--------------------------Archive API ------------------------------//

    // getArchiveList: builder.query<any, void>({
    //   query: () => `lists-archived/`,
    //   providesTags: [{ type: "BoardDetail" }],
    // }),
    // getArchiveCard: builder.query<any, void>({
    //   query: () => `cards-archived/`,
    //   providesTags: [{ type: "BoardDetail" }],
    // }),
    editArchiveList: builder.mutation({
      query: (body) => ({
        url: `lists-archived/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { trelloListId }) => [
        { type: "TrelloList", trelloListId },
        { type: "TrelloList" },
      ],
    }),
    editArchiveCard: builder.mutation({
      query: (body) => ({
        url: `cards-archived/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { cardId }) => [{ type: "Card", cardId }, { type: "Card" }],
    }),
    deleteArchiveList: builder.mutation({
      query: (archiveListId) => ({
        url: `lists-archived/${archiveListId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "BoardDetail" }],
    }),
    deleteArchiveCard: builder.mutation({
      query: (archiveCardId) => ({
        url: `cards-archived/${archiveCardId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "BoardDetail" }],
    }),
    getTypeBoardList: builder.query<any, void>({
      query: () => `typeboard/`,
      providesTags: [{ type: "TypeBoard" }],
    }),
    createTypeBoard: builder.mutation({
      query: (data) => ({
        url: "typeboard/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "TypeBoard" }],
    }),
    editTypeBoard: builder.mutation({
      query: (body) => ({
        url: `typeboard/${body.typeBoardId}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { typeBoardId }) => [{ type: "TypeBoard" }],
    }),
    deleteTypeBoard: builder.mutation({
      query: (typeId) => ({
        url: `typeboard/${typeId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "TypeBoard" }],
    }),


    getArchiveList: builder.query<any, number>({
      query: (boardId) => `lists-archived/${boardId}/get-archive-list/`,
      providesTags: [{ type: 'BoardDetail' }],
    }),
    // API getArchiveCard được cập nhật để nhận boardId
    getArchiveCard: builder.query<any, number>({
      query: (boardId) => `cards-archived/${boardId}/get-archive-card/`,
      providesTags: [{ type: 'BoardDetail' }],
    }),
  }),
});

export const {
  useGetSampleBoardsQuery,
  useGetSampleBoardDetailQuery,
  useCreateSampleBoardCopyMutation,
  useGetTypeBoardListQuery,
  useCreateTypeBoardMutation,
  useEditTypeBoardMutation,
  useDeleteTypeBoardMutation,
  // Board CRUD API
  useCreateBoardMutation,
  useDeleteBoardMutation,
  useArchiveBoardMutation,
  useArchiveTrueBoardMutation,
  useEditBoardMutation,
  useGetBoardListQuery,
  useGetBoardQuery,
  // THÊM USER BẢNG
  useAddUserBoardMutation,
  // RỜI BẢNG
  useLeaveBoardMutation,
  // Board Detail Read-Only API
  useGetBoardDetailQuery,
  // TrelloList CRUD API
  useCreateTrelloListMutation,
  useDeleteTrelloListMutation,
  useEditTrelloListMutation,
  useGetTrelloListListQuery,
  useGetTrelloListQuery,
  useReorderTrelloListMutation,
  // Card CRUD API
  useCreateCardMutation,
  useDeleteCardMutation,
  useEditCardMutation,
  useGetCardListQuery,
  useGetCardQuery,
  useReorderCardMutation,
  // Card Detail Read-Only API
  useGetCardDetailQuery,
  // Checklist CRUD API
  useCreateChecklistMutation,
  useDeleteChecklistMutation,
  useEditChecklistMutation,
  useGetChecklistsQuery,
  useGetChecklistQuery,
  // Task CRUD API
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useEditTaskMutation,
  useGetTasksQuery,
  useGetTaskQuery,
  // Card File CRUD API
  useCreateCardFileMutation,
  useDeleteCardFileMutation,
  // Labels
  useCreateLabelMutation,
  useDeleteLabelMutation,
  useEditLabelMutation,
  useGetLabelListQuery,
  useGetLabelQuery,
  // Gán label
  useAssignLabelMutation,
  // Activity
  useCreateActivityMutation,
  useDeleteActivityMutation,
  useEditActivityMutation,
  useGetActivityListQuery,
  useGetActivityQuery,
  // Emoji activity
  useCreateActivityEmojiMutation,
  useDeleteActivityEmojiMutation,
  // hiện lưu trữ
  useGetArchiveCardQuery,
  useGetArchiveListQuery,
  // thay đổi lưu trữ
  useEditArchiveCardMutation,
  useEditArchiveListMutation,
  // xóa lưu trữ
  useDeleteArchiveCardMutation,
  useDeleteArchiveListMutation,
  // copy
  useCopyListMutation,
  useCopyCardMutation,
  useCopyBoardMutation,
  //move
  useMoveCardMutation,
  useMoveListMutation,
  useGetBoardListSelectQuery,
} = apiTask;
