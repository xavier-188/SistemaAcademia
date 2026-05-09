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
public class PlanosController : ControllerBase {
    private readonly AppDbContext _context;

    public PlanosController(AppDbContext context) {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetPlanos() {
        var planos = await _context.Planos
            .Select(p => new PlanoDto {
                Id = p.Id,
                Nome = p.Nome,
                Preco = p.Preco,
            })
            .ToListAsync();

        return Ok(planos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPlano(int id) {
        var plano = await _context.Planos.FindAsync(id);

        if (plano == null)
            return NotFound(new { mensagem = "Plano não encontrado." });

        return Ok(new PlanoDto {
            Id = plano.Id,
            Nome = plano.Nome,
            Preco = plano.Preco,
        });
    }

    [HttpPost]
    public async Task<IActionResult> PostPlano(PlanoCreateDto dto) {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var plano = new Plano {
            Nome = dto.Nome,
            Preco = dto.Preco,
        };

        _context.Planos.Add(plano);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPlano), new { id = plano.Id }, new PlanoDto {
            Id = plano.Id,
            Nome = plano.Nome,
            Preco = plano.Preco,
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutPlano(int id, PlanoUpdateDto dto) {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var plano = await _context.Planos.FindAsync(id);
        if (plano == null)
            return NotFound(new { mensagem = "Plano não encontrado." });

        plano.Nome = dto.Nome;
        plano.Preco = dto.Preco;

        await _context.SaveChangesAsync();

        return Ok(new { mensagem = "Plano atualizado com sucesso." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePlano(int id) {
        var plano = await _context.Planos
            .Include(p => p.Alunos)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (plano == null)
            return NotFound(new { mensagem = "Plano não encontrado." });

        if (plano.Alunos!.Any())
            return BadRequest(new { mensagem = "Não é possível excluir um plano com alunos vinculados." });

        _context.Planos.Remove(plano);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}