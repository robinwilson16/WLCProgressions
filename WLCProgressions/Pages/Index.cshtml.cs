using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using WLCProgressions.Models;
using WLCProgressions.Shared;

namespace WLCProgressions.Pages
{
    public class IndexModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly bool _showCharts;
        private readonly bool _showCoursesWithoutEnrols;

        public IndexModel(WLCProgressions.Data.ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
            _showCharts = configuration.GetValue<bool>("ShowCharts");
            _showCoursesWithoutEnrols = configuration.GetValue<bool>("ShowCoursesWithoutEnrols");
        }

        public IList<SelectListData> AcademicYearData { get; set; }
        public IList<SelectListData> ApplicationOffer { get; set; }
        public IList<SelectListData> ApplicationCondition { get; set; }

        public string SystemID { get; set; }
        public string SystemILPID { get; set; }
        public string AcademicYear { get; set; }
        public string ProgressionYear { get; set; }
        public string DefaultAcademicYear { get; set; }

        public string UserDetails { get; set; }
        public string UserGreeting { get; set; }

        public string SystemVersion { get; set; }

        public string Browser { get; set; }

        public bool ShowCharts { get; set; }

        public int ShowCoursesWithoutEnrols { get; set; }

        public async Task OnGetAsync(string system, string systemILP, string academicYear)
        {
            string defaultAcademicYear = await AcademicYearFunctions.GetDefaultAcademicYear(_context);

            string systemDB = DatabaseSelector.GetDatabase(_configuration, system);
            string systemILPDB = DatabaseSelector.GetILPDatabase(_configuration, systemILP, system);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(academicYear, _context);
            string ProgressionAcademicYear = await AcademicYearFunctions.GetProgressionYear(academicYear, _context);

            SystemID = systemDB;
            SystemILPID = systemILPDB;
            AcademicYear = CurrentAcademicYear;
            ProgressionYear = ProgressionAcademicYear;
            DefaultAcademicYear = defaultAcademicYear;
            string selectListDomain = null;

            selectListDomain = "ACADEMIC_YEAR";
            AcademicYearData = await _context.SelectListData
                .FromSqlInterpolated($"EXEC SPR_PRG_SelectListData @System={systemDB}, @AcademicYear={CurrentAcademicYear}, @Domain={selectListDomain}")
                .ToListAsync();

            ViewData["AcademicYearID"] = new SelectList(AcademicYearData, "Code", "Description", CurrentAcademicYear);

            selectListDomain = "APPLICATION_OFFER";
            ApplicationOffer = await _context.SelectListData
                .FromSqlInterpolated($"EXEC SPR_PRG_SelectListData @System={systemDB}, @AcademicYear={CurrentAcademicYear}, @Domain={selectListDomain}")
                .ToListAsync();

            ViewData["OfferID"] = new SelectList(ApplicationOffer, "Code", "Description");

            selectListDomain = "APPLICATION_CONDITION";
            ApplicationCondition = await _context.SelectListData
                 .FromSqlInterpolated($"EXEC SPR_PRG_SelectListData @System={systemDB}, @AcademicYear={CurrentAcademicYear}, @Domain={selectListDomain}")
                .ToListAsync();

            ViewData["ConditionID"] = new SelectList(ApplicationCondition, "Code", "Description");

            UserDetails = await Identity.GetFullName(system, academicYear, User.Identity.Name.Split('\\').Last(), _context, _configuration);

            UserGreeting = Identity.GetGreeting();

            SystemVersion = _configuration["Version"];

            Browser = Request.Headers["User-Agent"];

            ShowCharts = _showCharts;

            if (_showCoursesWithoutEnrols == true)
            {
                ShowCoursesWithoutEnrols = 1;
            }
            else
            {
                ShowCoursesWithoutEnrols = 0;
            }           
        }
    }
}
