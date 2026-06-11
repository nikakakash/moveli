using Moveli.Application.Common;

namespace Moveli.API.Infrastructure.Storage;

/// <summary>
/// Stores files on the local disk under the configured uploads path and returns a "/uploads/..."
/// URL served by the static-file middleware. Suitable for single-instance / development use;
/// files do not survive a redeploy on ephemeral hosts and are not shared across instances.
/// </summary>
public class LocalFileStorage : IFileStorage
{
    private readonly string _uploadsPath;

    public LocalFileStorage(IWebHostEnvironment env, IConfiguration configuration)
    {
        _uploadsPath = configuration["Storage:UploadsPath"]
            ?? Path.Combine(env.ContentRootPath, "uploads");
    }

    public async Task<string> SaveAsync(Stream content, string contentType, string extension, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var relativeDir = Path.Combine(now.ToString("yyyy"), now.ToString("MM"));
        var absoluteDir = Path.Combine(_uploadsPath, relativeDir);
        Directory.CreateDirectory(absoluteDir);

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(absoluteDir, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
            await content.CopyToAsync(stream, cancellationToken);

        return $"/uploads/{relativeDir.Replace("\\", "/")}/{fileName}";
    }
}
