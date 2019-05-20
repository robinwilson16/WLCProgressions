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

        public IndexModel(WLCProgressions.Data.ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
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

        public async Task OnGetAsync(string system, string systemILP, string academicYear)
        {
            string defaultAcademicYear = await AcademicYearFunctions.GetDefaultAcademicYear(_context);

            string systemDB = DatabaseSelector.GetDatabase(_configuration, system);
            string systemILPDB = DatabaseSelector.GetILPDatabase(_configuration, systemILP, system);
            var systemParam = new SqlParameter("@System", systemDB);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(academicYear, _context);
            var academicYearParam = new SqlParameter("@AcademicYear", CurrentAcademicYear);
            string ProgressionAcademicYear = await AcademicYearFunctions.GetProgressionYear(academicYear, _context);
            var progressionYearParam = new SqlParameter("@AcademicYear", CurrentAcademicYear);

            SystemID = systemDB;
            SystemILPID = systemILPDB;
            AcademicYear = CurrentAcademicYear;
            ProgressionYear = ProgressionAcademicYear;
            DefaultAcademicYear = defaultAcademicYear;

            var academicYearSelectListParam = new SqlParameter("@Domain", "ACADEMIC_YEAR");
            AcademicYearData = await _context.SelectListData
                .FromSql("EXEC SPR_PRG_SelectListData @System, @AcademicYear, @Domain", systemParam, academicYearParam, academicYearSelectListParam)
                .ToListAsync();

            ViewData["AcademicYearID"] = new SelectList(AcademicYearData, "Code", "Description", CurrentAcademicYear);

            var applicationOffer = new SqlParameter("@Domain", "APPLICATION_OFFER");
            ApplicationOffer = await _context.SelectListData
                .FromSql("EXEC SPR_PRG_SelectListData @System, @AcademicYear, @Domain", systemParam, academicYearParam, applicationOffer)
                .ToListAsync();

            ViewData["OfferID"] = new SelectList(ApplicationOffer, "Code", "Description");

            var applicationCondition = new SqlParameter("@Domain", "APPLICATION_CONDITION");
            ApplicationCondition = await _context.SelectListData
                .FromSql("EXEC SPR_PRG_SelectListData @System, @AcademicYear, @Domain", systemParam, academicYearParam, applicationCondition)
                .ToListAsync();

            ViewData["ConditionID"] = new SelectList(ApplicationCondition, "Code", "Description");

            UserDetails = await Identity.GetFullName(system, academicYear, User.Identity.Name.Split('\\').Last(), _context, _configuration);

            UserGreeting = Identity.GetGreeting();

            SystemVersion = _configuration["Version"];
        }
    }
}
