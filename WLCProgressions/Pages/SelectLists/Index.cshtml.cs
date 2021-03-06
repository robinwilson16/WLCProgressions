﻿using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using WLCProgressions.Data;
using WLCProgressions.Models;
using WLCProgressions.Shared;

namespace WLCProgressions.Pages.SelectLists
{
    public class IndexModel : PageModel
    {
        private readonly WLCProgressions.Data.ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public IndexModel(WLCProgressions.Data.ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public IList<SelectListData> SelectListData { get;set; }

        public async Task OnGetAsync(string system, string academicYear, string domain)
        {
            //SelectListData = await _context.SelectListData.ToListAsync();

            if (String.IsNullOrEmpty(domain))
            {
                domain = "";
            }

            string systemDB = DatabaseSelector.GetDatabase(_configuration, system);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(academicYear, _context);

            SelectListData = await _context.SelectListData
                .FromSqlInterpolated($"EXEC SPR_PRG_SelectListData @System={systemDB}, @AcademicYear={CurrentAcademicYear}, @Domain={domain}")
                .ToListAsync();
        }

        public async Task<IActionResult> OnGetJsonAsync(string system, string academicYear, string domain)
        {
            if (String.IsNullOrEmpty(domain))
            {
                domain = "";
            }

            string systemDB = DatabaseSelector.GetDatabase(_configuration, system);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(academicYear, _context);

            SelectListData = await _context.SelectListData
                .FromSqlInterpolated($"EXEC SPR_PRG_SelectListData @System={systemDB}, @AcademicYear={CurrentAcademicYear}, @Domain={domain}")
                .ToListAsync();

            var collectionWrapper = new
            {
                SelectOptions = SelectListData
            };

            return new JsonResult(collectionWrapper);
        }
    }
}
