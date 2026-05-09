using System.ComponentModel.DataAnnotations;

namespace SistemaAcademiaAPI.DTOs;

public class AlunoCreateDto {
    [Required(ErrorMessage = "O nome do aluno é obrigatório.")]
    [MaxLength(150)]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "O e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "Formato de e-mail inválido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "O telefone é obrigatório.")]
    public string Telefone { get; set; } = string.Empty;

    [Required(ErrorMessage = "O aluno deve estar vinculado a um plano.")]
    public int PlanoId { get; set; }
}

public class AlunoUpdateDto : AlunoCreateDto { }

public class AlunoDto {
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public int PlanoId { get; set; }
    public string PlanoNome { get; set; } = string.Empty;
}