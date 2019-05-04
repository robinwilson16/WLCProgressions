using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using WLCProgressions.Models;

namespace WLCProgressions.Pages.CourseGroups
{
    public class EditModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;

        public EditModel(WLCProgressions.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public CourseGroup CourseGroup { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            CourseGroup = await _context.CourseGroup.FirstOrDefaultAsync(m => m.CourseID == id);

            if (CourseGroup == null)
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

            _context.Attach(CourseGroup).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CourseGroupExists(CourseGroup.CourseID))
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

        private bool CourseGroupExists(int id)
        {
            return _context.CourseGroup.Any(e => e.CourseID == id);
        }
    }
}
