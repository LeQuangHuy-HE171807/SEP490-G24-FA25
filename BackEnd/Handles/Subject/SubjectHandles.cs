using Backend.Data;
using Dapper;
using FJAP.Models;

namespace FJAP.Handles.Manager
{
    // Interface để DI vào controller
    public interface ISubjectHandle
    {
        Task<IEnumerable<Subject>> GetAllAsync();
        Task UpdateStatusAsync(int subjectId, bool status);
        // sau này có thể thêm: GetByIdAsync, CreateAsync, UpdateAsync, DeleteAsync...
    }

    // Triển khai Handle: chứa SQL, gọi Db helper chung
    public class SubjectHandle : ISubjectHandle
    {
        private readonly MySqlDb _db;

        public SubjectHandle(MySqlDb db) => _db = db;

        public async Task<IEnumerable<Subject>> GetAllAsync()
        {
            const string sql = @"
                SELECT
                    s.subject_id AS SubjectId,
                    s.subject_code AS SubjectCode,
                    s.subject_name AS SubjectName,
                    s.status AS Status,
                    s.description AS Description,
                    s.pass_mark AS PassMark,
                    s.created_at AS CreatedAt,
                    s.semester_id AS SemesterId,
                    s.level_id AS LevelId,
                    s.class_id AS ClassId
                FROM subject s
                ORDER BY s.created_at DESC";

            return await _db.QueryAsync<Subject>(sql);
        }

        public async Task UpdateStatusAsync(int subjectId, bool status)
        {
            const string sql = @"
                UPDATE subject
                SET status = @Status
                WHERE subject_id = @SubjectId";

            await _db.ExecuteAsync(sql, new
            {
                Status = status ? "Active" : "Inactive",
                SubjectId = subjectId
            });
        }
    }
}