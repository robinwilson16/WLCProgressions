using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using WLCProgressions.Data;
using WLCProgressions.Models;

namespace WLCProgressions.Pages.Charts
{
    public class DeleteModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;

        public DeleteModel(WLCProgressions.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public ChartData ChartData { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            ChartData = await _context.ChartData.FirstOrDefaultAsync(m => m.ChartDataID == id);

            if (ChartData == null)
            {
                return NotFound();
            }
            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            ChartData = await _context.ChartData.FindAsync(id);

            if (ChartData != null)
            {
                _context.ChartData.Remove(ChartData);
                await _context.SaveChangesAsync();
            }

            return RedirectToPage("./Index");
        }
    }
}
