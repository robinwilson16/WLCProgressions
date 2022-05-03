using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WLCProgressions.Migrations
{
    public partial class AddNoProgressionRoutetable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ChartData",
                columns: table => new
                {
                    ChartDataID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChartTitle = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Title = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Total = table.Column<int>(type: "int", nullable: false),
                    Number = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<double>(type: "float", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Level = table.Column<int>(type: "int", nullable: false),
                    AcademicYear = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: true),
                    CollegeCode = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: true),
                    CollegeName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    FacCode = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: true),
                    FacName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    TeamCode = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: true),
                    TeamName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    CourseID = table.Column<int>(type: "int", nullable: true),
                    CourseCode = table.Column<string>(type: "nvarchar(24)", maxLength: 24, nullable: true),
                    CourseTitle = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    GroupID = table.Column<int>(type: "int", nullable: true),
                    GroupCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    GroupName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChartData", x => x.ChartDataID);
                });

            migrationBuilder.CreateTable(
                name: "PRG_NoProgressionRoute",
                columns: table => new
                {
                    StudentRef = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    OfferingID = table.Column<int>(type: "int", nullable: false),
                    SystemDatabase = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AcademicYear = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: true),
                    OfferingGroupID = table.Column<int>(type: "int", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PRG_NoProgressionRoute", x => new { x.StudentRef, x.OfferingID });
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChartData");

            migrationBuilder.DropTable(
                name: "PRG_NoProgressionRoute");
        }
    }
}
