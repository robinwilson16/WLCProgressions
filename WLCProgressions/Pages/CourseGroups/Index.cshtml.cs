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

namespace WLCProgressions.Pages.CourseGroups
{
    public class IndexModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;

        public IndexModel(WLCProgressions.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public IList<CourseGroup> CourseGroup { get;set; }

        public async Task OnGetAsync(string system, string academicYear, string search)
        {
            if (String.IsNullOrEmpty(search))
            {
                search = "";
            }

            //CourseGroup = await _context.CourseGroup.ToListAsync();
            string systemDB = DatabaseSelector.GetDatabase(system);
            var systemParam = new SqlParameter("@System", systemDB);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(academicYear, _context);
            var academicYearParam = new SqlParameter("@AcademicYear", CurrentAcademicYear);
            var searchParam = new SqlParameter("@CourseSearch", search);

            CourseGroup = await _context.CourseGroup
                .FromSql("EXEC SPR_PRG_GetCourseGroupList @System, @AcademicYear, @CourseSearch", systemParam, academicYearParam, searchParam)
                .ToListAsync();
        }

        public async Task<IActionResult> OnGetJsonAsync(string system, string academicYear, string search)
        {
            if (String.IsNullOrEmpty(search))
            {
                search = "";
            }

            //CourseGroup = await _context.CourseGroup.ToListAsync();
            string systemDB = DatabaseSelector.GetDatabase(system);
            var systemParam = new SqlParameter("@System", systemDB);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(academicYear, _context);
            var academicYearParam = new SqlParameter("@AcademicYear", CurrentAcademicYear);
            var searchParam = new SqlParameter("@CourseSearch", search);

            CourseGroup = await _context.CourseGroup
                .FromSql("EXEC SPR_PRG_GetCourseGroupList @System, @AcademicYear, @CourseSearch", systemParam, academicYearParam, searchParam)
                .ToListAsync();

            var collectionWrapper = new
            {
                Courses = CourseGroup
            };

            return new JsonResult(collectionWrapper);
        }
    }
}
