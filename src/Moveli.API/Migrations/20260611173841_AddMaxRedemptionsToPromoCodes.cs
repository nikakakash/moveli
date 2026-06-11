using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Moveli.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMaxRedemptionsToPromoCodes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaxRedemptions",
                table: "PromoCodes",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxRedemptions",
                table: "PromoCodes");
        }
    }
}
