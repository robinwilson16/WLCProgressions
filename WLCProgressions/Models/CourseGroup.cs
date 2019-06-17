using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WLCProgressions.Models
{
    public class CourseGroup
    {
        [StringLength(5)]
        public string AcademicYear { get; set; }
        [StringLength(20)]
        public string SiteCode { get; set; }

        [StringLength(100)]
        public string SiteName { get; set; }

        [StringLength(12)]
        public string FacCode { get; set; }

        [StringLength(150)]
        public string FacName { get; set; }

        [StringLength(12)]
        public string TeamCode { get; set; }

        [StringLength(150)]
        public string TeamName { get; set; }

        public int CourseID { get; set; }

        [StringLength(24)]
        public string CourseCode { get; set; }

        [StringLength(255)]
        public string CourseTitle { get; set; }

        [StringLength(8)]
        public string AimCode { get; set; }

        [StringLength(150)]
        public string AimTitle { get; set; }

        public int GroupID { get; set; }

        [StringLength(3)]
        public string GroupCode { get; set; }

        [StringLength(50)]
        public string GroupName { get; set; }

        public int Enrolments { get; set; }

        public int HasProgression { get; set; }
        public int HasDestination { get; set; }
        public int HasValidDestination { get; set; }
        public int HasProgressionDestination { get; set; }
        public int CompletedRecords { get; set; }
        public double CompletedRecordsPer { get; set; }
        public int OutstandingRecords { get; set; }
        public double OutstandingRecordsPer { get; set; }
    }
}
