using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WLCProgressions.Shared
{
    public class DatabaseSelector
    {
         public static string GetDatabase(IConfiguration configuration, string system)
        {
            string LiveSystem = configuration.GetSection("Systems")["LiveSystem"];
            string TestSystem = configuration.GetSection("Systems")["TestSystem"];

            string systemDB;

            if(system == null)
            {
                systemDB = LiveSystem;
            }
            else if (system == "LIVE")
            {
                systemDB = LiveSystem;
            }
            else
            {
                systemDB = TestSystem;
            }

            return systemDB;
        }

        public static string GetILPDatabase(IConfiguration configuration, string system)
        {
            string LiveILPSystem = configuration.GetSection("Systems")["LiveILPSystem"];
            string TestILPSystem = configuration.GetSection("Systems")["TestILPSystem"];

            string systemDB;

            if (system == null)
            {
                systemDB = LiveILPSystem;
            }
            else if (system == "LIVE")
            {
                systemDB = LiveILPSystem;
            }
            else
            {
                systemDB = TestILPSystem;
            }

            return systemDB;
        }
    }
}
