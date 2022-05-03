using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Configuration;
using WLCProgressions.Data;
using WLCProgressions.Models;
using WLCProgressions.Shared;

namespace WLCProgressions.Pages.NoProgressionRoutes
{
    public class CreateModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public CreateModel(WLCProgressions.Data.ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public string UserDetails { get; set; }

        public string SystemID { get; set; }
        public string SystemILPID { get; set; }

        public async Task<IActionResult> OnGetAsync(string system, string systemILP, string academicYear)
        {
            UserDetails = await Identity.GetFullName(system, academicYear, User.Identity.Name.Split('\\').Last(), _context, _configuration);
            return Page();
        }

        [BindProperty]
        public NoProgressionRoute NoProgressionRoute { get; set; }

        // To protect from overposting attacks, see https://aka.ms/RazorPagesCRUD
        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.NoProgressionRoute_1.Add(NoProgressionRoute);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}
