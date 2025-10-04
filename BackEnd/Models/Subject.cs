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

        // public virtual Semester? Semester { get; set; }
        // public virtual Level? Level { get; set; }
        // public virtual Class? Class { get; set; }
    }
}