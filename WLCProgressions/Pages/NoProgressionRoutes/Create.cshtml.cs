using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using WLCProgressions.Data;
using WLCProgressions.Models;
using WLCProgressions.Shared;

namespace WLCProgressions.Pages.NoProgressionRoutes
{
    public class CreateModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public CreateModel(WLCProgressions.Data.ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public string UserDetails { get; set; }

        public string SystemID { get; set; }
        public string SystemILPID { get; set; }

        public async Task<IActionResult> OnGetAsync(string system, string studentRef, string academicYear, int offeringID, int? offeringGroupID, string notes)
        {
            string systemDB = DatabaseSelector.GetDatabase(_configuration, system);

            SystemID = systemDB;
            SystemILPID = "";

            NoProgressionRoute = new NoProgressionRoute
            {
                SystemDatabase = system,
                StudentRef = studentRef,
                AcademicYear = academicYear,
                OfferingID = offeringID,
                OfferingGroupID = offeringGroupID,
                Notes = notes,
            };
            //if (studentRef == null || offeringID <= 0)
            //{
            //    return NotFound();
            //}

            UserDetails = await Identity.GetFullName(system, academicYear, User.Identity.Name.Split('\\').Last(), _context, _configuration);

            return Page();
        }

        [BindProperty]
        public NoProgressionRoute NoProgressionRoute { get; set; }

        // To protect from overposting attacks, see https://aka.ms/RazorPagesCRUD
        public async Task<IActionResult> OnPostAsync()
        {
            string result = "";

            if (!ModelState.IsValid)
            {
                return Page();
            }

            //_context.NoProgressionRoute.Add(NoProgressionRoute);
            //await _context.SaveChangesAsync();
            string systemDB = DatabaseSelector.GetDatabase(_configuration, NoProgressionRoute.SystemDatabase);
            await _context.Database
                .ExecuteSqlInterpolatedAsync($"EXEC SPR_PRG_SaveNoProgressionRoute @System={systemDB}, @AcademicYear={NoProgressionRoute.AcademicYear}, @StudentRef={NoProgressionRoute.StudentRef}, @OfferingID={NoProgressionRoute.OfferingID}, @OfferingGroupID={NoProgressionRoute.OfferingGroupID}, @Notes={NoProgressionRoute.Notes}, @Username={User.Identity.Name.Split('\\').Last()}");

            result = "{ saved: \"Y\", error: \"\" }";
            return Content(result);
            //return RedirectToPage("./Index");
        }
    }
}
