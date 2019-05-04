using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WLCProgressions.Shared
{
    public class DatabaseSelector
    {
        public static string GetDatabase(string system)
        {
            string systemDB;

            if(system == null)
            {
                systemDB = "ProSolution";
            }
            else if (system == "LIVE")
            {
                systemDB = "ProSolution";
            }
            else
            {
                systemDB = "ProSolutionTraining";
            }

            return systemDB;
        }
    }
}
