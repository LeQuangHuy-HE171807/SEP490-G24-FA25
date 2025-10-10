import { api } from "./http";

class SubjectList {
  static async getAll() {
    const response = await api.get("/api/manager/subjects");
    return response.data;
  }

  static async getDetails() {
    const response = await api.get("/api/manager/subjects/details");
    return response.data;
  }

  static async getById(subjectId) {
    const response = await api.get(`/api/manager/subjects/${subjectId}`);
    return response.data;
  }

  static async getByCode(subjectCode) {
    const response = await api.get(`/api/manager/subjects/code/${subjectCode}`);
    return response.data;
  }

  static async getByClassId(classId) {
    const response = await api.get(`/api/manager/subjects/class/${classId}`);
    return response.data;
  }

  static async getBySemesterId(semesterId) {
    const response = await api.get(
      `/api/manager/subjects/semester/${semesterId}`
    );
    return response.data;
  }

  static async getByLevelId(levelId) {
    const response = await api.get(`/api/manager/subjects/level/${levelId}`);
    return response.data;
  }

  static async create(subjectData) {
    const response = await api.post("/api/manager/subjects", subjectData);
    return response.data;
  }

  static async update(subjectId, subjectData) {
    const response = await api.put(
      `/api/manager/subjects/${subjectId}`,
      subjectData
    );
    return response.data;
  }

  static async delete(subjectId) {
    const response = await api.delete(`/api/manager/subjects/${subjectId}`);
    return response.data;
  }

  static async updateStatus(subjectId, status) {
    const response = await api.patch(
      `/api/manager/subjects/${subjectId}/status`,
      { status }
    );
    return response.data;
  }

  static async getFormOptions() {
    const response = await api.get("/api/manager/subjects/options");
    return response.data;
  }
}

export default SubjectList;
