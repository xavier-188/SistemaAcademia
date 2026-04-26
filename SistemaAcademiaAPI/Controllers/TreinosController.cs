using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademiaAPI.Models;
using SistemaAcademiaAPI.Data;

namespace SistemaAcademiaAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TreinosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TreinosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Treino>>> GetTreinos()
        {
            return await _context.Treinos.Include(t => t.Aluno).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Treino>> GetTreino(int id)
        {
            var treino = await _context.Treinos
                                       .Include(t => t.Aluno)
                                       .FirstOrDefaultAsync(t => t.Id == id);

            if (treino == null)
                return NotFound(new { mensagem = "Treino não encontrado." });

            return treino;
        }

        [HttpPost]
        public async Task<ActionResult<Treino>> PostTreino(Treino treino)
        {
            var alunoExiste = await _context.Alunos.AnyAsync(a => a.Id == treino.AlunoId);
            if (!alunoExiste)
                return BadRequest(new { mensagem = "O Aluno informado não existe." });

            _context.Treinos.Add(treino);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTreino), new { id = treino.Id }, treino);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTreino(int id, Treino treino)
        {
            if (id != treino.Id)
                return BadRequest(new { mensagem = "O ID da URL não corresponde ao ID do corpo da requisição." });

            var alunoExiste = await _context.Alunos.AnyAsync(a => a.Id == treino.AlunoId);
            if (!alunoExiste)
                return BadRequest(new { mensagem = "O Aluno informado não existe." });

            _context.Entry(treino).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TreinoExists(id))
                    return NotFound(new { mensagem = "Treino não encontrado." });
                else
                    throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTreino(int id)
        {
            var treino = await _context.Treinos.FindAsync(id);
            if (treino == null)
                return NotFound(new { mensagem = "Treino não encontrado." });

            _context.Treinos.Remove(treino);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TreinoExists(int id)
        {
            return _context.Treinos.Any(e => e.Id == id);
        }
    }
}