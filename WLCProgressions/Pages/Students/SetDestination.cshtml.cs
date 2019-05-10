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
            var SystemParam = new SqlParameter("@system", systemDB);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(academicYear, _context);
            var AcademicYearParam = new SqlParameter("@AcademicYear", CurrentAcademicYear);
            var StudentRefParam = new SqlParameter("@StudentRef", studentRef);

            Student = await _context.Student
                .FromSql("EXEC SPR_PRG_GetStudent @System, @AcademicYear, @StudentRef", SystemParam, AcademicYearParam, StudentRefParam).FirstOrDefaultAsync();

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
                var SystemParam = new SqlParameter("@System", systemDB);
                var AcademicYearParam = new SqlParameter("@AcademicYear", Student.AcademicYear);
                var StudentRefParam = new SqlParameter("@StudentRef", Student.StudentRef);
                var DestinationParam = new SqlParameter("@Destination", SqlDbType.Int);
                DestinationParam.Value = (object)Student.DestinationCode ?? DBNull.Value;
                var UsernameParam = new SqlParameter("@Username", User.Identity.Name.Split('\\').Last());
                await _context.Database.ExecuteSqlCommandAsync("EXEC SPR_PRG_UpdateDestination @System, @AcademicYear, @StudentRef, @Destination, @Username", SystemParam, AcademicYearParam, StudentRefParam, DestinationParam, UsernameParam);
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

            result = "{ saved: \"Y\", error: \"\" }";

            return Content(result);

            //return RedirectToPage("../Index");
        }

        private bool StudentExists(string StudentRef)
        {
            return _context.Student.Any(e => e.StudentRef == StudentRef);
        }
    }
}
