using System;
using System.Collections.Generic;
using System.Data.SqlClient;
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
    public class IndexModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public IndexModel(WLCProgressions.Data.ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public IList<Student> Student { get;set; }

        public async Task OnGetAsync(string system, string systemILP, string AcademicYear, int CourseID, int GroupID)
        {
            //Student = await _context.Student.ToListAsync();
            string systemDB = DatabaseSelector.GetDatabase(_configuration, system);
            string SystemILPDB = DatabaseSelector.GetILPDatabase(_configuration, systemILP, system);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(AcademicYear, _context);

            Student = await _context.Student
                .FromSqlInterpolated($"EXEC SPR_PRG_GetStudentList @System={systemDB}, @SystemILP={SystemILPDB}, @AcademicYear={CurrentAcademicYear}, @CourseID={CourseID}, @GroupID={GroupID}")
                .ToListAsync();
        }

        public async Task<IActionResult> OnGetJsonAsync(string system, string systemILP, string AcademicYear, int CourseID, int GroupID)
        {
            string systemDB = DatabaseSelector.GetDatabase(_configuration, system);
            string SystemILPDB = DatabaseSelector.GetILPDatabase(_configuration, systemILP, system);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(AcademicYear, _context);

            Student = await _context.Student
                .FromSqlInterpolated ($"EXEC SPR_PRG_GetStudentList @System={systemDB}, @SystemILP={SystemILPDB}, @AcademicYear={CurrentAcademicYear}, @CourseID={CourseID}, @GroupID={GroupID}")
                .ToListAsync();

            var collectionWrapper = new
            {
                Students = Student
            };

            return new JsonResult(collectionWrapper);
        }
    }
}
