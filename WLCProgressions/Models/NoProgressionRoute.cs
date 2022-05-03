using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WLCProgressions.Models
{
    [Table("PRG_NoProgressionRoute")]
    public class NoProgressionRoute
    {
        [StringLength(50)]
        public string SystemDatabase { get; set; }

        [StringLength(12)]
        public string StudentRef { get; set; }

        [StringLength(5)]
        public string AcademicYear { get; set; }
        public int OfferingID { get; set; }
        public int? OfferingGroupID { get; set; }
        public string Notes { get; set; }

        [Display(Name = "Created Date")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime CreatedDate { get; set; }


        [Display(Name = "Created By")]
        [StringLength(50)]
        public string CreatedBy { get; set; }

        [Display(Name = "Updated Date")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime? UpdatedDate { get; set; }

        [Display(Name = "Updated By")]
        [StringLength(50)]
        public string UpdatedBy { get; set; }
    }
}
