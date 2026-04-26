using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademiaAPI.Models;
using SistemaAcademiaAPI.Data;

namespace SistemaAcademiaAPI.Controllers
{
    [Authorize] // Requer token JWT para acessar
    [Route("api/[controller]")]
    [ApiController]
    public class PlanosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PlanosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Plano>>> GetPlanos()
        {
            return await _context.Planos.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Plano>> GetPlano(int id)
        {
            var plano = await _context.Planos.FindAsync(id);

            if (plano == null)
                return NotFound(new { mensagem = "Plano não encontrado." });

            return plano;
        }

        [HttpPost]
        public async Task<ActionResult<Plano>> PostPlano(Plano plano)
        {
            _context.Planos.Add(plano);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPlano), new { id = plano.Id }, plano);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPlano(int id, Plano plano)
        {
            if (id != plano.Id)
                return BadRequest(new { mensagem = "O ID da URL não corresponde ao ID do corpo da requisição." });

            _context.Entry(plano).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PlanoExists(id))
                    return NotFound(new { mensagem = "Plano não encontrado." });
                else
                    throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlano(int id)
        {
            var plano = await _context.Planos.FindAsync(id);
            if (plano == null)
                return NotFound(new { mensagem = "Plano não encontrado." });

            // A restrição (Restrict) configurada no AppDbContext impedirá a exclusão se houver alunos vinculados
            _context.Planos.Remove(plano);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PlanoExists(int id)
        {
            return _context.Planos.Any(e => e.Id == id);
        }
    }
}