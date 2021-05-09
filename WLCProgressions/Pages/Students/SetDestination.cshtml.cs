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
    public class SetDestinationModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public SetDestinationModel(WLCProgressions.Data.ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [BindProperty]
        public Student Student { get; set; }

        public async Task<IActionResult> OnGetAsync(string system, string academicYear, string studentRef)
        {
            if (studentRef == null)
            {
                return NotFound();
            }

            //Student = await _context.Student.FirstOrDefaultAsync(m => m.StudentRef == StudentRef);
            string systemDB = DatabaseSelector.GetDatabase(_configuration, system);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(academicYear, _context);

            Student = (await _context.Student
                .FromSqlInterpolated($"EXEC SPR_PRG_GetStudent @System={systemDB}, @AcademicYear={CurrentAcademicYear}, @StudentRef={studentRef}")
                .ToListAsync())
                .FirstOrDefault();

            if (Student == null)
            {
                return NotFound();
            }
            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string system, string academicYear)
        {
            string result = "";

            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.Attach(Student).State = EntityState.Modified;

            try
            {
                //await _context.SaveChangesAsync();
                string systemDB = DatabaseSelector.GetDatabase(_configuration, system);

                await _context.Database
                    .ExecuteSqlInterpolatedAsync($"EXEC SPR_PRG_UpdateDestination @System={systemDB}, @AcademicYear={Student.AcademicYear}, @StudentRef={Student.StudentRef}, @Destination={Student.DestinationCode}, @DestinationIsActual={Student.DestinationIsActual}, @Username={User.Identity.Name.Split('\\').Last()}");

                result = "{ saved: \"Y\", error: \"\" }";
            }
            catch (DbUpdateConcurrencyException e)
            {
                //if (!StudentExists(Student.StudentRef))
                //{
                //    return NotFound();
                //}
                //else
                //{
                    //throw;
                    result = "{ saved: \"N\", error: " + e.Message + " }";
                //}
            }

            return Content(result);

            //return RedirectToPage("../Index");
        }

        private bool StudentExists(string StudentRef)
        {
            return _context.Student.Any(e => e.StudentRef == StudentRef);
        }
    }
}
