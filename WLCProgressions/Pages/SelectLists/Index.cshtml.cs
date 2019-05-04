using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using WLCProgressions.Data;
using WLCProgressions.Models;
using WLCProgressions.Shared;

namespace WLCProgressions.Pages.SelectLists
{
    public class IndexModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;

        public IndexModel(WLCProgressions.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public IList<SelectListData> SelectListData { get;set; }

        public async Task OnGetAsync(string system, string academicYear, string domain)
        {
            //SelectListData = await _context.SelectListData.ToListAsync();

            if (String.IsNullOrEmpty(domain))
            {
                domain = "";
            }

            string systemDB = DatabaseSelector.GetDatabase(system);
            var systemParam = new SqlParameter("@system", systemDB);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(academicYear, _context);
            var academicYearParam = new SqlParameter("@AcademicYear", CurrentAcademicYear);
            var domainParam = new SqlParameter("@Domain", domain);

            SelectListData = await _context.SelectListData
                .FromSql("EXEC SPR_PRG_SelectListData @System, @AcademicYear, @Domain", systemParam, academicYearParam, domainParam)
                .ToListAsync();
        }

        public async Task<IActionResult> OnGetJsonAsync(string system, string academicYear, string domain)
        {
            if (String.IsNullOrEmpty(domain))
            {
                domain = "";
            }

            string systemDB = DatabaseSelector.GetDatabase(system);
            var systemParam = new SqlParameter("@system", systemDB);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(academicYear, _context);
            var academicYearParam = new SqlParameter("@AcademicYear", CurrentAcademicYear);
            var domainParam = new SqlParameter("@Domain", domain);

            SelectListData = await _context.SelectListData
                .FromSql("EXEC SPR_PRG_SelectListData @System, @AcademicYear, @Domain", systemParam, academicYearParam, domainParam)
                .ToListAsync();

            var collectionWrapper = new
            {
                SelectOptions = SelectListData
            };

            return new JsonResult(collectionWrapper);
        }
    }
}
