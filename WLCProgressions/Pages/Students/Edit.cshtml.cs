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

namespace WLCProgressions.Pages.Students
{
    public class EditModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public EditModel(WLCProgressions.Data.ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
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
            string systemDB = DatabaseSelector.GetDatabase(_configuration, system);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(AcademicYear, _context);

            Student = (await _context.Student
                .FromSqlInterpolated($"EXEC SPR_PRG_GetStudent @System={systemDB}, @AcademicYear={CurrentAcademicYear}, @StudentRef={StudentRef}")
                .ToListAsync())
                .FirstOrDefault();

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
