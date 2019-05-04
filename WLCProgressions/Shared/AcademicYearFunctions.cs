using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WLCProgressions.Data;
using WLCProgressions.Models;

namespace WLCProgressions.Shared
{
    public class AcademicYearFunctions
    {
        public static Config ConfigData { get; set; }
        public static async Task<string> GetAcademicYear(string academicYear, ApplicationDbContext _context)
        {
            string currentAcademicYear;

            if (academicYear == null)
            {
                //Get value from database
                ConfigData = await _context.Config
                    .FromSql("EXEC SPR_PRG_Config")
                    .FirstOrDefaultAsync();

                currentAcademicYear = ConfigData.AcademicYear;
            }
            else
            {
                currentAcademicYear = academicYear;
            }

            return currentAcademicYear;
        }

        public static async Task<string> GetDefaultAcademicYear(ApplicationDbContext _context)
        {
                //Get value from database
                ConfigData = await _context.Config
                    .FromSql("EXEC SPR_PRG_Config")
                    .FirstOrDefaultAsync();

            return ConfigData.AcademicYear; ;
        }

        public static async Task<string> GetProgressionYear(string academicYear, ApplicationDbContext _context)
        {
            string progressionAcademicYear;

            if (string.IsNullOrEmpty(academicYear) || academicYear.Length < 5)
            {
                //Get value from database
                ConfigData = await _context.Config
                    .FromSql("EXEC SPR_PRG_Config")
                    .FirstOrDefaultAsync();

                progressionAcademicYear = ConfigData.ProgressionYear;
            }
            else
            {
                progressionAcademicYear = (Int32.Parse(academicYear.Substring(0, 2)) + 1).ToString() + "/" + (Int32.Parse(academicYear.Substring(3, 2)) + 1).ToString();
            }

            return progressionAcademicYear;
        }
    }
}
