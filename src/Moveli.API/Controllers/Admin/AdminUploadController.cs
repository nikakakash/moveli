using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Moveli.Application.Common;

namespace Moveli.API.Controllers.Admin;

[ApiController]
[Route("api/admin/upload")]
[Authorize(Roles = "Admin")]
public class AdminUploadController : ControllerBase
{
    private static readonly HashSet<string> AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    private static readonly HashSet<string> AllowedContentTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    private const long MaxFileSize = 5 * 1024 * 1024;
    private readonly IFileStorage _fileStorage;

    public AdminUploadController(IFileStorage fileStorage)
    {
        _fileStorage = fileStorage;
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

        // The extension and Content-Type are both client-controlled. Verify the actual file
        // signature (magic bytes) matches a real image so a non-image payload can't be stored
        // and later served under an image URL.
        await using var upload = file.OpenReadStream();
        var header = new byte[12];
        var read = await upload.ReadAsync(header.AsMemory(0, header.Length), HttpContext.RequestAborted);
        if (read < 12 || !IsAllowedImageSignature(header))
            return BadRequest(new { error = "File content is not a valid image." });
        upload.Position = 0;

        var url = await _fileStorage.SaveAsync(upload, file.ContentType, extension, HttpContext.RequestAborted);
        return Ok(new { url });
    }

    // Matches JPEG, PNG, GIF87a/89a, and WEBP (RIFF....WEBP) container signatures.
    private static bool IsAllowedImageSignature(ReadOnlySpan<byte> h)
    {
        if (h.Length < 12) return false;
        // JPEG: FF D8 FF
        if (h[0] == 0xFF && h[1] == 0xD8 && h[2] == 0xFF) return true;
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (h[0] == 0x89 && h[1] == 0x50 && h[2] == 0x4E && h[3] == 0x47
            && h[4] == 0x0D && h[5] == 0x0A && h[6] == 0x1A && h[7] == 0x0A) return true;
        // GIF: "GIF8"
        if (h[0] == 0x47 && h[1] == 0x49 && h[2] == 0x46 && h[3] == 0x38) return true;
        // WEBP: "RIFF" .... "WEBP"
        if (h[0] == 0x52 && h[1] == 0x49 && h[2] == 0x46 && h[3] == 0x46
            && h[8] == 0x57 && h[9] == 0x45 && h[10] == 0x42 && h[11] == 0x50) return true;
        return false;
    }
}
