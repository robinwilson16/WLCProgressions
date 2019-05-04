using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using WLCProgressions.Models;
using WLCProgressions.Shared;

namespace WLCProgressions.Pages.Students
{
    public class EditModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;

        public EditModel(WLCProgressions.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Student Student { get; set; }

        public async Task<IActionResult> OnGetAsync(string system, string AcademicYear, string StudentRef)
        {
            if (StudentRef == null)
            {
                return NotFound();
            }

            //Student = await _context.Student.FirstOrDefaultAsync(m => m.StudentRef == id);
            string systemDB = DatabaseSelector.GetDatabase(system);
            var systemParam = new SqlParameter("@system", systemDB);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(AcademicYear, _context);
            var AcademicYearParam = new SqlParameter("@AcademicYear", CurrentAcademicYear);
            var StudentRefParam = new SqlParameter("@StudentRef", StudentRef);

            Student = await _context.Student
                .FromSql("EXEC SPR_PRG_GetStudent @System, @AcademicYear, @StudentRef", systemParam, AcademicYearParam, StudentRefParam).FirstOrDefaultAsync();

            if (Student == null)
            {
                return NotFound();
            }
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.Attach(Student).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StudentExists(Student.StudentRef))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return RedirectToPage("./Index");
        }

        private bool StudentExists(string id)
        {
            return _context.Student.Any(e => e.StudentRef == id);
        }
    }
}
