using Backend.Data;
using Microsoft.OpenApi.Models;
using Dapper;
using FJAP.Handles.student;
using FJAP.Handles.Manager;
using System.IO;

LoadEnvFromFile();

var builder = WebApplication.CreateBuilder(args);

// ===== Services =====
builder.Services.AddControllers();

// CORS
const string CorsPolicy = "AllowFrontend";
builder.Services.AddCors(opt =>
{
    opt.AddPolicy(CorsPolicy, p =>
        p.WithOrigins("http://localhost:3000")
         .AllowAnyHeader()
         .AllowAnyMethod());
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "FAJP API", Version = "v1" });
});

// Dapper config (if DB columns use snake_case)
DefaultTypeMap.MatchNamesWithUnderscores = true;

// DI: Db helper + Handle
builder.Services.AddSingleton<MySqlDb>();
builder.Services.AddScoped<IStudentsHandle, StudentsHandle>();
builder.Services.AddScoped<IClassHandle, ClassHandle>();
builder.Services.AddScoped<ISubjectHandle, SubjectHandle>();

var app = builder.Build();

// ===== Middleware =====
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(CorsPolicy);

app.MapControllers();

app.Run();

static void LoadEnvFromFile()
{
    var current = Directory.GetCurrentDirectory();
    string? envFile = null;

    while (current is not null)
    {
        var candidate = Path.Combine(current, ".env");
        if (File.Exists(candidate))
        {
            envFile = candidate;
            break;
        }

        current = Path.GetDirectoryName(current);
    }

    if (envFile is null)
    {
        return;
    }

    foreach (var rawLine in File.ReadLines(envFile))
    {
        var line = rawLine.Trim();
        if (string.IsNullOrEmpty(line) || line.StartsWith("#"))
        {
            continue;
        }

        var separatorIndex = line.IndexOf('=');
        if (separatorIndex <= 0)
        {
            continue;
        }

        var key = line[..separatorIndex].Trim();
        if (string.IsNullOrEmpty(key))
        {
            continue;
        }

        var value = line[(separatorIndex + 1)..].Trim();

        if (value.StartsWith('"') && value.EndsWith('"') && value.Length > 1)
        {
            value = value[1..^1];
        }

        if (Environment.GetEnvironmentVariable(key) is not null)
        {
            continue;
        }

        Environment.SetEnvironmentVariable(key, value);
    }
}
