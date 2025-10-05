using Backend.Data;
using Dapper;
using FJAP.Models;

namespace FJAP.Handles.Manager
{
    public interface ISubjectHandle
    {
        Task<IEnumerable<Subject>> GetAllAsync();
        Task<SubjectDto?> GetByIdAsync(int subjectId);
        Task UpdateStatusAsync(int subjectId, bool status);
        Task<int> CreateAsync(CreateSubjectRequest request);
        Task UpdateAsync(int subjectId, UpdateSubjectRequest request);
        Task DeleteAsync(int subjectId);
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
                    sem.name AS SemesterName,
                    l.level_name AS LevelName,
                    c.class_name AS ClassName
                FROM subject s
                LEFT JOIN semester sem ON s.semester_id = sem.semester_id
                LEFT JOIN level l ON s.level_id = l.level_id
                LEFT JOIN class c ON s.class_id = c.class_id
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
        public async Task<SubjectDto?> GetByIdAsync(int subjectId)
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
                    s.class_id AS ClassId,
                    sem.name AS SemesterName,
                    l.level_name AS LevelName,
                    c.class_name AS ClassName
                FROM subject s
                LEFT JOIN semester sem ON s.semester_id = sem.semester_id
                LEFT JOIN level l ON s.level_id = l.level_id
                LEFT JOIN class c ON s.class_id = c.class_id
                WHERE s.subject_id = @SubjectId";

            return await _db.QueryFirstOrDefaultAsync<SubjectDto>(sql, new { SubjectId = subjectId });
        }

        public async Task<int> CreateAsync(CreateSubjectRequest request)
        {
            const string sql = @"
                INSERT INTO subject (
                    subject_code, 
                    subject_name, 
                    description, 
                    pass_mark, 
                    semester_id, 
                    level_id, 
                    class_id, 
                    status, 
                    created_at
                )
                VALUES (
                    @SubjectCode, 
                    @SubjectName, 
                    @Description, 
                    @PassMark, 
                    @SemesterId, 
                    @LevelId, 
                    @ClassId, 
                    @Status, 
                    @CreatedAt
                );
                SELECT LAST_INSERT_ID();";

            return await _db.ExecuteScalarAsync<int>(sql, new
            {
                request.SubjectCode,
                request.SubjectName,
                request.Description,
                request.PassMark,
                request.SemesterId,
                request.LevelId,
                request.ClassId,
                Status = "Active",
                CreatedAt = DateTime.Now
            });
        }

        public async Task UpdateAsync(int subjectId, UpdateSubjectRequest request)
        {
            const string sql = @"
                UPDATE subject
                SET 
                    subject_code = @SubjectCode,
                    subject_name = @SubjectName,
                    description = @Description,
                    pass_mark = @PassMark,
                    semester_id = @SemesterId,
                    level_id = @LevelId,
                    class_id = @ClassId
                WHERE subject_id = @SubjectId";

            var rowsAffected = await _db.ExecuteAsync(sql, new
            {
                SubjectId = subjectId,
                request.SubjectCode,
                request.SubjectName,
                request.Description,
                request.PassMark,
                request.SemesterId,
                request.LevelId,
                request.ClassId
            });

            if (rowsAffected == 0)
            {
                throw new Exception($"Subject with ID {subjectId} not found");
            }
        }
        public async Task DeleteAsync(int subjectId)
        {
            const string sql = "DELETE FROM subject WHERE subject_id = @SubjectId";
            
            var rowsAffected = await _db.ExecuteAsync(sql, new { SubjectId = subjectId });
            
            if (rowsAffected == 0)
            {
                throw new Exception($"Subject with ID {subjectId} not found");
            }
        }
    }
}