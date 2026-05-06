using Microsoft.EntityFrameworkCore;
using SistemaAcademiaAPI.Models;

namespace SistemaAcademiaAPI.Data
{
    /// <summary>
    /// CONTEXTO DE DADOS (AppDbContext)
    /// Atua como a ponte entre os modelos C# e o banco de dados (SQLite).
    /// Gerencia a conexão, as transações e o mapeamento Objeto-Relacional (ORM).
    /// </summary>
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Tabelas do Banco de Dados representadas por DbSets
        public DbSet<Aluno> Alunos => Set<Aluno>();
        public DbSet<Plano> Planos => Set<Plano>();
        public DbSet<Treino> Treinos => Set<Treino>();
        public DbSet<Usuario> Usuarios => Set<Usuario>();

        /// <summary>
        /// CONFIGURAÇÃO DO MODELO (Fluent API)
        /// Aqui definimos regras de integridade e comportamento do banco que vão além dos atributos simples.
        /// </summary>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // 1. GARANTIA DE UNICIDADE (Constraints)
            // Índices únicos previnem duplicidade de dados críticos diretamente no motor do banco de dados.
            modelBuilder.Entity<Usuario>().HasIndex(u => u.Login).IsUnique();
            modelBuilder.Entity<Aluno>().HasIndex(a => a.Email).IsUnique();

            // 2. FORMATAÇÃO DE DADOS
            // Define a precisão decimal para valores monetários, evitando erros de arredondamento.
            modelBuilder.Entity<Plano>()
                .Property(p => p.Preco)
                .HasPrecision(18, 2);

            // 3. REGRAS DE INTEGRIDADE REFERENCIAL (Relacionamentos)
            
            // Relacionamento Aluno -> Plano (1:N)
            // Deleção Restrita: Impede que um plano seja apagado se houver alunos ativos vinculados a ele.
            // Protege a consistência histórica e financeira dos dados.
            modelBuilder.Entity<Aluno>()
                .HasOne(a => a.Plano)
                .WithMany(p => p.Alunos)
                .HasForeignKey(a => a.PlanoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relacionamento Treino -> Aluno (1:N)
            // Deleção em Cascata: Se um aluno é removido, seus registros de treino tornam-se órfãos,
            // por isso são removidos automaticamente para limpar o banco (Cascading Delete).
            modelBuilder.Entity<Treino>()
                .HasOne(t => t.Aluno)
                .WithMany(a => a.Treinos)
                .HasForeignKey(t => t.AlunoId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}