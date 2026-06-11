using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Moveli.API.Migrations
{
    /// <inheritdoc />
    public partial class AddIsComingSoonToCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsComingSoon",
                table: "Categories",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsComingSoon",
                table: "Categories");
        }
    }
}
