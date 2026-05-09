using System.ComponentModel.DataAnnotations;

namespace SistemaAcademiaAPI.DTOs;

public class PlanoCreateDto {
    [Required(ErrorMessage = "O nome é obrigatório.")]
    public string Nome { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue, ErrorMessage = "Preço deve ser maior que zero.")]
    public decimal Preco { get; set; }

    [Range(1, 24, ErrorMessage = "Duração deve ser entre 1 e 24 meses.")]
    public int DuracaoMeses { get; set; }
}

public class PlanoUpdateDto : PlanoCreateDto { }

public class PlanoDto {
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public int DuracaoMeses { get; set; }
}