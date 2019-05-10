using System;
using System.Collections.Generic;
using System.Data;
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

namespace WLCProgressions.Pages.Students
{
    public class SaveProgressionModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public SaveProgressionModel(WLCProgressions.Data.ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [BindProperty]
        public Progression Progression { get; set; }

        public IActionResult OnGet(string system, string studentRef, string academicYear, int courseFromID, int? groupFromID, int courseToID, int? groupToID, string progressionType, int offerTypeID, int? offerConditionID)
        {
            Progression = new Progression
            {
                SystemDatabase = system,
                StudentRef = studentRef,
                AcademicYear = academicYear,
                CourseFromID = courseFromID,
                GroupFromID = groupFromID,
                CourseToID = courseToID,
                GroupToID = groupToID,
                ProgressionType = progressionType,
                OfferTypeID = offerTypeID,
                OfferConditionID = offerConditionID
            };
            if (studentRef == null || courseFromID <= 0 || courseToID <= 0 || offerTypeID <= 0)
            {
                return NotFound();
            }

            return new JsonResult(Progression);
        }

        public async Task<IActionResult> OnPostAsync()
        {
            string result = "";

            if (!ModelState.IsValid)
            {
                return Page();
            }

            try
            {
                //await _context.SaveChangesAsync();
                string systemDB = DatabaseSelector.GetDatabase(_configuration, Progression.SystemDatabase);
                var SystemParam = new SqlParameter("@System", systemDB);
                var AcademicYearParam = new SqlParameter("@AcademicYear", Progression.AcademicYear);
                var StudentRefParam = new SqlParameter("@StudentRef", Progression.StudentRef);
                var CourseFromIDParam = new SqlParameter("@CourseFromID", Progression.CourseFromID);
                var GroupFromIDParam = new SqlParameter("@GroupFromID", SqlDbType.Int);
                GroupFromIDParam.Value = (object)Progression.GroupFromID ?? DBNull.Value;
                var CourseToIDParam = new SqlParameter("@CourseToID", Progression.CourseToID);
                var GroupToIDParam = new SqlParameter("@GroupToID", SqlDbType.Int);
                GroupToIDParam.Value = (object)Progression.GroupToID ?? DBNull.Value;
                var ProgressionTypeParam = new SqlParameter("@ProgressionType", Progression.ProgressionType);
                var OfferTypeIDParam = new SqlParameter("@OfferTypeID", Progression.OfferTypeID);
                var OfferConditionIDParam = new SqlParameter("@OfferConditionID", SqlDbType.Int);
                OfferConditionIDParam.Value = (object)Progression.OfferConditionID ?? DBNull.Value;
                var UsernameParam = new SqlParameter("@Username", User.Identity.Name.Split('\\').Last());
                await _context.Database.ExecuteSqlCommandAsync("EXEC SPR_PRG_SaveProgression @System, @AcademicYear, @StudentRef, @CourseFromID, @GroupFromID, @CourseToID, @GroupToID, @ProgressionType, @OfferTypeID, @OfferConditionID, @Username", SystemParam, AcademicYearParam, StudentRefParam, CourseFromIDParam, GroupFromIDParam, CourseToIDParam, GroupToIDParam, ProgressionTypeParam, OfferTypeIDParam, OfferConditionIDParam, UsernameParam);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProgressionExists(Progression.StudentRef))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            result = "{ saved: \"Y\", error: \"\" }";

            return Content(result);

            //return RedirectToPage("../Index");
        }

        private bool ProgressionExists(string StudentRef)
        {
            return _context.Progression.Any(e => e.StudentRef == StudentRef);
        }
    }
}
