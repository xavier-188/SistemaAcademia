using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAcademiaAPI.Models;
using SistemaAcademiaAPI.Data;

namespace SistemaAcademiaAPI.Controllers
{
    /// <summary>
    /// CONTROLLER DE GESTÃO DE ALUNOS
    /// Implementa operações de CRUD (Create, Read, Update, Delete) seguindo o padrão REST.
    /// </summary>
    [Authorize] // PROTEÇÃO DE ROTA: Apenas requisições com Token JWT válido podem acessar estes recursos.
    [Route("api/[controller]")]
    [ApiController]
    public class AlunosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AlunosController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// LISTAGEM DE ALUNOS
        /// Utiliza Eager Loading (.Include) para otimizar a busca e evitar o problema de N+1 consultas.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Aluno>>> GetAlunos()
        {
            // O Include traz os dados do Plano associado ao Aluno em uma única consulta SQL (JOIN).
            return await _context.Alunos.Include(a => a.Plano).ToListAsync();
        }

        /// <summary>
        /// BUSCA POR ID
        /// </summary>
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

        /// <summary>
        /// CADASTRO DE ALUNO
        /// Inclui validação de integridade referencial antes da persistência.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Aluno>> PostAluno(Aluno aluno)
        {
            // Valida se o PlanoId informado realmente existe no banco (Integridade Referencial).
            var planoExiste = await _context.Planos.AnyAsync(p => p.Id == aluno.PlanoId);
            if (!planoExiste)
                return BadRequest(new { mensagem = "O Plano informado não existe." });

            _context.Alunos.Add(aluno);
            await _context.SaveChangesAsync();

            // Retorna 201 Created com o header Location apontando para o novo recurso.
            return CreatedAtAction(nameof(GetAluno), new { id = aluno.Id }, aluno);
        }

        /// <summary>
        /// ATUALIZAÇÃO DE DADOS (PUT)
        /// Implementa tratamento de concorrência e validação de estado.
        /// </summary>
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
                // Tratamento de concorrência: Verifica se o registro ainda existe se a atualização falhar.
                if (!AlunoExists(id))
                    return NotFound(new { mensagem = "Aluno não encontrado." });
                else
                    throw;
            }

            return NoContent();
        }

        /// <summary>
        /// EXCLUSÃO DE REGISTRO
        /// </summary>
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

        /// <summary>
        /// MÉTODO AUXILIAR
        /// Encapsula a lógica de verificação de existência para reuso interno.
        /// </summary>
        private bool AlunoExists(int id)
        {
            return _context.Alunos.Any(e => e.Id == id);
        }
    }
}