using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Moveli.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDealsHeroImagesToStoreSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DealsHeroImagePrimaryUrl",
                table: "StoreSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DealsHeroImageSecondaryUrl",
                table: "StoreSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DealsHeroImagePrimaryUrl",
                table: "StoreSettings");

            migrationBuilder.DropColumn(
                name: "DealsHeroImageSecondaryUrl",
                table: "StoreSettings");
        }
    }
}
