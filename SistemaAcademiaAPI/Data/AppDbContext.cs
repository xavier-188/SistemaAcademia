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
            modelBuilder.Entity<Usuario>().HasIndex(u => u.Login).IsUnique();
            modelBuilder.Entity<Aluno>().HasIndex(a => a.Email).IsUnique();

            modelBuilder.Entity<Plano>()
                .Property(p => p.Preco)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Aluno>()
                .HasOne(a => a.Plano)
                .WithMany(p => p.Alunos)
                .HasForeignKey(a => a.PlanoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Treino>()
                .HasOne(t => t.Aluno)
                .WithMany(a => a.Treinos)
                .HasForeignKey(t => t.AlunoId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
