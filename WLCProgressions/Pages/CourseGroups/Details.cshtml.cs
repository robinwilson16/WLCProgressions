using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using WLCProgressions.Models;

namespace WLCProgressions.Pages.CourseGroups
{
    public class DetailsModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;

        public DetailsModel(WLCProgressions.Data.ApplicationDbContext context)
        {
            _context = context;
        }

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
    }
}
