namespace Moveli.API.Infrastructure.Storage;

/// <summary>Bound from the "Storage" configuration section.</summary>
public class StorageOptions
{
    /// <summary>"Local" (default) or "S3" (S3-compatible: Cloudflare R2 / AWS S3 / MinIO).</summary>
    public string Provider { get; set; } = "Local";

    public S3StorageOptions S3 { get; set; } = new();
}

public class S3StorageOptions
{
    /// <summary>S3-compatible endpoint, e.g. https://&lt;account&gt;.r2.cloudflarestorage.com (omit for AWS S3).</summary>
    public string? ServiceUrl { get; set; }
    public string? Region { get; set; }
    public string Bucket { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    /// <summary>Public base URL files are served from, e.g. https://cdn.moveli.ge (no trailing slash).</summary>
    public string PublicBaseUrl { get; set; } = string.Empty;
}
