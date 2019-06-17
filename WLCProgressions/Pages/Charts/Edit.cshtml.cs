using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using WLCProgressions.Data;
using WLCProgressions.Models;

namespace WLCProgressions.Pages.Charts
{
    public class EditModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;

        public EditModel(WLCProgressions.Data.ApplicationDbContext context)
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

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.Attach(ChartData).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ChartDataExists(ChartData.ChartDataID))
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

        private bool ChartDataExists(int id)
        {
            return _context.ChartData.Any(e => e.ChartDataID == id);
        }
    }
}
