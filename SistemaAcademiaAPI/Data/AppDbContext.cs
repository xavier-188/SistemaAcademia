using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Aluno> Alunos => Set<Aluno>();
    public DbSet<Plano> Planos => Set<Plano>();
    public DbSet<Treino> Treinos => Set<Treino>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Login)
            .IsUnique();

        modelBuilder.Entity<Aluno>(entity =>
        {
            entity.Property(a => a.Nome).HasMaxLength(150).IsRequired();
            entity.Property(a => a.Email).HasMaxLength(200).IsRequired();
            entity.Property(a => a.Telefone).HasMaxLength(20).IsRequired();
            entity.HasIndex(a => a.Email).IsUnique();
            entity.HasOne(a => a.Plano)
                  .WithMany(p => p.Alunos)
                  .HasForeignKey(a => a.PlanoId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Treino>(entity =>
        {
            entity.Property(t => t.Nome).HasMaxLength(100).IsRequired();
            entity.Property(t => t.Descricao).HasMaxLength(1000).IsRequired();
            entity.HasOne(t => t.Aluno)
                  .WithMany(a => a.Treinos)
                  .HasForeignKey(t => t.AlunoId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Plano>(entity =>
        {
            entity.Property(p => p.Nome).HasMaxLength(100).IsRequired();
            entity.Property(p => p.Preco).HasPrecision(18, 2);
        });
    }
}
    


