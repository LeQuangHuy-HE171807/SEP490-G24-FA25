using System;
using System.Linq;
using Backend.Data;
using Dapper;
using FAJP.Models;
using FJAP.Models;

namespace FJAP.Handles.Manager
{
    public interface IClassHandle
    {
        Task<IEnumerable<Class>> GetAllAsync();
        Task<IEnumerable<ClassSubjectDetail>> GetSubjectsAsync(string classId);
        Task UpdateStatusAsync(string classId, bool status);
        Task<IEnumerable<LookupItem>> GetAllActiveAsync();
        Task<ClassEditInfo?> GetEditInfoAsync(string classId);
        Task<string> CreateAsync(CreateClassRequest request);
        Task UpdateAsync(string classId, UpdateClassRequest request);
    }

    public class ClassHandle : IClassHandle
    {
        private readonly MySqlDb _db;

        public ClassHandle(MySqlDb db) => _db = db;

        public async Task<IEnumerable<Class>> GetAllAsync()
        {
            const string sql = @"
                SELECT
                    c.class_id,
                    c.class_name,
                    s.name        AS semester,
                    s.start_date,
                    s.end_date,
                    c.Status      AS status,
                    c.semester_id,
                    c.level_id
                FROM class c
                JOIN semester s ON c.semester_id = s.semester_id
                ORDER BY s.start_date DESC, c.class_name;";

            return await _db.QueryAsync<Class>(sql);
        }

        public async Task<IEnumerable<ClassSubjectDetail>> GetSubjectsAsync(string classId)
        {
            const string sql = @"
                                SELECT
                                    c.class_id,
                                    c.class_name,
                                    sub.subject_name,
                                    l.level_name AS subject_level,
                                    COUNT(DISTINCT e.student_id) AS total_students
                                FROM class c
                                JOIN subject sub ON sub.class_id = c.class_id
                                JOIN level l ON sub.level_id = l.level_id
                                LEFT JOIN enrollment e ON e.class_id = c.class_id
                                WHERE c.class_id = @ClassId
                                GROUP BY
                                    c.class_id,
                                    c.class_name,
                                    sub.subject_id,
                                    sub.subject_name,
                                    l.level_name;";

            return await _db.QueryAsync<ClassSubjectDetail>(sql, new { ClassId = classId });
        }

        public async Task UpdateStatusAsync(string classId, bool status)
        {
            const string sql = @"
                UPDATE class
                SET Status = @Status
                WHERE class_id = @ClassId";

            await _db.ExecuteAsync(sql, new
            {
                Status = status ? "Active" : "Inactive",
                ClassId = classId
            });
        }

        public async Task<IEnumerable<LookupItem>> GetAllActiveAsync()
        {
            const string sql = @"
                SELECT
                    class_id AS Id,
                    class_name AS Name
                FROM class
                WHERE status = 'Active'
                ORDER BY class_name";

            return await _db.QueryAsync<LookupItem>(sql);
        }

        public async Task<ClassEditInfo?> GetEditInfoAsync(string classId)
        {
            const string sql = @"
                SELECT
                    c.class_id   AS ClassId,
                    c.class_name AS ClassName,
                    c.semester_id AS SemesterId,
                    c.level_id    AS LevelId,
                    c.Status      AS Status
                FROM class c
                WHERE c.class_id = @ClassId
                LIMIT 1";

            var result = await _db.QueryAsync<ClassEditInfo>(sql, new { ClassId = classId });
            return result.FirstOrDefault();
        }

        public async Task<string> CreateAsync(CreateClassRequest request)
        {
            var newId = $"CL{Guid.NewGuid():N}".ToUpperInvariant();

            const string sql = @"
                INSERT INTO class ( class_name, semester_id, level_id, status)
                VALUES ( @ClassName, @SemesterId, @LevelId, 'Active')";

            await _db.ExecuteAsync(sql, new
            {
                request.ClassName,
                request.SemesterId,
                request.LevelId
            });

            return newId;
        }

        public async Task UpdateAsync(string classId, UpdateClassRequest request)
        {
            const string sql = @"
                UPDATE class
                SET class_name = @ClassName,
                    semester_id = @SemesterId,
                    level_id = @LevelId
                WHERE class_id = @ClassId";

            var affected = await _db.ExecuteAsync(sql, new
            {
                ClassId = classId,
                request.ClassName,
                request.SemesterId,
                request.LevelId
            });

            if (affected == 0)
            {
                throw new InvalidOperationException($"Class {classId} not found");
            }
        }
    }
}
