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

            if (string.IsNullOrEmpty(system))
            {
                systemDB = LiveSystem;
            }
            else if (system == "LIVE")
            {
                systemDB = LiveSystem;
            }
            else if (system == LiveSystem)
            {
                systemDB = LiveSystem;
            }
            else
            {
                systemDB = TestSystem;
            }

            return systemDB;
        }

        public static string GetILPDatabase(IConfiguration configuration, string systemILP, string system)
        {
            string LiveILPSystem = configuration.GetSection("Systems")["LiveILPSystem"];
            string TestILPSystem = configuration.GetSection("Systems")["TestILPSystem"];
            string LiveSystem = configuration.GetSection("Systems")["LiveSystem"];
            string TestSystem = configuration.GetSection("Systems")["TestSystem"];

            string systemDB;

            if (systemILP == LiveILPSystem)
            {
                systemDB = LiveILPSystem;
            }
            else if (systemILP == TestILPSystem)
            {
                systemDB = TestILPSystem;
            }
            else if (system == LiveSystem)
            {
                systemDB = LiveILPSystem;
            }
            else if (system == TestSystem)
            {
                systemDB = TestILPSystem;
            }
            else if (string.IsNullOrEmpty(systemILP) && string.IsNullOrEmpty(system))
            {
                systemDB = LiveILPSystem;
            }
            else if (systemILP == "LIVE" || system == "LIVE")
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
