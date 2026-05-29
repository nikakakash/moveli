using Microsoft.AspNetCore.Identity;

namespace Moveli.API.Infrastructure.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PreferredLanguage { get; set; } = "ka";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
