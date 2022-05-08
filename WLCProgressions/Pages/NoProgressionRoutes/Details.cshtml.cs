using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using WLCProgressions.Data;
using WLCProgressions.Models;

namespace WLCProgressions.Pages.NoProgressionRoutes
{
    public class DetailsModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;

        public DetailsModel(WLCProgressions.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public NoProgressionRoute NoProgressionRoute { get; set; }

        public async Task<IActionResult> OnGetAsync(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            NoProgressionRoute = await _context.NoProgressionRoute.FirstOrDefaultAsync(m => m.StudentRef == id);

            if (NoProgressionRoute == null)
            {
                return NotFound();
            }
            return Page();
        }
    }
}
