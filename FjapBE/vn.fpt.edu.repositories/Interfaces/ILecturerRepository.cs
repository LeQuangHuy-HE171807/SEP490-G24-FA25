using FJAP.vn.fpt.edu.models;

namespace FJAP.Repositories.Interfaces;

public interface ILecturerRepository : IGenericRepository<Lecture>
{
    Task<IEnumerable<LessonDto>> GetLessonsByLecturerIdAsync(int lecturerId);
}

