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
    public class IndexModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;

        public IndexModel(WLCProgressions.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public IList<NoProgressionRoute> NoProgressionRoute { get;set; }

        public async Task OnGetAsync()
        {
            NoProgressionRoute = await _context.NoProgressionRoute_1.ToListAsync();
        }
    }
}
