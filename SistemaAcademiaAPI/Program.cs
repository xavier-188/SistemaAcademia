using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SistemaAcademiaAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuração do Banco de Dados (agora usando SQLite)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Configuração dos Controllers e JSON (Evita loops em relacionamentos N:N)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);

// 3. CORS (Ajuste a URL conforme o seu Front-end)
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTudo", policy =>
        policy.AllowAnyOrigin() // Em produção, substitua pelo domínio do front
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// 4. Configuração de Autenticação JWT
var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "Chave_Secreta_De_Seguranca_Padrao_32_Chars");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

// 5. Swagger com suporte a Token JWT
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Sistema Academia API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Insira o token JWT desta maneira: Bearer {seu_token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        {
            new OpenApiSecurityScheme {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configuração do Pipeline de Requisições HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// IMPORTANTE: UseCors deve vir ANTES de UseAuthentication
app.UseCors("PermitirTudo");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();