using FJAP.Handles.Manager;
using Microsoft.AspNetCore.Mvc;

namespace FJAP.Controllers.Manager
{
    [ApiController]
    [Route("api/manager/subjects")]
    public class SubjectController : ControllerBase
    {
        private readonly ISubjectHandle _handle;

        public SubjectController(ISubjectHandle handle)
        {
            _handle = handle;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var rows = await _handle.GetAllAsync();
            return Ok(rows);
        }
    }
}