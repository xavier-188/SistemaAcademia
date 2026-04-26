using System.ComponentModel.DataAnnotations;

namespace SistemaAcademiaAPI.Models
{
    public class Usuario
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "O login é obrigatório.")]
        [MaxLength(50, ErrorMessage = "O login não pode exceder 50 caracteres.")]
        public string Login { get; set; } = string.Empty;

        [Required(ErrorMessage = "A senha é obrigatória.")]
        public string Senha { get; set; } = string.Empty;
    }
}