using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using WLCProgressions.Shared;

namespace WLCProgressions.Models
{
    public class SystemSettings
    {
        public SystemSettings()
        {
            Greeting = Identity.GetGreeting();
        }

        public string Greeting { get; set; }

        public string UserDetails { get; set; }
        public string System { get; set; }
        public string ILPSystem { get; set; }

        [Display(Name = "System Version Number")]
        public string Version { get; set; }
    }
}
