using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SistemaAcademiaAPI.Models
{
    public class Treino
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome do treino é obrigatório.")]
        [MaxLength(100, ErrorMessage = "O nome não pode exceder 100 caracteres.")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "A descrição do treino é obrigatória.")]
        [MaxLength(1000, ErrorMessage = "A descrição não pode exceder 1000 caracteres.")]
        public string Descricao { get; set; } = string.Empty;

        // Foreign Key (FK) para Aluno
        [Required(ErrorMessage = "O treino deve estar vinculado a um aluno.")]
        public int AlunoId { get; set; }

        [ForeignKey("AlunoId")]
        [JsonIgnore] // Oculta os dados completos do aluno ao listar os treinos para manter o JSON enxuto
        public Aluno? Aluno { get; set; }
    }
}