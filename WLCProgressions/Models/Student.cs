using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace WLCProgressions.Models
{
    public class Student
    {
        [StringLength(20)]
        public string SystemDatabase { get; set; }

        [StringLength(12)]
        public string StudentRef { get; set; }

        [StringLength(5)]
        public string AcademicYear { get; set; }

        [StringLength(40)]
        public string Surname { get; set; }

        [StringLength(50)]
        public string Forename { get; set; }

        [Display(Name = "Date of Birth")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime? DOB { get; set; }

        [Display(Name = "Age on 31st Aug")]
        public int Age31stAug { get; set; }

        [StringLength(50)]
        public string Completion { get; set; }
        public int RiskCode { get; set; }
        
        [StringLength(25)]
        public string RiskName { get; set; }

        [StringLength(20)]
        public string RiskColour { get; set; }
        public int RiskCodePreCovid19 { get; set; }

        [StringLength(25)]
        public string RiskNamePreCovid19 { get; set; }

        [StringLength(20)]
        public string RiskColourPreCovid19 { get; set; }
        public int ClassesPlanned { get; set; }
        public int ClassesCounted { get; set; }
        public int ClassesMarked { get; set; }
        public int ClassesUnmarked { get; set; }
        public int ClassesPresent { get; set; }
        public int ClassesAbsent { get; set; }
        public int ClassesNeutral { get; set; }
        public int ClassesAuthAbsence { get; set; }
        public int ClassesLate { get; set; }

        public double AttendPer { get; set; }

        public int NumAppsNextYear { get; set; }

        public string AppliedCoursesNextYear { get; set; }

        public int NumEnrolsNextYear { get; set; }

        public string EnrolledCoursesNextYear { get; set; }

        public int? DestinationCode { get; set; }

        [StringLength(255)]
        public string DestinationName { get; set; }

        public bool DestinationChanged { get; set; }
        public bool ProgressLearner { get; set; }

        public int OfferType { get; set; }

        public int OfferCondition { get; set; }
    }
}
