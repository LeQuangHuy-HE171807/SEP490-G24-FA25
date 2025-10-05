using FJAP.Handles.Manager;
using Microsoft.AspNetCore.Mvc;
using FJAP.Models; 
namespace FJAP.Controllers.Manager
{
    [ApiController]
    [Route("api/manager/subjects")]
    public class SubjectController : ControllerBase
    {
        private readonly ISubjectHandle _handle;
        private readonly IClassHandle _classHandle;
        private readonly ILevelHandle _levelHandle;
        private readonly ISemesterHandle _semesterHandle;
        public SubjectController(ISubjectHandle handle, IClassHandle classHandle, ILevelHandle levelHandle , ISemesterHandle semesterHandle)
        {
            _handle = handle;
            _classHandle = classHandle;
            _levelHandle = levelHandle;
            _semesterHandle = semesterHandle;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var rows = await _handle.GetAllAsync();
            return Ok(rows);
        }

        [HttpPatch("{subjectId}/status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateStatus(int subjectId, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                await _handle.UpdateStatusAsync(subjectId, request.Status);
                return Ok(new { message = "Status updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Failed to update status: {ex.Message}" });
            }
        }
        [HttpGet("{subjectId}")]
        [ProducesResponseType(typeof(SubjectDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int subjectId)
        {
            var subject = await _handle.GetByIdAsync(subjectId);
            
            if (subject == null)
            {
                return NotFound(new { message = $"Subject with ID {subjectId} not found" });
            }
            
            return Ok(subject);
        }

        // POST: api/manager/subjects
        [HttpPost]
        [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateSubjectRequest request)
        {
            try
            {
                var newId = await _handle.CreateAsync(request);
                return CreatedAtAction(
                    nameof(GetById), 
                    new { subjectId = newId }, 
                    new { subjectId = newId, message = "Subject created successfully" }
                );
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Failed to create subject: {ex.Message}" });
            }
        }

        // PUT: api/manager/subjects/5
        [HttpPut("{subjectId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int subjectId, [FromBody] UpdateSubjectRequest request)
        {
            try
            {
                await _handle.UpdateAsync(subjectId, request);
                return Ok(new { message = "Subject updated successfully" });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("not found"))
                {
                    return NotFound(new { message = ex.Message });
                }
                return BadRequest(new { message = $"Failed to update subject: {ex.Message}" });
            }
        }
        // DELETE: api/manager/subjects/5
        [HttpDelete("{subjectId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int subjectId)
        {
            try
            {
                await _handle.DeleteAsync(subjectId);
                return Ok(new { message = "Subject deleted successfully" });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("not found"))
                {
                    return NotFound(new { message = ex.Message });
                }
                return BadRequest(new { message = $"Failed to delete subject: {ex.Message}" });
            }
        }
         // GET: api/manager/subjects/options
        [HttpGet("options")]
        [ProducesResponseType(typeof(SubjectFormOptions), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetFormOptions()
        {
            try
            {
                var semesters = await _semesterHandle.GetAllActiveAsync();
                var levels = await _levelHandle.GetAllActiveAsync();
                var classes = await _classHandle.GetAllActiveAsync();

                return Ok(new SubjectFormOptions
                {
                    Semesters = semesters.ToList(),
                    Levels = levels.ToList(),
                    Classes = classes.ToList()
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Failed to load options: {ex.Message}" });
            }
        }
    }

    public class UpdateStatusRequest
    {
        public bool Status { get; set; }
    }
}