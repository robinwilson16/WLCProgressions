using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using WLCProgressions.Models;

namespace WLCProgressions.Pages.Students
{
    public class DetailsModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;

        public DetailsModel(WLCProgressions.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public Student Student { get; set; }

        public async Task<IActionResult> OnGetAsync(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            Student = await _context.Student.FirstOrDefaultAsync(m => m.StudentRef == id);

            if (Student == null)
            {
                return NotFound();
            }
            return Page();
        }
    }
}
