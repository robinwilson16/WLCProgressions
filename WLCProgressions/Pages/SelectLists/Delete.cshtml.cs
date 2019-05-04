using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using WLCProgressions.Data;
using WLCProgressions.Models;

namespace WLCProgressions.Pages.SelectLists
{
    public class DeleteModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;

        public DeleteModel(WLCProgressions.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public SelectListData SelectListData { get; set; }

        public async Task<IActionResult> OnGetAsync(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            SelectListData = await _context.SelectListData.FirstOrDefaultAsync(m => m.Code == id);

            if (SelectListData == null)
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

            SelectListData = await _context.SelectListData.FindAsync(id);

            if (SelectListData != null)
            {
                _context.SelectListData.Remove(SelectListData);
                await _context.SaveChangesAsync();
            }

            return RedirectToPage("./Index");
        }
    }
}
