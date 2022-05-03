using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WLCProgressions.Models;

namespace WLCProgressions.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options,
            IConfiguration _configuration)
            : base(options)
        {
            configuration = _configuration;
        }

        public IConfiguration configuration { get; }
        public DbSet<Config> Config { get; set; }
        public DbSet<ChartData> ChartData { get; set; }
        public DbSet<CourseGroup> CourseGroup { get; set; }
        public DbSet<Progression> NoProgressionRoute { get; set; }
        public DbSet<Progression> Progression { get; set; }
        public DbSet<SelectListData> SelectListData { get; set; }
        public DbSet<StaffMember> StaffMember { get; set; }
        public DbSet<Student> Student { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Config>()
                .HasKey(c => new { c.AcademicYear });

            modelBuilder.Entity<CourseGroup>()
                .HasKey(c => new { c.CourseID, c.GroupID });

            modelBuilder.Entity<NoProgressionRoute>()
                .HasKey(c => new { c.SystemDatabase, c.StudentRef, c.OfferingID });

            modelBuilder.Entity<Progression>()
                .HasKey(c => new { c.StudentRef, c.CourseFromID });

            modelBuilder.Entity<SelectListData>()
                .HasKey(d => new { d.Code });

            modelBuilder.Entity<StaffMember>()
                .HasKey(c => new { c.StaffRef });

            modelBuilder.Entity<Student>()
                .HasKey(s => new { s.StudentRef });

            //Prevent creating table in EF Migration
            modelBuilder.Entity<Config>(entity => {
                entity.ToView("ChartData", "dbo");
            });
            modelBuilder.Entity<Config>(entity => {
                entity.ToView("Config", "dbo");
            });
            modelBuilder.Entity<CourseGroup>(entity => {
                entity.ToView("CourseGroup", "dbo");
            });
            modelBuilder.Entity<Progression>(entity => {
                entity.ToView("Progression", "dbo");
            });
            modelBuilder.Entity<SelectListData>(entity => {
                entity.ToView("SelectListData", "dbo");
            });
            modelBuilder.Entity<StaffMember>(entity => {
                entity.ToView("StaffMember", "dbo");
            });
            modelBuilder.Entity<Student>(entity => {
                entity.ToView("Student", "dbo");
            });
        }

        //Rename migration history table
        protected override void OnConfiguring(DbContextOptionsBuilder options)
            => options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                x => x.MigrationsHistoryTable("__PRG_EFMigrationsHistory", "dbo"));

        //Rename migration history table
        public DbSet<WLCProgressions.Models.NoProgressionRoute> NoProgressionRoute_1 { get; set; }
    }
}
