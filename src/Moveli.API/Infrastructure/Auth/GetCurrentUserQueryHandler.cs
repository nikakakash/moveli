using MediatR;
using Microsoft.AspNetCore.Identity;
using Moveli.API.Infrastructure.Identity;
using Moveli.Application.Auth.DTOs;
using Moveli.Application.Auth.Queries;
using Moveli.Application.Common;

namespace Moveli.API.Infrastructure.Auth;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, Result<UserDto>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ICurrentUser _currentUser;

    public GetCurrentUserQueryHandler(UserManager<ApplicationUser> userManager, ICurrentUser currentUser)
    {
        _userManager = userManager;
        _currentUser = currentUser;
    }

    public async Task<Result<UserDto>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || !_currentUser.UserId.HasValue)
            return Result<UserDto>.Failure("Not authenticated.");

        var user = await _userManager.FindByIdAsync(_currentUser.UserId.Value.ToString());
        if (user == null)
            return Result<UserDto>.Failure("User not found.");

        var roles = await _userManager.GetRolesAsync(user);

        return Result<UserDto>.Success(new UserDto(
            user.Id, user.Email!, user.FirstName, user.LastName, user.PhoneNumber ?? "", user.PreferredLanguage, roles.ToList()));
    }
}
