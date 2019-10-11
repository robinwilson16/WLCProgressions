using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using WLCProgressions.Data;
using WLCProgressions.Models;
using WLCProgressions.Shared;

namespace WLCProgressions.Pages.Charts
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

        public IList<ChartData> ChartData { get;set; }

        public async Task OnGetAsync(string system, string academicYear, string measure, int level, string drill)
        {
            //ChartData = await _context.ChartData.ToListAsync();
            string systemDB = DatabaseSelector.GetDatabase(_configuration, system);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(academicYear, _context);

            ChartData = await _context.ChartData
                .FromSqlInterpolated($"EXEC SPR_PRG_GetOutcomesChartData @System={systemDB}, @AcademicYear={CurrentAcademicYear}, @Measure={measure}, @Level={level}, @Drill={drill}")
                .ToListAsync();
        }

        public async Task<JsonResult> OnGetJsonAsync(string system, string academicYear, string measure, int level, string drill)
        {
            //ChartData = await _context.ChartData.ToListAsync();
            string systemDB = DatabaseSelector.GetDatabase(_configuration, system);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(academicYear, _context);

            ChartData = await _context.ChartData
                .FromSqlInterpolated($"EXEC SPR_PRG_GetOutcomesChartData @System={systemDB}, @AcademicYear={CurrentAcademicYear}, @Measure={measure}, @Level={level}, @Drill={drill}")
                .ToListAsync();

            var collectionWrapper = new
            {
                ChartData = ChartData
            };

            return new JsonResult(collectionWrapper);
        }
    }
}
