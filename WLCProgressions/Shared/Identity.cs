using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using WLCProgressions.Data;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;
using WLCProgressions.Models;
using Microsoft.EntityFrameworkCore;

namespace WLCProgressions.Shared
{
    public class Identity
    {
        public static string GetUserName(ClaimsPrincipal user, ApplicationDbContext _context)
        {
            var userName = user.Identity.Name.ToString();

            //In case cannot obtain current user then set to this default user as created by field is required
            userName = "UNKNOWN";

            return userName;
        }
        public static StaffMember StaffMember { get; set; }
        public static async Task<string> GetFullName(string system, string academicYear, string username, ApplicationDbContext _context, IConfiguration _configuration)
        {
            string systemDB = DatabaseSelector.GetDatabase(_configuration, system);
            string CurrentAcademicYear = await AcademicYearFunctions.GetAcademicYear(academicYear, _context);

            StaffMember = (await _context.StaffMember
                .FromSqlInterpolated($"EXEC SPR_PRG_GetStaffMember @System={systemDB}, @AcademicYear={CurrentAcademicYear}, @UserName={username}")
                .ToListAsync())
                .FirstOrDefault();

            if (StaffMember != null)
            {
                return StaffMember.StaffDetails;
            }
            else
            {
                return username;
            }

            
        }

        public static string GetGreeting()
        {
            string greeting = "";
            int currentHour = DateTime.Now.Hour;

            if(currentHour < 12)
            {
                greeting = "Good Morning";
            }
            else if (currentHour < 17)
            {
                greeting = "Good Afternoon";
            }
            else
            {
                greeting = "Good Evening";
            }

            return greeting;
        }
    }
}
