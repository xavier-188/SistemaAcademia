using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademiaAPI.Data;
using SistemaAcademiaAPI.DTOs;
using SistemaAcademiaAPI.Models;
using SistemaAcademiaAPI.Services;

namespace SistemaAcademiaAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase {
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;

    public AuthController(AppDbContext context, TokenService tokenService) {
        _context = context;
        _tokenService = tokenService;
    }

    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar([FromBody] UsuarioCreateDto dto) {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (dto.Senha != dto.ConfirmarSenha)
            return BadRequest(new { mensagem = "As senhas não conferem." });

        if (_context.Usuarios.Any(u => u.Login == dto.Login))
            return BadRequest(new { mensagem = "Este login já está em uso." });

        var usuario = new Usuario {
            Login = dto.Login,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha)
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        return Ok(new { mensagem = "Usuário criado com sucesso!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto) {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Login == dto.Login);

        if (usuario == null || !BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash))
            return Unauthorized(new { mensagem = "Usuário ou senha inválidos." });

        var token = _tokenService.GenerateToken(usuario.Login);

        return Ok(new { token });
    }
}