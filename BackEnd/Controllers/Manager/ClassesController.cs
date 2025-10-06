using System.ComponentModel.DataAnnotations;
using FAJP.Models;
using FJAP.Handles.Manager;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace FJAP.Controllers.Manager;

[ApiController]
[Route("api/manager/classes")]
public class ClassesController : ControllerBase
{
    private readonly IClassHandle _handle;
    private readonly ISemesterHandle _semesterHandle;
    private readonly ILevelHandle _levelHandle;

    public ClassesController(IClassHandle handle, ISemesterHandle semesterHandle, ILevelHandle levelHandle)
    {
        _handle = handle;
        _semesterHandle = semesterHandle;
        _levelHandle = levelHandle;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Class>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var rows = await _handle.GetAllAsync();

            return Ok(new
            {
                code = StatusCodes.Status200OK,
                message = "Success",
                data = rows
            });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                code = StatusCodes.Status500InternalServerError,
                message = "Internal Server Error",
                detail = ex.Message
            });
        }
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Create([FromBody] CreateClassRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            var newId = await _handle.CreateAsync(request);
            return CreatedAtAction(nameof(GetInfo), new { classId = newId }, new
            {
                classId = newId,
                message = "Class created successfully"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                code = StatusCodes.Status500InternalServerError,
                message = "Internal Server Error",
                detail = ex.Message
            });
        }
    }

    [HttpPut("{classId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Update(string classId, [FromBody] UpdateClassRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            await _handle.UpdateAsync(classId, request);
            return Ok(new { message = "Class updated successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                code = StatusCodes.Status500InternalServerError,
                message = "Internal Server Error",
                detail = ex.Message
            });
        }
    }

    [HttpGet("options")]
    [ProducesResponseType(typeof(ClassFormOptions), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetOptions()
    {
        try
        {
            var semesters = await _semesterHandle.GetAllActiveAsync();
            var levels = await _levelHandle.GetAllActiveAsync();

            return Ok(new ClassFormOptions
            {
                Semesters = semesters.ToList(),
                Levels = levels.ToList()
            });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                code = StatusCodes.Status500InternalServerError,
                message = "Internal Server Error",
                detail = ex.Message
            });
        }
    }

    [HttpGet("{classId}/info")]
    [ProducesResponseType(typeof(ClassEditInfo), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetInfo(string classId)
    {
        try
        {
            var info = await _handle.GetEditInfoAsync(classId);
            if (info is null)
            {
                return NotFound(new
                {
                    code = StatusCodes.Status404NotFound,
                    message = $"Class {classId} not found"
                });
            }

            return Ok(info);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                code = StatusCodes.Status500InternalServerError,
                message = "Internal Server Error",
                detail = ex.Message
            });
        }
    }

    [HttpGet("{classId}")]
    [ProducesResponseType(typeof(IEnumerable<ClassSubjectDetail>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetSubjects(string classId)
    {
        try
        {
            var rows = await _handle.GetSubjectsAsync(classId);

            return Ok(new
            {
                code = StatusCodes.Status200OK,
                message = "Success",
                data = rows
            });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                code = StatusCodes.Status500InternalServerError,
                message = "Internal Server Error",
                detail = ex.Message
            });
        }
    }

    [HttpPatch("{classId}/status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateStatus(string classId, [FromBody] UpdateClassStatusRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            await _handle.UpdateStatusAsync(classId, request.Status);
            return Ok(new
            {
                code = StatusCodes.Status200OK,
                message = "Class status updated"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                code = StatusCodes.Status500InternalServerError,
                message = "Internal Server Error",
                detail = ex.Message
            });
        }
    }
}

public class UpdateClassStatusRequest
{
    [Required]
    public bool Status { get; set; }
}
