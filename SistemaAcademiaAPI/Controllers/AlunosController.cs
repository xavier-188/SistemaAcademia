using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademiaAPI.Data;
using SistemaAcademiaAPI.DTOs;
using SistemaAcademiaAPI.Models;

namespace SistemaAcademiaAPI.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class AlunosController : ControllerBase
{
    private readonly AppDbContext _context;

    public AlunosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAlunos()
    {
        var alunos = await _context.Alunos
            .Include(a => a.Plano)
             .Include(a => a.Treinos)
            .Select(a => new AlunoDto
            {
                Id = a.Id,
                Nome = a.Nome,
                Email = a.Email,
                Telefone = a.Telefone,
                PlanoId = a.PlanoId,
                PlanoNome = a.Plano!.Nome
            })
            .ToListAsync();

        return Ok(alunos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAluno(int id)
    {
        var aluno = await _context.Alunos
            .Include(a => a.Plano)
             .Include(a => a.Treinos)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (aluno == null)
            return NotFound(new { mensagem = "Aluno não encontrado." });

        return Ok(new AlunoDto
        {
            Id = aluno.Id,
            Nome = aluno.Nome,
            Email = aluno.Email,
            Telefone = aluno.Telefone,
            PlanoId = aluno.PlanoId,
            PlanoNome = aluno.Plano!.Nome,
            Treinos = aluno.Treinos!.Select(t => new TreinoDto
              {
                  Id = t.Id,
                  Nome = t.Nome,
                  Descricao = t.Descricao,
                  AlunoId = t.AlunoId,
                  AlunoNome = aluno.Nome
              }).ToList()
        });
    }

    [HttpPost]
    public async Task<IActionResult> PostAluno(AlunoCreateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var planoExiste = await _context.Planos.AnyAsync(p => p.Id == dto.PlanoId);
        if (!planoExiste)
            return BadRequest(new { mensagem = "O Plano informado não existe." });

        var aluno = new Aluno
        {
            Nome = dto.Nome,
            Email = dto.Email,
            Telefone = dto.Telefone,
            PlanoId = dto.PlanoId
        };

        _context.Alunos.Add(aluno);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAluno), new { id = aluno.Id }, new AlunoDto
        {
            Id = aluno.Id,
            Nome = aluno.Nome,
            Email = aluno.Email,
            Telefone = aluno.Telefone,
            PlanoId = aluno.PlanoId,
            PlanoNome = (await _context.Planos.FindAsync(aluno.PlanoId))!.Nome
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutAluno(int id, AlunoUpdateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var aluno = await _context.Alunos.FindAsync(id);
        if (aluno == null)
            return NotFound(new { mensagem = "Aluno não encontrado." });

        var planoExiste = await _context.Planos.AnyAsync(p => p.Id == dto.PlanoId);
        if (!planoExiste)
            return BadRequest(new { mensagem = "O Plano informado não existe." });

        aluno.Nome = dto.Nome;
        aluno.Email = dto.Email;
        aluno.Telefone = dto.Telefone;
        aluno.PlanoId = dto.PlanoId;

        await _context.SaveChangesAsync();

        return Ok(new { mensagem = "Aluno atualizado com sucesso." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAluno(int id)
    {
        var aluno = await _context.Alunos.FindAsync(id);
        if (aluno == null)
            return NotFound(new { mensagem = "Aluno não encontrado." });

        _context.Alunos.Remove(aluno);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}