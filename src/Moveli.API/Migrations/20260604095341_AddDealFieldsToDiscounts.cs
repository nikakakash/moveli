using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Moveli.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDealFieldsToDiscounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Discounts",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Placement",
                table: "Discounts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "ShowCountdown",
                table: "Discounts",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShowOnHome",
                table: "Discounts",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TitleEn",
                table: "Discounts",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TitleKa",
                table: "Discounts",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Discounts_Placement",
                table: "Discounts",
                column: "Placement");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Discounts_Placement",
                table: "Discounts");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Discounts");

            migrationBuilder.DropColumn(
                name: "Placement",
                table: "Discounts");

            migrationBuilder.DropColumn(
                name: "ShowCountdown",
                table: "Discounts");

            migrationBuilder.DropColumn(
                name: "ShowOnHome",
                table: "Discounts");

            migrationBuilder.DropColumn(
                name: "TitleEn",
                table: "Discounts");

            migrationBuilder.DropColumn(
                name: "TitleKa",
                table: "Discounts");
        }
    }
}
