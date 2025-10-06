import http from "./http";

class ClassList {
  static async getAll() {
    const response = await http.get("api/manager/classes");
    return response.data.data;
  }

  static async getDetail(classId) {
    const response = await http.get(`api/manager/classes/${classId}`);
    return response.data.data;
  }

  static async updateStatus(classId, status) {
    const response = await http.patch(`api/manager/classes/${classId}/status`, {
      status,
    });
    return response.data;
  }

  static async getFormOptions() {
    try {
      const response = await http.get("api/manager/classes/options");
      return response.data;
    } catch (error) {
      if (error?.response?.status === 404) {
        const fallback = await http.get("api/manager/subjects/options");
        return fallback.data;
      }
      throw error;
    }
  }

  static async create(classData) {
    const response = await http.post("api/manager/classes", classData);
    return response.data;
  }

  static async update(classId, classData) {
    const response = await http.put(`api/manager/classes/${classId}`, classData);
    return response.data;
  }

  static async getInfo(classId) {
    const response = await http.get(`api/manager/classes/${classId}/info`);
    return response.data;
  }
}

export default ClassList;
