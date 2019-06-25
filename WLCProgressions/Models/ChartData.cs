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

        [StringLength(20)]
        public string Type { get; set; }

        public int Level { get; set; }

        [StringLength(5)]
        public string AcademicYear { get; set; }

        [StringLength(12)]
        public string FacCode { get; set; }

        [StringLength(150)]
        public string FacName { get; set; }

        [StringLength(12)]
        public string TeamCode { get; set; }

        [StringLength(150)]
        public string TeamName { get; set; }

        public int? CourseID { get; set; }

        [StringLength(24)]
        public string CourseCode { get; set; }

        [StringLength(255)]
        public string CourseTitle { get; set; }

        public int? GroupID { get; set; }

        [StringLength(3)]
        public string GroupCode { get; set; }

        [StringLength(50)]
        public string GroupName { get; set; }
    }
}
