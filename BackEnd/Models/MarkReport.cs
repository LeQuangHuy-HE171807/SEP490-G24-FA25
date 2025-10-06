namespace FJAP.Models
{
    // Model chính để hiển thị điểm của student
    public class StudentMarkReport
    {
        public int GradeId { get; set; }
        public int StudentId { get; set; }
        public int SubjectId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public string SemesterName { get; set; } = string.Empty;
        public int Year { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        
        // Danh sách điểm chi tiết theo loại
        public List<GradeTypeDetail> GradeTypes { get; set; } = new();
        
        // Tổng điểm
        public decimal TotalScore { get; set; }
        public decimal PassMark { get; set; }
        public bool IsPassed => TotalScore >= PassMark;
    }

    // Chi tiết điểm từng loại (Attendance, Assignment, Midterm, Final...)
    public class GradeTypeDetail
    {
        public int GradeTypeId { get; set; }
        public string GradeTypeName { get; set; } = string.Empty;
        public decimal Weight { get; set; }
        public decimal Score { get; set; }
        public string? Comment { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    // DTO để group các môn theo semester
    public class SemesterGroup
    {
        public string SemesterName { get; set; } = string.Empty;
        public int Year { get; set; }
        public List<StudentMarkReport> Subjects { get; set; } = new();
    }

    // Response trả về cho student
    public class StudentMarkReportResponse
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public List<SemesterGroup> Semesters { get; set; } = new();
    }
}