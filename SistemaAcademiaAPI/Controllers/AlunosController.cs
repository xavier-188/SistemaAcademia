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
    public class AlunosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AlunosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Aluno>>> GetAlunos()
        {
            // O Include traz os dados do Plano associado ao Aluno
            return await _context.Alunos.Include(a => a.Plano).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Aluno>> GetAluno(int id)
        {
            var aluno = await _context.Alunos
                                      .Include(a => a.Plano)
                                      .FirstOrDefaultAsync(a => a.Id == id);

            if (aluno == null)
                return NotFound(new { mensagem = "Aluno não encontrado." });

            return aluno;
        }

        [HttpPost]
        public async Task<ActionResult<Aluno>> PostAluno(Aluno aluno)
        {
            // Valida se o PlanoId informado realmente existe no banco
            var planoExiste = await _context.Planos.AnyAsync(p => p.Id == aluno.PlanoId);
            if (!planoExiste)
                return BadRequest(new { mensagem = "O Plano informado não existe." });

            _context.Alunos.Add(aluno);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAluno), new { id = aluno.Id }, aluno);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutAluno(int id, Aluno aluno)
        {
            if (id != aluno.Id)
                return BadRequest(new { mensagem = "O ID da URL não corresponde ao ID do corpo da requisição." });

            var planoExiste = await _context.Planos.AnyAsync(p => p.Id == aluno.PlanoId);
            if (!planoExiste)
                return BadRequest(new { mensagem = "O Plano informado não existe." });

            _context.Entry(aluno).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AlunoExists(id))
                    return NotFound(new { mensagem = "Aluno não encontrado." });
                else
                    throw;
            }

            return NoContent();
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

        private bool AlunoExists(int id)
        {
            return _context.Alunos.Any(e => e.Id == id);
        }
    }
}