// ============================================================================
// ARQUITETURA DO BACK-END - SISTEMA ACADEMIA
// ============================================================================
// Este arquivo é o ponto de entrada da aplicação ASP.NET Core Web API.
// Aqui configuramos o pipeline de processamento, injeção de dependência e segurança.

using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SistemaAcademiaAPI.Data;
using SistemaAcademiaAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. PERSISTÊNCIA DE DADOS (Entity Framework Core)
// O padrão Repository/Unit of Work é implicitamente gerenciado pelo DbContext do EF Core.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 0))
    ));

// 2. CONFIGURAÇÃO DE CONTROLLERS E SERIALIZAÇÃO JSON
// Implementamos o IgnoreCycles para tratar referências circulares em relacionamentos N:N
// (ex: Aluno tem Treinos e Treino tem Alunos), garantindo que o JSON não entre em loop infinito.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);

// 3. SEGURANÇA - POLÍTICA DE CORS (Cross-Origin Resource Sharing)
// Essencial para permitir que o Front-end (React/Vite) em uma porta diferente acesse a API com segurança.
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTudo", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// 4. AUTENTICAÇÃO E AUTORIZAÇÃO (JWT - JSON Web Token)
// Escolhemos JWT por ser um padrão de mercado (RFC 7519) stateless, o que garante 
// escalabilidade ao servidor, já que não precisamos manter sessões em memória.
var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "Chave_Secreta_De_Seguranca_Padrao_32_Chars");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true, // Verifica se a assinatura é válida
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero // Remove tolerância de tempo para expiração rígida do token
        };
    });

// 5. DOCUMENTAÇÃO TÉCNICA (Swagger/OpenAPI)
// Swagger configurado para suportar autenticação Bearer, facilitando testes de segurança 
// e servindo como documentação viva para o desenvolvimento do Front-end.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Sistema Academia API",
        Version = "v1",
        Description = "API RESTful para gestão completa de academia.\n\n" +
        "FUNCIONALIDADES: Alunos | Planos | Treinos | Autenticação JWT\n\n" +
        "COMO USAR: 1) Registre um usuário  2) Faça login e copie o token  " +
        "3) Clique em Authorize e cole: Bearer {seu_token}\n\n" +
        "TECNOLOGIAS: ASP.NET Core 8 | Entity Framework Core | MySQL | JWT"
    });

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
builder.Services.AddSingleton<TokenService>();

var app = builder.Build();

// ============================================================================
// CONFIGURAÇÃO DO MIDDLEWARE PIPELINE
// ============================================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Redirecionamento HTTPS para garantir que os dados trafeguem de forma criptografada.
app.UseHttpsRedirection();

// O Middleware de CORS deve vir antes da Autenticação.
app.UseCors("PermitirTudo");

// Ativação da camada de segurança de identidade.
app.UseAuthentication();
app.UseAuthorization();

// Mapeamento automático dos Controllers baseados em atributos.
app.MapControllers();

app.Run();
