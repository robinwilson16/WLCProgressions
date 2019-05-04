using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WLCProgressions.Models
{
    public class Progression
    {
        [StringLength(50)]
        public string SystemDatabase { get; set; }

        [StringLength(12)]
        public string StudentRef { get; set; }

        [StringLength(5)]
        public string AcademicYear { get; set; }
        public int CourseFromID { get; set; }
        public int? GroupFromID { get; set; }
        public int CourseToID { get; set; }
        public int? GroupToID { get; set; }
        public string ProgressionType { get; set; }
        public int OfferTypeID { get; set; }
        public int? OfferConditionID { get; set; }
    }
}