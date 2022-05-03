using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WLCProgressions.Migrations
{
    public partial class AddCreatedandUpdatedfieldstoNoProgressionRouteTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "PRG_NoProgressionRoute",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "PRG_NoProgressionRoute",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "PRG_NoProgressionRoute",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "PRG_NoProgressionRoute",
                type: "datetime2",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "PRG_NoProgressionRoute");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "PRG_NoProgressionRoute");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "PRG_NoProgressionRoute");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "PRG_NoProgressionRoute");
        }
    }
}
