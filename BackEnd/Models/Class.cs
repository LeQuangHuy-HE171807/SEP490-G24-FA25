using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FAJP.Models
{
    public class Class
    {
        public string class_id { get; set; }
        public string class_name { get; set; }
        public string semester { get; set; }
        public DateTime? start_date { get; set; }
        public DateTime? end_date { get; set; }
        public string status { get; set; }
        public int? semester_id { get; set; }
        public int? level_id { get; set; }
    }

    public class ClassEditInfo
    {
        public string ClassId { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public int SemesterId { get; set; }
        public int LevelId { get; set; }
        public string Status { get; set; } = "Active";
    }

    public class ClassFormOptions
    {
        public List<FJAP.Models.LookupItem> Semesters { get; set; } = new();
        public List<FJAP.Models.LookupItem> Levels { get; set; } = new();
    }

    public class CreateClassRequest
    {
        [Required]
        [MaxLength(200)]
        public string ClassName { get; set; } = string.Empty;

        [Required]
        public int SemesterId { get; set; }

        [Required]
        public int LevelId { get; set; }
    }

    public class UpdateClassRequest
    {
        [Required]
        [MaxLength(200)]
        public string ClassName { get; set; } = string.Empty;

        [Required]
        public int SemesterId { get; set; }

        [Required]
        public int LevelId { get; set; }
    }
}
