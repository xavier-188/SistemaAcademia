using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SistemaAcademiaAPI.Models
{
    public class Aluno
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome do aluno é obrigatório.")]
        [MaxLength(150, ErrorMessage = "O nome não pode exceder 150 caracteres.")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [EmailAddress(ErrorMessage = "Formato de e-mail inválido.")]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "O telefone é obrigatório.")]
        [Phone(ErrorMessage = "Formato de telefone inválido.")]
        [MaxLength(20)]
        public string Telefone { get; set; } = string.Empty;

        // Foreign Key (FK) para Plano
        [Required(ErrorMessage = "O aluno deve estar vinculado a um plano.")]
        public int PlanoId { get; set; }

        [ForeignKey("PlanoId")]
        public Plano? Plano { get; set; }

        // Relacionamento: Um aluno tem muitos treinos
        public ICollection<Treino>? Treinos { get; set; }
    }
}