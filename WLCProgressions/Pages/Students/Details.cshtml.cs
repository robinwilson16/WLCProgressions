using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using WLCProgressions.Models;
using WLCProgressions.Shared;

namespace WLCProgressions.Pages.Students
{
    public class DetailsModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public DetailsModel(WLCProgressions.Data.ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public Student Student { get; set; }
        public string UserDetails { get; set; }

        public string SystemID { get; set; }
        public string SystemILPID { get; set; }

        public async Task<IActionResult> OnGetAsync(string system, string systemILP, string AcademicYear, string StudentRef, int CourseID)
        {
            if (StudentRef == null)
            {
                return NotFound();
            }

            //Student = await _context.Student.ToListAsync();
            string systemDB = DatabaseSelector.GetDatabase(_configuration, system);
            string systemILPDB = DatabaseSelector.GetILPDatabase(_configuration, systemILP, system);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(AcademicYear, _context);
            string ProgressionAcademicYear = await AcademicYearFunctions.GetProgressionYear(AcademicYear, _context);

            SystemID = systemDB;
            SystemILPID = systemILPDB;
            UserDetails = await Identity.GetFullName(system, AcademicYear, User.Identity.Name.Split('\\').Last(), _context, _configuration);

            Student = (await _context.Student
                .FromSqlInterpolated($"EXEC SPR_PRG_GetStudent @System={systemDB}, @AcademicYear={ProgressionAcademicYear}, @StudentRef={StudentRef}, @CourseID={CourseID}")
                .ToListAsync())
                .FirstOrDefault();

            if (Student == null)
            {
                return NotFound();
            }
            return Page();
        }

        public async Task<IActionResult> OnGetJsonAsync(string system, string systemILP, string AcademicYear, string StudentRef, int CourseID)
        {
            //Student = await _context.Student.ToListAsync();
            string systemDB = DatabaseSelector.GetDatabase(_configuration, system);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(AcademicYear, _context);
            string ProgressionAcademicYear = await AcademicYearFunctions.GetProgressionYear(AcademicYear, _context);

            SystemID = systemDB;
            UserDetails = await Identity.GetFullName(system, AcademicYear, User.Identity.Name.Split('\\').Last(), _context, _configuration);

            Student = (await _context.Student
                .FromSqlInterpolated($"EXEC SPR_PRG_GetStudent @System={systemDB}, @AcademicYear={ProgressionAcademicYear}, @StudentRef={StudentRef}, @CourseID={CourseID}")
                .ToListAsync())
                .FirstOrDefault();

            var collectionWrapper = new
            {
                student = Student
            };

            return new JsonResult(collectionWrapper);
        }
    }
}
