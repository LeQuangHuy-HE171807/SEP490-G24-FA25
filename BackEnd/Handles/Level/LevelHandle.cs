using Backend.Data;
using Dapper;
using FJAP.Models;
namespace FJAP.Handles.Manager
{
    public interface ILevelHandle
    {
        Task<IEnumerable<LookupItem>> GetAllActiveAsync();
    }

    public class LevelHandle : ILevelHandle
    {
        private readonly MySqlDb _db;

        public LevelHandle(MySqlDb db) => _db = db;

        public async Task<IEnumerable<LookupItem>> GetAllActiveAsync()
        {
            const string sql = @"
                SELECT 
                    level_id AS Id, 
                    level_name AS Name 
                FROM level 
                ORDER BY level_name";

            return await _db.QueryAsync<LookupItem>(sql);
        }
    }
}