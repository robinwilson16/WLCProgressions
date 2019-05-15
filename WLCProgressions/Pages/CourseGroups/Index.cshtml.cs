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

namespace WLCProgressions.Pages.CourseGroups
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

        public IList<CourseGroup> CourseGroup { get;set; }

        public async Task OnGetAsync(string system, string academicYear, bool hasEnrols, string search)
        {
            if (String.IsNullOrEmpty(search))
            {
                search = "";
            }

            //CourseGroup = await _context.CourseGroup.ToListAsync();
            string systemDB = DatabaseSelector.GetDatabase(_configuration, system);
            var systemParam = new SqlParameter("@System", systemDB);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(academicYear, _context);
            var academicYearParam = new SqlParameter("@AcademicYear", CurrentAcademicYear);
            var hasEnrolsParam = new SqlParameter("@HasEnrols", hasEnrols);
            var searchParam = new SqlParameter("@CourseSearch", search);

            CourseGroup = await _context.CourseGroup
                .FromSql("EXEC SPR_PRG_GetCourseGroupList @System, @AcademicYear, @HasEnrols, @CourseSearch", systemParam, academicYearParam, hasEnrolsParam, searchParam)
                .ToListAsync();
        }

        public async Task<IActionResult> OnGetJsonAsync(string system, string academicYear, bool hasEnrols, string search)
        {
            if (String.IsNullOrEmpty(search))
            {
                search = "";
            }

            //CourseGroup = await _context.CourseGroup.ToListAsync();
            string systemDB = DatabaseSelector.GetDatabase(_configuration, system);
            var systemParam = new SqlParameter("@System", systemDB);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(academicYear, _context);
            var academicYearParam = new SqlParameter("@AcademicYear", CurrentAcademicYear);
            var hasEnrolsParam = new SqlParameter("@HasEnrols", hasEnrols);
            var searchParam = new SqlParameter("@CourseSearch", search);

            CourseGroup = await _context.CourseGroup
                .FromSql("EXEC SPR_PRG_GetCourseGroupList @System, @AcademicYear, @HasEnrols, @CourseSearch", systemParam, academicYearParam, hasEnrolsParam, searchParam)
                .ToListAsync();

            var collectionWrapper = new
            {
                Courses = CourseGroup
            };

            return new JsonResult(collectionWrapper);
        }
    }
}
