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

        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar([FromBody] Usuario novoUsuario)
        {
            // Verifica se já existe alguém com esse login
            if (_context.Usuarios.Any(u => u.Login == novoUsuario.Login))
                return BadRequest(new { mensagem = "Este login já está em uso." });

            _context.Usuarios.Add(novoUsuario);
            await _context.SaveChangesAsync();

            return Ok(new { mensagem = "Usuário criado com sucesso!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Usuario requisicaoLogin)
        {
            // 1. Valida se o usuário existe no banco de dados
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Login == requisicaoLogin.Login && u.Senha == requisicaoLogin.Senha);

            if (usuario == null)
            {
                return Unauthorized(new { mensagem = "Usuário ou senha inválidos." });
            }

            // 2. Prepara as informações para o Token JWT
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);
            var credenciais = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, usuario.Login),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // 3. Gera o Token com validade de 2 horas
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credenciais);

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            // 4. Retorna o token para o cliente
            return Ok(new
            {
                token = tokenString,
                expiracao = token.ValidTo
            });
        }
    }
}