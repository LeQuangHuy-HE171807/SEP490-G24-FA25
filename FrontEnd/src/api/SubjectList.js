import http from "./http";

class SubjectList {
  // Lấy tất cả subjects
  static async getAll() {
    const response = await http.get("api/manager/subjects");
    return response.data;
  }

  // Lấy subjects với thông tin chi tiết (JOIN)
  static async getDetails() {
    const response = await http.get("api/manager/subjects/details");
    return response.data;
  }

  // Lấy subject theo ID
  static async getById(subjectId) {
    const response = await http.get(`api/manager/subjects/${subjectId}`);
    return response.data;
  }

  // Lấy subject theo code
  static async getByCode(subjectCode) {
    const response = await http.get(`api/manager/subjects/code/${subjectCode}`);
    return response.data;
  }

  // Lấy subjects theo class ID
  static async getByClassId(classId) {
    const response = await http.get(`api/manager/subjects/class/${classId}`);
    return response.data;
  }

  // Lấy subjects theo semester ID
  static async getBySemesterId(semesterId) {
    const response = await http.get(
      `api/manager/subjects/semester/${semesterId}`
    );
    return response.data;
  }

  // Lấy subjects theo level ID
  static async getByLevelId(levelId) {
    const response = await http.get(`api/manager/subjects/level/${levelId}`);
    return response.data;
  }

  // Tạo subject mới
  static async create(subjectData) {
    const response = await http.post("api/manager/subjects", subjectData);
    return response.data;
  }

  // Cập nhật subject
  static async update(subjectId, subjectData) {
    const response = await http.put(
      `api/manager/subjects/${subjectId}`,
      subjectData
    );
    return response.data;
  }

  // Xóa subject
  static async delete(subjectId) {
    const response = await http.delete(`api/manager/subjects/${subjectId}`);
    return response.data;
  }

  // Cập nhật trạng thái subject
  static async updateStatus(subjectId, status) {
    const response = await http.patch(
      `api/manager/subjects/${subjectId}/status`,
      {
        status,
      }
    );
    return response.data;
  }
  static async getFormOptions() {
    const response = await http.get("api/manager/subjects/options");
    return response.data;
  }
}

export default SubjectList;
