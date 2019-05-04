using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using WLCProgressions.Models;
using WLCProgressions.Shared;

namespace WLCProgressions.Pages.Students
{
    public class IndexModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;

        public IndexModel(WLCProgressions.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public IList<Student> Student { get;set; }

        public async Task OnGetAsync(string system, string AcademicYear, int CourseID, int GroupID)
        {
            //Student = await _context.Student.ToListAsync();
            string SystemDB = DatabaseSelector.GetDatabase(system);
            var SystemParam = new SqlParameter("@system", SystemDB);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(AcademicYear, _context);
            var AcademicYearParam = new SqlParameter("@AcademicYear", CurrentAcademicYear);
            var CourseIDParam = new SqlParameter("@CourseID", CourseID);
            var GroupIDParam = new SqlParameter("@GroupID", GroupID);

            Student = await _context.Student
                .FromSql("EXEC SPR_PRG_GetStudentList @System, @AcademicYear, @CourseID, @GroupID", SystemParam, AcademicYearParam, CourseIDParam, GroupIDParam)
                .ToListAsync();
        }

        public async Task<IActionResult> OnGetJsonAsync(string system, string AcademicYear, int CourseID, int GroupID)
        {
            string systemDB = DatabaseSelector.GetDatabase(system);
            var systemParam = new SqlParameter("@system", systemDB);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(AcademicYear, _context);
            var AcademicYearParam = new SqlParameter("@AcademicYear", CurrentAcademicYear);
            var CourseIDParam = new SqlParameter("@CourseID", CourseID);
            var GroupIDParam = new SqlParameter("@GroupID", GroupID);

            Student = await _context.Student
                .FromSql("EXEC SPR_PRG_GetStudentList @System, @AcademicYear, @CourseID, @GroupID", systemParam, AcademicYearParam, CourseIDParam, GroupIDParam)
                .ToListAsync();

            var collectionWrapper = new
            {
                Students = Student
            };

            return new JsonResult(collectionWrapper);
        }
    }
}
