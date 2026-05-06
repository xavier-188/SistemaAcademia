using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SistemaAcademiaAPI.Data;
using SistemaAcademiaAPI.Models;

namespace SistemaAcademiaAPI.Controllers
{
    /// <summary>
    /// CONTROLLER DE AUTENTICAÇÃO
    /// Responsável pela gestão de acesso, registro de usuários e emissão de tokens de segurança.
    /// Esta é a primeira camada de defesa da aplicação.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        /// <summary>
        /// REGISTRO DE NOVOS USUÁRIOS
        /// Implementa a persistência de credenciais no banco de dados.
        /// </summary>
        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar([FromBody] Usuario novoUsuario)
        {
            // Validação de unicidade: Garante que não existam logins duplicados (Integridade de Dados).
            if (_context.Usuarios.Any(u => u.Login == novoUsuario.Login))
                return BadRequest(new { mensagem = "Este login já está em uso." });

            _context.Usuarios.Add(novoUsuario);
            await _context.SaveChangesAsync();

            return Ok(new { mensagem = "Usuário criado com sucesso!" });
        }

        /// <summary>
        /// PROCESSO DE LOGIN E EMISSÃO DE TOKEN
        /// Valida as credenciais e gera um token JWT assinado para sessões stateless.
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Usuario requisicaoLogin)
        {
            // 1. AUTENTICAÇÃO: Validação das credenciais contra o banco de dados.
            // Em uma aplicação de produção, as senhas devem ser armazenadas com HASH (ex: BCrypt).
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Login == requisicaoLogin.Login && u.Senha == requisicaoLogin.Senha);

            if (usuario == null)
            {
                // Resposta genérica para evitar User Enumeration (segurança contra ataques de força bruta).
                return Unauthorized(new { mensagem = "Usuário ou senha inválidos." });
            }

            // 2. PREPARAÇÃO DA ASSINATURA DIGITAL (Cryptography)
            // Utilizamos a chave secreta definida nas configurações para assinar o token.
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);
            var credenciais = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256); // Algoritmo robusto de hashing para assinatura.

            // 3. DEFINIÇÃO DE CLAIMS (Identidade do Token)
            // Claims são declarações sobre o usuário que viajam dentro do token de forma criptografada/codificada.
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, usuario.Login),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // ID único para o token (prevenção de Replay Attack)
            };

            // 4. GERAÇÃO DO TOKEN
            // Definimos expiração curta (2 horas) para minimizar o tempo de exposição em caso de roubo do token.
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credenciais);

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            // 5. RETORNO DE SUCESSO
            // O cliente armazena este token (normalmente no LocalStorage ou Cookie) e o envia no header Authorization.
            return Ok(new
            {
                token = tokenString,
                expiracao = token.ValidTo
            });
        }
    }
}