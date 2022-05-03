using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WLCProgressions.Migrations
{
    public partial class AddedSystemDatabaseaspartofPrimaryKeyforNoProgressionRouteTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_PRG_NoProgressionRoute",
                table: "PRG_NoProgressionRoute");

            migrationBuilder.AlterColumn<string>(
                name: "SystemDatabase",
                table: "PRG_NoProgressionRoute",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_PRG_NoProgressionRoute",
                table: "PRG_NoProgressionRoute",
                columns: new[] { "SystemDatabase", "StudentRef", "OfferingID" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_PRG_NoProgressionRoute",
                table: "PRG_NoProgressionRoute");

            migrationBuilder.AlterColumn<string>(
                name: "SystemDatabase",
                table: "PRG_NoProgressionRoute",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AddPrimaryKey(
                name: "PK_PRG_NoProgressionRoute",
                table: "PRG_NoProgressionRoute",
                columns: new[] { "StudentRef", "OfferingID" });
        }
    }
}
