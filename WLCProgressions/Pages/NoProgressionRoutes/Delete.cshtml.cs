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
    public class DeleteModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;

        public DeleteModel(WLCProgressions.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        [BindProperty]
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

        public async Task<IActionResult> OnPostAsync(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            NoProgressionRoute = await _context.NoProgressionRoute_1.FindAsync(id);

            if (NoProgressionRoute != null)
            {
                _context.NoProgressionRoute.Remove(NoProgressionRoute);
                await _context.SaveChangesAsync();
            }

            return RedirectToPage("./Index");
        }
    }
}
