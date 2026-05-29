using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Moveli.API.Controllers.Admin;

[ApiController]
[Route("api/admin/upload")]
[Authorize(Roles = "Admin")]
public class AdminUploadController : ControllerBase
{
    private static readonly HashSet<string> AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    private static readonly HashSet<string> AllowedContentTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    private const long MaxFileSize = 5 * 1024 * 1024;
    private readonly IWebHostEnvironment _env;

    public AdminUploadController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpPost("image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file provided." });

        if (file.Length > MaxFileSize)
            return BadRequest(new { error = "File size exceeds 5MB limit." });

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
            return BadRequest(new { error = $"File type '{extension}' is not allowed. Allowed: {string.Join(", ", AllowedExtensions)}" });

        if (!AllowedContentTypes.Contains(file.ContentType.ToLowerInvariant()))
            return BadRequest(new { error = "Invalid file content type." });

        var now = DateTime.UtcNow;
        var relativePath = Path.Combine("uploads", now.ToString("yyyy"), now.ToString("MM"));
        var absolutePath = Path.Combine(_env.ContentRootPath, relativePath);
        Directory.CreateDirectory(absolutePath);

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(absolutePath, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        var url = $"/{relativePath.Replace("\\", "/")}/{fileName}";
        return Ok(new { url });
    }
}
