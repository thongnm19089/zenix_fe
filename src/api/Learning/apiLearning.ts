import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessTokenFromCookie } from "@/utils/token";
export interface AssignmentFile {
  id: number;
  file: string;
  assignment: number;
}

export interface Certificate {
  id: number;
  created: string;
  issued_date: string;
  certificate_file: string | null;
  feedback: string;
  status: string;
  student: number;
  course: number;
  created_by: number;
  approved_by: number | null;
}
export interface Assignment {
  find(arg0: (answer: any) => boolean): unknown;
  answer_list: Assignment | undefined;
  id: number;
  files: AssignmentFile[];
  order: number;
  created: string;
  title: string;
  description: string;
  due_date: string;
  course: number;
  module: number;
  lesson: number;

  students: number[];
  user_str: string;
  course_str: string;
  module_str: string;
  lesson_str: string;

}

export interface AssignmentAnswer {
  id: number;
  answer: string;
  score: number | null;
  feedback: string | null;
  student: number;
  assignment: Assignment;
}

export const apiLearning = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-learning/v1/`,
    prepareHeaders: (headers) => {
      const accessToken = getAccessTokenFromCookie();
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return headers;
    },
  }),
  reducerPath: "learningApi",
  tagTypes: ["Category", "SubCategory", "Course", "Module", "Lesson", "Assignment", "AssignmentAnswer", "Certificate", "Progress"],
  endpoints: (builder) => ({
    //--------------------------Categories ------------------------------//
    getCategoryList: builder.query({
      query: () => `categories/`,
      providesTags: [{ type: "Category" }],
    }),
    getCategory: builder.query({
      query: (catId) => `categories/${catId}/`,
      providesTags: (result, error) => [{ type: "Category" }],
    }),
    createCategory: builder.mutation({
      query: (data) => ({
        url: "categories/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Category" }],
    }),
    editCategory: builder.mutation({
      query: (body) => ({
        url: `categories/${body.categoryId}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { categoryId }) => [{ type: "Category" }],
    }),
    deleteCategory: builder.mutation({
      query: (catId) => ({
        url: `categories/${catId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Category" }],
    }),

    //--------------------------SubCategories ------------------------------//
    getSubCategoryList: builder.query({
      query: () => `subcategories/`,
      providesTags: [{ type: "SubCategory" }],
    }),
    getSubCategory: builder.query({
      query: (subCatId) => `subcategories/${subCatId}/`,
      providesTags: (result, error) => [{ type: "SubCategory" }],
    }),
    createSubCategory: builder.mutation({
      query: (data) => ({
        url: "subcategories/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "SubCategory" }],
    }),
    editSubCategory: builder.mutation({
      query: (body) => ({
        url: `subcategories/${body.subCategoryId}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { subCategoryId }) => [{ type: "SubCategory" }],
    }),
    deleteSubCategory: builder.mutation({
      query: (subCatId) => ({
        url: `subcategories/${subCatId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "SubCategory" }],
    }),

    // Courses
    getCourseMarket: builder.query({
      query: ({ page, pageSize, searchTerm }) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page);
        if (pageSize) params.append("pageSize", pageSize);
        if (searchTerm) params.append("searchTerm", searchTerm);
        return `course-market/?${params.toString()}`;
      },
      providesTags: ["Course"],
    }),
    getCourse: builder.query({
      query: (id) => `courses/${id}/`,
      providesTags: (result, error, id) => [{ type: "Course", id }],
    }),
    getCourseDetail: builder.query({
      query: (id) => `course-detail/${id}/`,
      providesTags: (result, error, id) => [{ type: "Course", id }],
    }),
    createCourse: builder.mutation({
      query: (data) => ({
        url: "courses/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Course"],
    }),
    updateCourse: builder.mutation({
      query: ({ courseId, data }) => ({
        url: `courses/${courseId}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Course"],
    }),
    deleteCourse: builder.mutation({
      query: (courseId) => ({
        url: `courses/${courseId}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course"],
    }),
    getCompanyCourses: builder.query({
      query: ({ page, pageSize, searchTerm }) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page);
        if (pageSize) params.append("pageSize", pageSize);
        if (searchTerm) params.append("searchTerm", searchTerm);
        return `course-company/?${params.toString()}`;
      },
      providesTags: ["Course"],
    }),
    getMyCourses: builder.query({
      query: ({ page, pageSize, searchTerm }) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page);
        if (pageSize) params.append("pageSize", pageSize);
        if (searchTerm) params.append("searchTerm", searchTerm);
        return `course-me/?${params.toString()}`;
      },
      providesTags: ["Course"],
    }),
    getAdminCourses: builder.query({
      query: ({ page, pageSize, searchTerm }) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page);
        if (pageSize) params.append("pageSize", pageSize);
        if (searchTerm) params.append("searchTerm", searchTerm);
        return `course-admin/?${params.toString()}`;
      },
      providesTags: ["Course"],
    }),

    // Modules
    createModule: builder.mutation({
      query: (formData) => ({
        url: "/modules/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Module"],
    }),
    updateModule: builder.mutation({
      query: ({ id, data }) => ({
        url: `/modules/${id}/`,
        method: 'PATCH',
        body: data, // Ensure this is the FormData object
      }),
      invalidatesTags: ['Module'],
    }),
    deleteModule: builder.mutation({
      query: (moduleId) => ({
        url: `/modules/${moduleId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Module" }],
    }),

    // Lessons
    createLesson: builder.mutation({
      query: (formData) => ({
        url: "/lessons/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Lesson"],
    }),
    updateLesson: builder.mutation({
      query: ({ id, data }) => ({
        url: `/lessons/${id}/`,
        method: 'PATCH',
        body: data, // Ensure this is the FormData object
      }),
      invalidatesTags: ['Lesson'],
    }),
    deleteLesson: builder.mutation({
      query: (lessonId) => ({
        url: `/lessons/${lessonId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Lesson" }],
    }),

    // Enrollments  
    createJoinEnrollment: builder.mutation({
      query: (data) => ({
        url: `enrollments/`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response, meta, error) => {
        if (error && error.status === 400) {
          return {error}; 
        }
        return response;
      },
      invalidatesTags: ["Course"]
    }),
    createEnrollment: builder.mutation({
      query: (data) => ({
        url: `enrollments/create-multiple-students/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Course"], // Invalidate Course cache after creating enrollment
    }),
    updateEnrollment: builder.mutation({
      query: ({ id, data }) => ({
        url: `enrollments/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Course"],
    }),
    deleteEnrollment: builder.mutation({
      query: (id) => ({
        url: `enrollments/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course"],
    }),

    // Assignments
    getAssignmentAdminList: builder.query({
      query: () => "assignments-admin",
      providesTags: ["Assignment"],
    }),
    getAssignmentMeList: builder.query({
      query: () => "assignments-me",
      providesTags: ["Assignment"],
    }),
    createAssignment: builder.mutation({
      query: (data: any) => ({
        url: "assignments-admin/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Assignment"],
    }),
    updateAssignment: builder.mutation({
      query: ({ assignmentId, ...data }) => ({
        url: `assignments-admin/${assignmentId}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Assignment"],
    }),
    deleteAssignment: builder.mutation({
      query: (assignmentId) => ({
        url: `assignments-admin/${assignmentId}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Assignment"],
    }),
    getAssignmentDetail: builder.query<Assignment, number>({
      query: (id) => `assignments-me/${id}/`,
    }),

    // Assignment Answers
    getAdminGradeAssignmentAnswers: builder.query({
      query: ({ page, pageSize, searchTerm }) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page);
        if (pageSize) params.append("pageSize", pageSize);
        if (searchTerm) params.append("searchTerm", searchTerm);
        return `assignment-answers/grade/?${params.toString()}`;
      },
      providesTags: ["Assignment"],
    }),

    getAssignmentAnswer: builder.query({
      query: (assignmentId) => `assignment-answers/${assignmentId}/`,
      providesTags: (result, error, assignmentId) => [{ type: "AssignmentAnswer", assignmentId }],
    }),
    createAssignmentAnswer: builder.mutation<AssignmentAnswer, FormData>({
      query: (formData) => ({
        url: "assignment-answers/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["AssignmentAnswer"],
    }),
    updateAssignmentAnswer: builder.mutation<AssignmentAnswer, { answerId: number; data: FormData }>({
      query: ({ answerId, data }) => ({
        url: `assignment-answers/${answerId}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["AssignmentAnswer"],
    }),
    updateAssignmentAnswerForAdmin: builder.mutation<AssignmentAnswer, { answerId: number; data: FormData }>({
      query: ({ answerId, data }) => ({
        url: `assignment-answers/${answerId}/update-for-admin/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["AssignmentAnswer"],
    }),
    deleteAssignmentAnswer: builder.mutation<{ success: boolean }, number>({
      query: (answerId) => ({
        url: `assignment-answers/${answerId}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["AssignmentAnswer"],
    }),

    // Certificates
    getCourseCertificates: builder.query({
      query: (courseId) => `courses/${courseId}/certificates/`,
      providesTags: ["Certificate"],
    }),
    getCertificate: builder.query({
      query: (id) => `certificates/${id}/`,
      providesTags: (result, error, id) => [{ type: "Certificate", id }],
    }),

    getCertificatesByStudent: builder.query<Certificate[], number>({
      query: (studentId) => `certificates-student/${studentId}/`,
    }),
    createCertificate: builder.mutation({
      query: (data) => ({
        url: "certificates/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Certificate"],
    }),
    updateCertificateStatus: builder.mutation({
      query: ({ certificateId, status }) => ({
        url: `certificates/${certificateId}/`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Certificate"],
    }),
    deleteCertificate: builder.mutation<void, number>({
      query: (id) => ({
        url: `certificates/${id}/`,
        method: "DELETE",
      }),
    }),

    // Progress
    getCourseProgress: builder.query({
      query: (courseId) => `courses/${courseId}/progress/`,
      providesTags: ["Progress"],
    }),
    updateOrCreateProgress: builder.mutation({
      query: (data) => ({
        url: `progress/update_or_create_progress/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Progress"],
    }),

    //--------------------------Set Up Course ------------------------------//
    getSetUpLearning: builder.query({
      query: () => `set-up-learning/`,
    }),
  }),
});

export const {
  // Categories
  useGetCategoryListQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useEditCategoryMutation,
  useDeleteCategoryMutation,

  // SubCategories
  useGetSubCategoryListQuery,
  useGetSubCategoryQuery,
  useCreateSubCategoryMutation,
  useEditSubCategoryMutation,
  useDeleteSubCategoryMutation,

  // Courses
  useGetCourseQuery,
  useGetCourseDetailQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetCourseMarketQuery,
  useGetCompanyCoursesQuery,
  useGetMyCoursesQuery,
  useGetAdminCoursesQuery,

  // Modules
  useCreateModuleMutation,
  useUpdateModuleMutation,
  useDeleteModuleMutation,

  // Lessons 
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,

  // Enrollments
  useCreateJoinEnrollmentMutation,
  useCreateEnrollmentMutation,
  useUpdateEnrollmentMutation,
  useDeleteEnrollmentMutation,

  // Assignments
  useGetAssignmentAdminListQuery,
  useGetAssignmentMeListQuery,
  useGetAssignmentDetailQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,

  // AssignmentAnswers  
  useGetAdminGradeAssignmentAnswersQuery,
  useGetAssignmentAnswerQuery,
  useCreateAssignmentAnswerMutation,
  useUpdateAssignmentAnswerMutation,
  useUpdateAssignmentAnswerForAdminMutation,
  useDeleteAssignmentAnswerMutation,

  // CourseCertificates  
  useGetCourseCertificatesQuery,
  useGetCertificateQuery, // Added this
  useGetCertificatesByStudentQuery, // get danh sách certi của tôi , get theo student id
  useDeleteCertificateMutation, //delate certi
  useCreateCertificateMutation,
  useUpdateCertificateStatusMutation,

  // CourseProgress   
  useGetCourseProgressQuery,
  useUpdateOrCreateProgressMutation, // Add this

  // Set Up Learning
  useGetSetUpLearningQuery,

} = apiLearning;
