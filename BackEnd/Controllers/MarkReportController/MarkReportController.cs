using FJAP.Handles.Student;
using Microsoft.AspNetCore.Mvc;

namespace FJAP.Controllers.Student
{
    [ApiController]
    [Route("api/student/mark-report")]
    public class MarkReportController : ControllerBase
    {
        private readonly IMarkReportHandle _handle;

        public MarkReportController(IMarkReportHandle handle)
        {
            _handle = handle;
        }

        // GET: api/student/mark-report/{studentId}
        [HttpGet("{studentId}")]
        [ProducesResponseType(typeof(StudentMarkReportResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMarkReport(int studentId)
        {
            try
            {
                var report = await _handle.GetStudentMarkReportAsync(studentId);
                
                if (report.Semesters.Count == 0)
                {
                    return NotFound(new { message = "No grades found for this student" });
                }
                
                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Failed to load mark report: {ex.Message}" });
            }
        }

        // GET: api/student/mark-report/{studentId}/semester?semesterName=Summer&year=2025
        [HttpGet("{studentId}/semester")]
        [ProducesResponseType(typeof(List<StudentMarkReport>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMarksBySemester(
            int studentId, 
            [FromQuery] string semesterName, 
            [FromQuery] int year)
        {
            try
            {
                var marks = await _handle.GetMarksBySemesterAsync(studentId, semesterName, year);
                return Ok(marks);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Failed to load marks: {ex.Message}" });
            }
        }

        // GET: api/student/mark-report/{studentId}/subject/{subjectId}
        [HttpGet("{studentId}/subject/{subjectId}")]
        [ProducesResponseType(typeof(StudentMarkReport), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetSubjectDetail(int studentId, int subjectId)
        {
            try
            {
                var detail = await _handle.GetSubjectDetailAsync(studentId, subjectId);
                
                if (detail == null)
                {
                    return NotFound(new { message = "Subject not found for this student" });
                }
                
                return Ok(detail);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Failed to load subject detail: {ex.Message}" });
            }
        }
    }
}