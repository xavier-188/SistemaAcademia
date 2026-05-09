using System.ComponentModel.DataAnnotations;

namespace SistemaAcademiaAPI.DTOs;

public class TreinoCreateDto {
    [Required(ErrorMessage = "O nome é obrigatório.")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "A descrição é obrigatória.")]
    public string Descricao { get; set; } = string.Empty;

    [Required(ErrorMessage = "O aluno é obrigatório.")]
    public int AlunoId { get; set; }
}

public class TreinoUpdateDto : TreinoCreateDto { }

public class TreinoDto {
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public int AlunoId { get; set; }
    public string AlunoNome { get; set; } = string.Empty;
}