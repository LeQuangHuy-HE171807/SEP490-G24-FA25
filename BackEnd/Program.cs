using FJAP.Infrastructure.Extensions;
using FJAP.Infrastructure.Security;
using MySqlConnector;
using System.Data;

var builder = WebApplication.CreateBuilder(args);

// =================== Services ===================

// Controllers
builder.Services.AddControllers();

// CORS + Swagger + Dapper mapping (giữ như cũ)
builder.Services.AddAppCors(builder.Configuration);
builder.Services.AddAppSwagger();
builder.Services.AddDapperMapping();

// DB Connection (đúng key "MySql")
builder.Services.AddScoped<IDbConnection>(sp =>
{
    var cfg = sp.GetRequiredService<IConfiguration>();
    var cs = cfg.GetConnectionString("MySql")
             ?? throw new InvalidOperationException("Missing ConnectionStrings:MySql");
    return new MySqlConnection(cs);
});

// App services + JWT
builder.Services.AddAppServices(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);

var app = builder.Build();

// Chỉ redirect HTTPS khi chạy ngoài dev (tránh lỗi không xác định cổng https)
if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(CorsPolicy);

app.UseAuthentication();   // phải trước Authorization
app.UseAuthorization();

app.MapControllers();

// Endpoint test claims nhanh
app.MapGet("/api/auth/me", (ClaimsPrincipal user) =>
{
    var uid = user.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
    var email = user.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)?.Value;
    var name = user.FindFirst("name")?.Value;
    var role = user.FindFirst(ClaimTypes.Role)?.Value;
    var roleId = user.FindFirst("role_id")?.Value;
    return Results.Ok(new { userId = uid, email, name, role, roleId });
}).RequireAuthorization();

app.Run();
