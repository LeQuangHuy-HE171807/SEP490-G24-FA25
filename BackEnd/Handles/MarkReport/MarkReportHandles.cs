using Backend.Data;
using Dapper;
using FJAP.Models;

namespace FJAP.Handles.Student
{
    public interface IMarkReportHandle
    {
        Task<StudentMarkReportResponse> GetStudentMarkReportAsync(int studentId);
        Task<List<StudentMarkReport>> GetMarksBySemesterAsync(int studentId, string semesterName, int year);
        Task<StudentMarkReport?> GetSubjectDetailAsync(int studentId, int subjectId);
    }
    public class MarkReportHandle : IMarkReportHandle
    {
        private readonly MySqlDb _db;

        public MarkReportHandle(MySqlDb db) => _db = db;

        // Lấy tất cả điểm của student, group theo semester
        public async Task<StudentMarkReportResponse> GetStudentMarkReportAsync(int studentId)
        {
            // Query lấy thông tin student
            const string studentSql = @"
                SELECT 
                    s.student_id AS StudentId,
                    CONCAT(u.first_name, ' ', u.last_name) AS StudentName
                FROM student s
                INNER JOIN user u ON s.user_id = u.user_id
                WHERE s.student_id = @StudentId";

            var student = await _db.QueryFirstOrDefaultAsync<dynamic>(studentSql, new { StudentId = studentId });
            
            if (student == null)
            {
                return new StudentMarkReportResponse { StudentId = studentId };
            }

            // Query lấy tất cả grades của student với year từ start_date
            const string gradesSql = @"
                SELECT 
                    g.grade_id AS GradeId,
                    g.student_id AS StudentId,
                    g.subject_id AS SubjectId,
                    s.subject_code AS SubjectCode,
                    s.subject_name AS SubjectName,
                    s.pass_mark AS PassMark,
                    c.class_name AS ClassName,
                    sem.name AS SemesterName,
                    YEAR(sem.start_date) AS Year,
                    sem.start_date AS StartDate,
                    sem.end_date AS EndDate
                FROM grade g
                INNER JOIN subject s ON g.subject_id = s.subject_id
                INNER JOIN class c ON s.class_id = c.class_id
                INNER JOIN semester sem ON s.semester_id = sem.semester_id
                WHERE g.student_id = @StudentId
                ORDER BY sem.start_date DESC, s.subject_code";

            var grades = (await _db.QueryAsync<StudentMarkReport>(gradesSql, new { StudentId = studentId })).ToList();

            // Lấy grade types cho mỗi grade
            foreach (var grade in grades)
            {
                const string gradeTypesSql = @"
                    SELECT 
                        grade_type_id AS GradeTypeId,
                        grade_type_name AS GradeTypeName,
                        weight AS Weight,
                        score AS Score,
                        comment AS Comment,
                        status AS Status
                    FROM grade_type
                    WHERE grade_id = @GradeId AND status = 'Active'
                    ORDER BY 
                        CASE grade_type_name
                            WHEN 'Attendance' THEN 1
                            WHEN 'Assignment' THEN 2
                            WHEN 'Midterm' THEN 3
                            WHEN 'Final' THEN 4
                            ELSE 5
                        END";

                grade.GradeTypes = (await _db.QueryAsync<GradeTypeDetail>(gradeTypesSql, new { GradeId = grade.GradeId })).ToList();
                
                // Tính tổng điểm
                grade.TotalScore = grade.GradeTypes.Sum(gt => gt.Score);
            }

            // Group theo semester
            var semesterGroups = grades
                .GroupBy(g => new { g.SemesterName, g.Year })
                .Select(g => new SemesterGroup
                {
                    SemesterName = g.Key.SemesterName,
                    Year = g.Key.Year,
                    Subjects = g.ToList()
                })
                .ToList();

            return new StudentMarkReportResponse
            {
                StudentId = studentId,
                StudentName = student.StudentName,
                Semesters = semesterGroups
            };
        }

        // Lấy điểm theo semester cụ thể
        public async Task<List<StudentMarkReport>> GetMarksBySemesterAsync(int studentId, string semesterName, int year)
        {
            const string sql = @"
                SELECT 
                    g.grade_id AS GradeId,
                    g.student_id AS StudentId,
                    g.subject_id AS SubjectId,
                    s.subject_code AS SubjectCode,
                    s.subject_name AS SubjectName,
                    s.pass_mark AS PassMark,
                    c.class_name AS ClassName,
                    sem.name AS SemesterName,
                    YEAR(sem.start_date) AS Year,
                    sem.start_date AS StartDate,
                    sem.end_date AS EndDate
                FROM grade g
                INNER JOIN subject s ON g.subject_id = s.subject_id
                INNER JOIN class c ON s.class_id = c.class_id
                INNER JOIN semester sem ON s.semester_id = sem.semester_id
                WHERE g.student_id = @StudentId 
                  AND sem.name = @SemesterName 
                  AND YEAR(sem.start_date) = @Year
                ORDER BY s.subject_code";

            var grades = (await _db.QueryAsync<StudentMarkReport>(sql, new { StudentId = studentId, SemesterName = semesterName, Year = year })).ToList();

            foreach (var grade in grades)
            {
                const string gradeTypesSql = @"
                    SELECT 
                        grade_type_id AS GradeTypeId,
                        grade_type_name AS GradeTypeName,
                        weight AS Weight,
                        score AS Score,
                        comment AS Comment,
                        status AS Status
                    FROM grade_type
                    WHERE grade_id = @GradeId AND status = 'Active'
                    ORDER BY 
                        CASE grade_type_name
                            WHEN 'Attendance' THEN 1
                            WHEN 'Assignment' THEN 2
                            WHEN 'Midterm' THEN 3
                            WHEN 'Final' THEN 4
                            ELSE 5
                        END";

                grade.GradeTypes = (await _db.QueryAsync<GradeTypeDetail>(gradeTypesSql, new { GradeId = grade.GradeId })).ToList();
                grade.TotalScore = grade.GradeTypes.Sum(gt => gt.Score);
            }

            return grades;
        }

        // Lấy chi tiết điểm của 1 môn cụ thể
        public async Task<StudentMarkReport?> GetSubjectDetailAsync(int studentId, int subjectId)
        {
            const string sql = @"
                SELECT 
                    g.grade_id AS GradeId,
                    g.student_id AS StudentId,
                    g.subject_id AS SubjectId,
                    s.subject_code AS SubjectCode,
                    s.subject_name AS SubjectName,
                    s.pass_mark AS PassMark,
                    c.class_name AS ClassName,
                    sem.name AS SemesterName,
                    YEAR(sem.start_date) AS Year,
                    sem.start_date AS StartDate,
                    sem.end_date AS EndDate
                FROM grade g
                INNER JOIN subject s ON g.subject_id = s.subject_id
                INNER JOIN class c ON s.class_id = c.class_id
                INNER JOIN semester sem ON s.semester_id = sem.semester_id
                WHERE g.student_id = @StudentId AND g.subject_id = @SubjectId";

            var grade = await _db.QueryFirstOrDefaultAsync<StudentMarkReport>(sql, new { StudentId = studentId, SubjectId = subjectId });

            if (grade != null)
            {
                const string gradeTypesSql = @"
                    SELECT 
                        grade_type_id AS GradeTypeId,
                        grade_type_name AS GradeTypeName,
                        weight AS Weight,
                        score AS Score,
                        comment AS Comment,
                        status AS Status
                    FROM grade_type
                    WHERE grade_id = @GradeId AND status = 'Active'
                    ORDER BY 
                        CASE grade_type_name
                            WHEN 'Attendance' THEN 1
                            WHEN 'Assignment' THEN 2
                            WHEN 'Midterm' THEN 3
                            WHEN 'Final' THEN 4
                            ELSE 5
                        END";

                grade.GradeTypes = (await _db.QueryAsync<GradeTypeDetail>(gradeTypesSql, new { GradeId = grade.GradeId })).ToList();
                grade.TotalScore = grade.GradeTypes.Sum(gt => gt.Score);
            }

            return grade;
        }
    }
}