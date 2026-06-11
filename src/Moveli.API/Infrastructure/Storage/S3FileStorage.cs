using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using Moveli.Application.Common;

namespace Moveli.API.Infrastructure.Storage;

/// <summary>
/// Stores files in an S3-compatible bucket (Cloudflare R2 / AWS S3 / MinIO). Durable and shared
/// across instances. Returns a public URL based on the configured public base URL.
/// </summary>
public class S3FileStorage : IFileStorage
{
    private readonly IAmazonS3 _client;
    private readonly S3StorageOptions _options;

    public S3FileStorage(IOptions<StorageOptions> options)
    {
        _options = options.Value.S3;

        var config = new AmazonS3Config { ForcePathStyle = true };
        if (!string.IsNullOrWhiteSpace(_options.ServiceUrl))
            config.ServiceURL = _options.ServiceUrl;
        if (!string.IsNullOrWhiteSpace(_options.Region))
            config.AuthenticationRegion = _options.Region;

        _client = new AmazonS3Client(_options.AccessKey, _options.SecretKey, config);
    }

    public async Task<string> SaveAsync(Stream content, string contentType, string extension, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var key = $"{now:yyyy}/{now:MM}/{Guid.NewGuid()}{extension}";

        await _client.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _options.Bucket,
            Key = key,
            InputStream = content,
            ContentType = contentType,
            DisablePayloadSigning = true // required by some S3-compatibles (e.g. R2)
        }, cancellationToken);

        return $"{_options.PublicBaseUrl.TrimEnd('/')}/{key}";
    }
}
