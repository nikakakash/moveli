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
# Run as a non-root user.
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser
COPY --from=build /app/publish .

# TLS is terminated at the proxy; the container listens on HTTP. UseForwardedHeaders restores
# the original scheme/IP (configure ForwardedHeaders:KnownProxies for the deployment).
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Moveli.API.dll"]
