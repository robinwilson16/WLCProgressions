using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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

        public int? DestinationCode { get; set; }

        [StringLength(255)]
        public string DestinationName { get; set; }

        public bool ProgressLearner { get; set; }
    }
}
