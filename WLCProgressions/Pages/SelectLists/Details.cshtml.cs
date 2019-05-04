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
    public class DetailsModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;

        public DetailsModel(WLCProgressions.Data.ApplicationDbContext context)
        {
            _context = context;
        }

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
    }
}
