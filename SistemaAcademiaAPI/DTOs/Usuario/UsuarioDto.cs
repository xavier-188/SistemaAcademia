using System.ComponentModel.DataAnnotations;

namespace SistemaAcademiaAPI.DTOs;

public class UsuarioCreateDto {
    [Required(ErrorMessage = "Login é obrigatório.")]
    public string Login { get; set; } = string.Empty;

    [Required(ErrorMessage = "Senha é obrigatória.")]
    public string Senha { get; set; } = string.Empty;

    [Required(ErrorMessage = "Confirmar Senha é obrigatória.")]
    public string ConfirmarSenha { get; set; } = string.Empty;
}

public class UsuarioDto {
    public int Id { get; set; }
    public string Login { get; set; } = string.Empty;
}