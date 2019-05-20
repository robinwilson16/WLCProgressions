using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WLCProgressions.Models;

namespace WLCProgressions.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {

        }

        public DbSet<Config> Config { get; set; }
        public DbSet<CourseGroup> CourseGroup { get; set; }
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

            modelBuilder.Entity<Progression>()
                .HasKey(c => new { c.StudentRef, c.CourseFromID });

            modelBuilder.Entity<SelectListData>()
                .HasKey(d => new { d.Code });

            modelBuilder.Entity<StaffMember>()
                .HasKey(c => new { c.StaffRef });

            modelBuilder.Entity<Student>()
                .HasKey(s => new { s.StudentRef });
        }
    }
}
