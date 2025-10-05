namespace FJAP.Models
{
    public class Subject
    {
        public int SubjectId { get; set; }
        
        public string SubjectCode { get; set; } = string.Empty;
        
        public string SubjectName { get; set; } = string.Empty;
        
        public string Status { get; set; } = "Active";
        
        public string? Description { get; set; }
        
        public decimal PassMark { get; set; } = 0.00m;
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        public int SemesterId { get; set; }
        
        public int LevelId { get; set; }
        
        public int ClassId { get; set; }

        public string? SemesterName { get; set; }
        public string? LevelName { get; set; }
        public string? ClassName { get; set; }
    }
    public class SubjectDto
    {
        public int SubjectId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";
        public string? Description { get; set; }
        public decimal PassMark { get; set; }
        public DateTime CreatedAt { get; set; }
        
        public int SemesterId { get; set; }
        public int LevelId { get; set; }
        public int ClassId { get; set; }
        
        public string? SemesterName { get; set; }
        public string? LevelName { get; set; }
        public string? ClassName { get; set; }
    }

    // DTO cho Create
    public class CreateSubjectRequest
    {
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal PassMark { get; set; }
        public int SemesterId { get; set; }
        public int LevelId { get; set; }
        public int ClassId { get; set; }
    }

    // DTO cho Update
    public class UpdateSubjectRequest
    {
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal PassMark { get; set; }
        public int SemesterId { get; set; }
        public int LevelId { get; set; }
        public int ClassId { get; set; }
    }
    public class LookupItem
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class SubjectFormOptions
    {
        public List<LookupItem> Semesters { get; set; } = new();
        public List<LookupItem> Levels { get; set; } = new();
        public List<LookupItem> Classes { get; set; } = new();
    }
}