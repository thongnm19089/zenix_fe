import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiProject = createApi({
    // baseQuery: baseQueryWithAxios,
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-project/v1/`,
        prepareHeaders: (headers, { getState }) => {
            const accessToken = getAccessTokenFromCookie();
            if (accessToken) {
                headers.set("Authorization", `Bearer ${accessToken}`);
            }
            return headers;
        },
    }),
    reducerPath: "projectApi",
    tagTypes: [
        "Project",
        "Task",
        "Sheet",
        "Comment",
        "Status",
        "ProjectType",
        "Priority",
        "Difficulty",
    ],
    endpoints: (builder) => ({
        //--------------------------Project API ------------------------------//
        // Lấy danh sách dự án
        getProjects: builder.query<
            any,
            { page?: number; pageSize?: number; startDate?: string; endDate?: string; searchTerm?: string, user?: number[], status?: number[], type?: number[] }
        >({
            query: ({ page = 1, pageSize = 10, startDate, endDate, searchTerm, user, type, status }) => {
                let queryString = `projects/?page=${page}&pageSize=${pageSize}`;
                if (startDate) queryString += `&startDate=${startDate}`;
                if (endDate) queryString += `&endDate=${endDate}`;
                if (searchTerm) queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
                if (user) queryString += `&user=${user.toString()}`;
                if (type) queryString += `&type=${type.toString()}`;
                if (status) queryString += `&status=${status.toString()}`;
                return queryString;
            },
            providesTags: [{ type: "Project" }],
        }),

        getProjectDetail: builder.query<any, string>({
            query: (projectId) => `projects/${projectId}/`,
            providesTags: ["Project"],
        }),
        // Lấy trạng thái của tất cả dự án
        getProjectStatusList: builder.query<any, void>({
            query: () => `project-status/`,
            providesTags: [{ type: "Status" }],
        }),
        getProjectTypeList: builder.query<any, void>({
            query: () => `project-type/`,
            providesTags: [{ type: "ProjectType" }],
        }),
        // Lấy trạng thái của dự án bằng id dự án
        getProjectStatusQuery: builder.query<any, { projectId: string }>({
            query: ({ projectId }) => `projects/${projectId}/`,
            providesTags: ["Status"],
        }),
        getComments: builder.query<any, void>({
            query: () => "comments/",
            providesTags: ["Comment"],
        }),
        createProject: builder.mutation<any, { name: string; description: string }>(
            {
                query: (newProject) => ({
                    url: "projects/",
                    method: "POST",
                    body: newProject,
                }),
                invalidatesTags: ["Project"],
            }
        ),
        createProjectStatus: builder.mutation({
            query: (body) => ({
                url: "project-status/",
                method: "POST",
                body: body,
            }),
            invalidatesTags: ["Status"],
        }),
        createProjectType: builder.mutation({
            query: (body) => ({
                url: "project-type/",
                method: "POST",
                body: body,
            }),
            invalidatesTags: ["ProjectType"],
        }),
        createSheets: builder.mutation<any, { name: string; project: string }>({
            query: (newSheet) => ({
                url: "sheets/",
                method: "POST",
                body: newSheet,
            }),
        }),
        createTasks: builder.mutation({
            query: (body) => ({
                url: "tasks/",
                method: "POST",
                body: body,
            }),
            invalidatesTags: ["Task"],
        }),
        createTaskStatus: builder.mutation({
            query: (body) => ({
                url: "statuses/",
                method: "POST",
                body: body,
            }),
            invalidatesTags: ["Status"],
        }),
        createTaskPriority: builder.mutation({
            query: (body) => ({
                url: "priorities/",
                method: "POST",
                body: body,
            }),
            invalidatesTags: ["Priority"],
        }),
        createTaskDifficulty: builder.mutation({
            query: (body) => ({
                url: "difficulties/",
                method: "POST",
                body: body,
            }),
            invalidatesTags: ["Difficulty"],
        }),
        updateProjectStatus: builder.mutation({
            query: (body) => ({
                url: `project-status/${body.id}/`,
                method: "PATCH",
                body: body,
            }),
            invalidatesTags: ["Status"],
        }),
        updateProjectType: builder.mutation({
            query: (body) => ({
                url: `project-type/${body.id}/`,
                method: "PATCH",
                body: body,
            }),
            invalidatesTags: ["ProjectType"],
        }),
        updateProject: builder.mutation({
            query: (body) => ({
                url: `projects/${body.id}/`,
                method: "PATCH",
                body: body,
            }),
            invalidatesTags: ["Project"],
        }),
        updateTask: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `tasks/${id}/`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Task"],
        }),
        deleteProject: builder.mutation<any, { id: string }>({
            query: ({ id }) => ({
                url: `projects/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Project"],
        }),
        deleteProjectStatus: builder.mutation({
            query: (id) => ({
                url: `project-status/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Status"],
        }),
        deleteProjectType: builder.mutation({
            query: (id) => ({
                url: `project-type/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["ProjectType"],
        }),
        deleteSheet: builder.mutation<any, { id: string }>({
            query: ({ id }) => ({
                url: `sheets/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Sheet"],
        }),
        deleteTask: builder.mutation<any, { id: string }>({
            query: ({ id }) => ({
                url: `tasks/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Task"],
        }),
    }),
});

export const {
    // Project CRUD API
    useGetProjectsQuery,
    useGetProjectDetailQuery,
    useGetProjectStatusListQuery,
    useGetProjectTypeListQuery,
    useGetCommentsQuery,
    useCreateProjectMutation,
    useCreateProjectTypeMutation,
    useCreateTaskStatusMutation,
    useCreateTaskPriorityMutation,
    useCreateTaskDifficultyMutation,
    useCreateProjectStatusMutation,
    useUpdateProjectStatusMutation,
    useUpdateProjectTypeMutation,
    useUpdateProjectMutation,
    useUpdateTaskMutation,
    useCreateSheetsMutation,
    useCreateTasksMutation,
    useDeleteProjectMutation,
    useDeleteProjectStatusMutation,
    useDeleteProjectTypeMutation,
    useDeleteSheetMutation,
    useDeleteTaskMutation,
} = apiProject;
