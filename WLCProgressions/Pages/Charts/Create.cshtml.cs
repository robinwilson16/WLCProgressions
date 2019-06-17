using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using WLCProgressions.Data;
using WLCProgressions.Models;

namespace WLCProgressions.Pages.Charts
{
    public class CreateModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;

        public CreateModel(WLCProgressions.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult OnGet()
        {
            return Page();
        }

        [BindProperty]
        public ChartData ChartData { get; set; }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.ChartData.Add(ChartData);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}