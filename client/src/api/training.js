import { api } from './client';

export const trainingApi = {
  listCourses: () =>
    api.get('/training/courses').then(r => r.data),
  getCourseById: (id) =>
    api.get(`/training/courses/${id}`).then(r => r.data),
  getEmployeeTraining: (employeeId) =>
    api.get(`/training/employee/${employeeId}`).then(r => r.data),
  getCourseQuiz: (courseId) =>
    api.get(`/training/courses/${courseId}/quiz`).then(r => r.data),
  submitQuiz: (courseId, data) =>
    api.post(`/training/courses/${courseId}/quiz/submit`, data).then(r => r.data),
  updateProgress: (data) =>
    api.post('/training/progress', data).then(r => r.data),
};
