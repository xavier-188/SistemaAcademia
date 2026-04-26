using Microsoft.EntityFrameworkCore;
using SistemaAcademiaAPI.Models;

namespace SistemaAcademiaAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Aluno> Alunos => Set<Aluno>();
        public DbSet<Plano> Planos => Set<Plano>();
        public DbSet<Treino> Treinos => Set<Treino>();
        public DbSet<Usuario> Usuarios => Set<Usuario>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Índice único para Login e Email
            modelBuilder.Entity<Usuario>().HasIndex(u => u.Login).IsUnique();
            modelBuilder.Entity<Aluno>().HasIndex(a => a.Email).IsUnique();

            // Configuração de Precisão para valores monetários
            modelBuilder.Entity<Plano>()
                .Property(p => p.Preco)
                .HasPrecision(18, 2);

            // Relacionamento Aluno -> Plano (Deleção Restrita)
            // Impede que um plano seja apagado se houver alunos vinculados a ele
            modelBuilder.Entity<Aluno>()
                .HasOne(a => a.Plano)
                .WithMany(p => p.Alunos)
                .HasForeignKey(a => a.PlanoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relacionamento Treino -> Aluno (Deleção em Cascata)
            // Se o aluno for apagado, os treinos dele também serão
            modelBuilder.Entity<Treino>()
                .HasOne(t => t.Aluno)
                .WithMany(a => a.Treinos)
                .HasForeignKey(t => t.AlunoId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}