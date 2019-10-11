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
                await _context.Database
                    .ExecuteSqlInterpolatedAsync($"EXEC SPR_PRG_SaveProgression @System={systemDB}, @AcademicYear={Progression.AcademicYear}, @StudentRef={Progression.StudentRef}, @CourseFromID={Progression.CourseFromID}, @GroupFromID={Progression.GroupFromID}, @CourseToID={Progression.CourseToID}, @GroupToID={Progression.GroupToID}, @ProgressionType={Progression.ProgressionType}, @OfferTypeID={Progression.OfferTypeID}, @OfferConditionID={Progression.OfferConditionID}, @Username={User.Identity.Name.Split('\\').Last()}");
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
