# Build from the repository root:  docker build -f src/Moveli.API/Dockerfile -t moveli-api .
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Restore first (layer-cached) using only the project files.
COPY src/Moveli.Domain/Moveli.Domain.csproj src/Moveli.Domain/
COPY src/Moveli.Application/Moveli.Application.csproj src/Moveli.Application/
COPY src/Moveli.API/Moveli.API.csproj src/Moveli.API/
RUN dotnet restore src/Moveli.API/Moveli.API.csproj

COPY src/ src/
RUN dotnet publish src/Moveli.API/Moveli.API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
# curl is used by the HEALTHCHECK below.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Non-root user. Pre-create the volume mount points (/keys, /uploads) owned by it: empty named
# volumes inherit the ownership of the image directory at their mount path on first mount, so
# this is what lets the non-root process persist DataProtection keys and uploaded images.
RUN adduser --disabled-password --gecos "" appuser \
    && mkdir -p /keys /uploads \
    && chown -R appuser /keys /uploads
COPY --from=build --chown=appuser /app/publish .
# Make the content root itself writable by appuser so the app can create its DEFAULT
# keys/uploads subdirs when DataProtection__KeysPath / Storage__UploadsPath aren't overridden.
RUN chown appuser /app
USER appuser

# TLS is terminated at the proxy; the container listens on HTTP. UseForwardedHeaders restores
# the original scheme/IP (configure ForwardedHeaders:KnownProxies / TrustAllProxies).
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# start-period covers first-boot migrations + seeding before failures count.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -fsS http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "Moveli.API.dll"]
