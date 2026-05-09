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
public class TreinosController : ControllerBase {
    private readonly AppDbContext _context;

    public TreinosController(AppDbContext context) {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTreinos() {
        var treinos = await _context.Treinos
            .Include(t => t.Aluno)
            .Select(t => new TreinoDto {
                Id = t.Id,
                Nome = t.Nome,
                Descricao = t.Descricao,
                AlunoId = t.AlunoId,
                AlunoNome = t.Aluno!.Nome
            })
            .ToListAsync();

        return Ok(treinos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTreino(int id) {
        var treino = await _context.Treinos
            .Include(t => t.Aluno)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (treino == null)
            return NotFound(new { mensagem = "Treino não encontrado." });

        return Ok(new TreinoDto {
            Id = treino.Id,
            Nome = treino.Nome,
            Descricao = treino.Descricao,
            AlunoId = treino.AlunoId,
            AlunoNome = treino.Aluno!.Nome
        });
    }

    [HttpPost]
    public async Task<IActionResult> PostTreino(TreinoCreateDto dto) {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var alunoExiste = await _context.Alunos.AnyAsync(a => a.Id == dto.AlunoId);
        if (!alunoExiste)
            return BadRequest(new { mensagem = "O Aluno informado não existe." });

        var treino = new Treino {
            Nome = dto.Nome,
            Descricao = dto.Descricao,
            AlunoId = dto.AlunoId
        };

        _context.Treinos.Add(treino);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTreino), new { id = treino.Id }, new TreinoDto {
            Id = treino.Id,
            Nome = treino.Nome,
            Descricao = treino.Descricao,
            AlunoId = treino.AlunoId,
            AlunoNome = (await _context.Alunos.FindAsync(treino.AlunoId))!.Nome
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutTreino(int id, TreinoUpdateDto dto) {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var treino = await _context.Treinos.FindAsync(id);
        if (treino == null)
            return NotFound(new { mensagem = "Treino não encontrado." });

        var alunoExiste = await _context.Alunos.AnyAsync(a => a.Id == dto.AlunoId);
        if (!alunoExiste)
            return BadRequest(new { mensagem = "O Aluno informado não existe." });

        treino.Nome = dto.Nome;
        treino.Descricao = dto.Descricao;
        treino.AlunoId = dto.AlunoId;

        await _context.SaveChangesAsync();

        return Ok(new { mensagem = "Treino atualizado com sucesso." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTreino(int id) {
        var treino = await _context.Treinos.FindAsync(id);
        if (treino == null)
            return NotFound(new { mensagem = "Treino não encontrado." });

        _context.Treinos.Remove(treino);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}