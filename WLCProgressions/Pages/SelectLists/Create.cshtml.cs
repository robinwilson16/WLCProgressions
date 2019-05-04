using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using WLCProgressions.Data;
using WLCProgressions.Models;

namespace WLCProgressions.Pages.SelectLists
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
        public SelectListData SelectListData { get; set; }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.SelectListData.Add(SelectListData);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}