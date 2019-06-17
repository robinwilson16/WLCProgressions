using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WLCProgressions.Models
{
    public class ChartData
    {
        public int ChartDataID { get; set; }
        [StringLength(50)]
        public string ChartTitle { get; set; }

        [StringLength(50)]
        public string Title { get; set; }
        public int Total { get; set; }
        public int Number { get; set; }
        public double Value { get; set; }
    }
}
