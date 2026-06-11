namespace Moveli.Application.Common;

/// <summary>
/// Persists uploaded files and returns a public URL. Implementations: local disk (single
/// instance / dev) or an S3-compatible object store (Cloudflare R2 / AWS S3) for durable,
/// multi-instance hosting.
/// </summary>
public interface IFileStorage
{
    Task<string> SaveAsync(Stream content, string contentType, string extension, CancellationToken cancellationToken = default);
}
