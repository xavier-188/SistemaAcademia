using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SistemaAcademiaAPI.Models
{
    public class Plano
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome do plano é obrigatório.")]
        [MaxLength(100, ErrorMessage = "O nome não pode exceder 100 caracteres.")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O preço é obrigatório.")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Preco { get; set; }

        [JsonIgnore]
        public ICollection<Aluno>? Alunos { get; set; }
    }
}