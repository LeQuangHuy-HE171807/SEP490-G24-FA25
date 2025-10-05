using Backend.Data;
using Dapper;
using FJAP.Models;

namespace FJAP.Handles.Manager
{
    public interface ISemesterHandle
    {
        Task<IEnumerable<LookupItem>> GetAllActiveAsync();
    }

    public class SemesterHandle : ISemesterHandle
    {
        private readonly MySqlDb _db;

        public SemesterHandle(MySqlDb db) => _db = db;

        public async Task<IEnumerable<LookupItem>> GetAllActiveAsync()
        {
            const string sql = @"
                SELECT 
                    semester_id AS Id, 
                    name AS Name 
                FROM semester 
                ORDER BY semester_id DESC";

            return await _db.QueryAsync<LookupItem>(sql);
        }
    }
}