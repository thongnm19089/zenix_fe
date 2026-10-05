import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiHRApp = createApi({
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
  reducerPath: "hrAppApi",
  tagTypes: [
    "Job",
    "Application",
    "ApplicationNote",
    "ApplicationInterviewSchedule",
    "EmployeeContract",
    "Kpi",
  ],
  endpoints: (builder) => ({
    getJobList: builder.query<
      any,
      {
        page?: number;
        pageSize?: number;
        startDate?: string;
        endDate?: string;
        searchTerm?: string;
        location?: number[];
      }
    >({
      query: ({
        page = 1,
        pageSize = 10,
        startDate,
        endDate,
        searchTerm,
        location,
      }) => {
        let queryString = `job/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (searchTerm)
          queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (location) queryString += `&locationIds=${location.toString()}`;
        return queryString;
      },
      providesTags: [{ type: "Job" }],
    }),

    getAllJobList: builder.query<any,void>({
      query: () => `job/?pageSize=10000`,
      providesTags: [{type: "Job"}],
    }),

    createJob: builder.mutation({
      query: (data) => ({
        url: "job/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error) => (error ? [] : [{ type: "Job" }]),
    }),

    createMultiJob: builder.mutation({
      query: (data) => ({
        url: "job/create-multiple-jobs/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error) => (error ? [] : [{ type: "Job" }]),
    }),

    getJob: builder.query({
      query: ({ jobId }) => `job/${jobId}/`,
      providesTags: (result, error, { jobId }) => [{ type: "Job", id: jobId }],
    }),

    editJob: builder.mutation({
      query: ({ id, formData }) => ({
        url: `job/${id}/`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "Job", id }, { type: "Job" }],
    }),

    deleteJob: builder.mutation({
      query: ({ jobId }) => ({
        url: `job/${jobId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => (error ? [] : [{ type: "Job" }]),
    }),

    getApplicationList: builder.query<
      any,
      {
        page?: number;
        pageSize?: number;
        startDate?: string;
        endDate?: string;
        searchTerm?: string;
        job?: number[];
        status?: number[];
        source?: number[];
        location?: number[];
        hunter?: number[];
        handler?: number[];
        paid?: boolean;
      }
    >({
      query: ({
        page = 1,
        pageSize = 10,
        startDate,
        endDate,
        searchTerm,
        job,
        status,
        source,
        location,
        hunter,
        handler,
        paid,
      }) => {
        let queryString = `application/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (searchTerm)
          queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (job) queryString += `&job=${job.toString()}`;
        if (status) queryString += `&status=${status.toString()}`;
        if (source) queryString += `&source=${source.toString()}`;
        if (location) queryString += `&location=${location.toString()}`;
        if (hunter) queryString += `&hunter=${hunter.toString()}`;
        if (handler) queryString += `&handler=${handler.toString()}`;
        if (paid) queryString += `&paid=${paid}`;
        return queryString;
      },
      providesTags: [{ type: "Application" }],
    }),

    getAllApplicationList: builder.query<any, void>({
      query: () => `application/?pageSize=10000`,
      providesTags: [{ type: "Application" }],
    }),


    createApplication: builder.mutation({
      query: (data) => ({
        url: "application/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error) =>
        error ? [] : [{ type: "Application" }],
    }),

    createMultiApplication: builder.mutation({
      query: (data) => ({
        url: "application/create-multiple-applications/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error) =>
        error ? [] : [{ type: "Application" }],
    }),

    getApplication: builder.query({
      query: ({ applicationId }) => `application/${applicationId}/`,
      providesTags: (result, error, { applicationId }) => [
        { type: "Application", id: applicationId },
      ],
    }),
    editApplication: builder.mutation({
      query: ({ id, formData }) => ({
        url: `application/${id}/`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "Application", id }, { type: "Application" }],
    }),
    deleteApplication: builder.mutation({
      query: ({ applicationId }) => ({
        url: `application/${applicationId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) =>
        error ? [] : [{ type: "Application" }],
    }),
    getApplicationNoteList: builder.query({
      query: () => `application-note/`,
      providesTags: [{ type: "ApplicationNote" }],
    }),

    createApplicationNote: builder.mutation({
      query: (data) => ({
        url: "application-note/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error) =>
        error ? [] : [{ type: "ApplicationNote" }],
    }),

    getApplicationNote: builder.query({
      query: ({ applicationNoteId }) =>
        `application-note?${applicationNoteId}`,
      providesTags: (result, error, { applicationNoteId }) => [
        { type: "ApplicationNote", id: applicationNoteId },
      ],
    }),
    editApplicationNote: builder.mutation({
      query: (body) => ({
        url: `application-note/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) =>
        error
          ? []
          : [{ type: "ApplicationNote", id }, { type: "ApplicationNote" }],
    }),
    deleteApplicationNote: builder.mutation({
      query: ({ applicationNoteId }) => ({
        url: `application-note/${applicationNoteId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ApplicationNote" }],
    }),
    getApplicationInterviewScheduleList: builder.query({
      query: () => `application-interview-schedule/`,
      providesTags: [{ type: "ApplicationInterviewSchedule" }],
    }),

    createApplicationInterviewSchedule: builder.mutation({
      query: (data) => ({
        url: "application-interview-schedule/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error) =>
        error
          ? []
          : [{ type: "ApplicationInterviewSchedule" }, { type: "Application" }],
    }),

    getApplicationInterviewSchedule: builder.query({
      query: ({ applicationInterviewScheduleId }) =>
        `application-interview-schedule/${applicationInterviewScheduleId}/`,
      providesTags: (result, error, { applicationInterviewScheduleId }) => [
        {
          type: "ApplicationInterviewSchedule",
          id: applicationInterviewScheduleId,
        },
      ],
    }),
    editApplicationInterviewSchedule: builder.mutation({
      query: (body) => ({
        url: `application-interview-schedule/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) =>
        error
          ? []
          : [
            { type: "ApplicationInterviewSchedule", id },
            { type: "ApplicationInterviewSchedule" },
            { type: "Application" },
          ],
    }),
    deleteApplicationInterviewSchedule: builder.mutation({
      query: ({ applicationInterviewScheduleId }) => ({
        url: `application-interview-schedule/${applicationInterviewScheduleId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) =>
        error ? [] : [{ type: "ApplicationInterviewSchedule" }],
    }),
    getEmployeeContractList: builder.query<
      any,
      {
        page?: number;
        pageSize?: number;
        startDate?: string;
        endDate?: string;
        searchTerm?: string;
        employee?: number[];
        type?: number[];
        duration?: number[]
      }
    >({
      query: ({ page = 1, pageSize = 10, startDate, endDate, searchTerm, employee, type, duration }) => {
        let queryString = `employee-contract/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (searchTerm)
          queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (employee) queryString += `&employee=${employee.toString()}`;
        if (type) queryString += `&type=${type.toString()}`;
        if (duration) queryString += `&duration=${duration.toString()}`
        return queryString;
      },
      providesTags: [{ type: "EmployeeContract" }],
    }),

    getAllEmployeeContractList: builder.query<any,void>({
      query: () => `employee-contract/?pageSize=10000`,
      providesTags: [{ type: "EmployeeContract"}],
    }),

    createEmployeeContract: builder.mutation({
      query: (data) => ({
        url: "employee-contract/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error) =>
        error ? [] : [{ type: "EmployeeContract" }],
    }),
    createMultiEmployeeContract: builder.mutation({
      query: (data) => ({
        url: "employee-contract/create-multiple-employee-contracts/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error) =>
        error ? [] : [{ type: "EmployeeContract" }],
    }),

    getEmployeeContract: builder.query({
      query: ({ employeeContractId }) =>
        `employee-contract/${employeeContractId}/`,
      providesTags: (result, error, { employeeContractId }) => [
        { type: "EmployeeContract", id: employeeContractId },
      ],
    }),
    editEmployeeContract: builder.mutation({
      query: ({ id, formData }) => ({
        url: `employee-contract/${id}/`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) =>
        error
          ? []
          : [{ type: "EmployeeContract", id }, { type: "EmployeeContract" }],
    }),
    deleteEmployeeContract: builder.mutation({
      query: ({ employeeContractId }) => ({
        url: `employee-contract/${employeeContractId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) =>
        error ? [] : [{ type: "EmployeeContract" }],
    }),

    getKpiList: builder.query<
      any,
      {
        page?: number;
        pageSize?: number;
        startDate?: string;
        endDate?: string;
        searchTerm?: string;
        kpi_type?: number[];
        user?: number[];
      }
    >({
      query: ({
        page = 1,
        pageSize = 10,
        startDate,
        endDate,
        searchTerm,
        kpi_type,
        user
      }) => {
        let queryString = `kpi/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (searchTerm)
          queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (kpi_type) queryString += `&kpi_type=${kpi_type.toString()}`;
        if (user) queryString += `&user=${user.toString()}`;
        return queryString;
      },
      providesTags: [{ type: "Kpi" }],
    }),

    getAllKpiList: builder.query<any, void>({
      query: () => `kpi/?pageSize=10000`,
      providesTags: [{ type: "Kpi" }],
    }),

    createKpi: builder.mutation({
      query: (data) => ({
        url: "kpi/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error) => (error ? [] : [{ type: "Kpi" }]),
    }),

    getKpi: builder.query({
      query: ({ kpiId }) => `kpi/${kpiId}/`,
      providesTags: (result, error, { kpiId }) => [{ type: "Kpi", id: kpiId }],
    }),
    editKpi: builder.mutation({
      query: (body) => ({
        url: `kpi/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "Kpi", id }, { type: "Kpi" }],
    }),
    deleteKpi: builder.mutation({
      query: ({ kpiId }) => ({
        url: `kpi/${kpiId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => (error ? [] : [{ type: "Kpi" }]),
    }),
  }),
});

export const {
  //Application Interview
  useGetApplicationInterviewScheduleListQuery,
  useGetApplicationInterviewScheduleQuery,
  useCreateApplicationInterviewScheduleMutation,
  useDeleteApplicationInterviewScheduleMutation,
  useEditApplicationInterviewScheduleMutation,
  //Application Note
  useGetApplicationNoteListQuery,
  useGetApplicationNoteQuery,
  useCreateApplicationNoteMutation,
  useEditApplicationNoteMutation,
  useDeleteApplicationNoteMutation,
  //Job
  useGetJobListQuery,
  useGetAllJobListQuery,
  useGetJobQuery,
  useCreateJobMutation,
  useCreateMultiJobMutation,
  useEditJobMutation,
  useDeleteJobMutation,
  //Application
  useGetApplicationListQuery,
  useGetAllApplicationListQuery,
  useGetApplicationQuery,
  useCreateApplicationMutation,
  useCreateMultiApplicationMutation,
  useEditApplicationMutation,
  useDeleteApplicationMutation,
  //Employee Contract
  useGetEmployeeContractListQuery,
  useGetAllEmployeeContractListQuery,
  useGetEmployeeContractQuery,
  useCreateEmployeeContractMutation,
  useCreateMultiEmployeeContractMutation,
  useDeleteEmployeeContractMutation,
  useEditEmployeeContractMutation,
  //Kpi
  useGetKpiListQuery,
  useGetAllKpiListQuery,
  useGetKpiQuery,
  useCreateKpiMutation,
  useDeleteKpiMutation,
  useEditKpiMutation,
} = apiHRApp;
