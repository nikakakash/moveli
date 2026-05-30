using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Moveli.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCartItemUniqueIndex : Migration
    {
        // Note: the xmin optimistic-concurrency tokens on Products/StoreSettings map to the
        // PostgreSQL system column, which already exists — no AddColumn is emitted here.

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Collapse any pre-existing duplicate (CartId, ProductId) rows into one before the
            // unique index is created, summing their quantities. No-op on a clean database.
            // A WITH clause is scoped to a single statement, so each statement carries its own.
            migrationBuilder.Sql(@"
                WITH ranked AS (
                    SELECT ""Id"",
                           ROW_NUMBER() OVER (PARTITION BY ""CartId"", ""ProductId"" ORDER BY ""CreatedAt"") AS rn,
                           SUM(""Quantity"") OVER (PARTITION BY ""CartId"", ""ProductId"") AS total
                    FROM ""CartItems""
                )
                UPDATE ""CartItems"" c SET ""Quantity"" = r.total
                FROM ranked r WHERE c.""Id"" = r.""Id"" AND r.rn = 1;
            ");
            migrationBuilder.Sql(@"
                WITH ranked AS (
                    SELECT ""Id"",
                           ROW_NUMBER() OVER (PARTITION BY ""CartId"", ""ProductId"" ORDER BY ""CreatedAt"") AS rn
                    FROM ""CartItems""
                )
                DELETE FROM ""CartItems"" c
                USING ranked r WHERE c.""Id"" = r.""Id"" AND r.rn > 1;
            ");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_CartId",
                table: "CartItems");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartId_ProductId",
                table: "CartItems",
                columns: new[] { "CartId", "ProductId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CartItems_CartId_ProductId",
                table: "CartItems");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartId",
                table: "CartItems",
                column: "CartId");
        }
    }
}
