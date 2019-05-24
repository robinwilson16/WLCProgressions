# WLC Progressions System Changelog

## 24/05/2019 - Version 1.2.3
* Course titles with commas are not longer split up on popover

## 24/05/2019 - Version 1.2.2
* Renamed "Not Progressing" checkbox to "Record Destination" and set to internal college codes which are clearer
* Risk indicator is now set to red not green if it is not set and title shows as no set

## 20/05/2019 - Version 1.2.1

* Progression dialogue box now fits to the screen and has scrollbars rather than the entire screen scrolling down. This fixes a bug if destinations are left unsaved and the confirmation box pops up then scrolling wasn't working properly
* When clicking on a course to progress to, the screen scrolls down automatically so the user can select the offer types to save having to scroll down manually and to ensure it is clear the info appeared below when selecting a course (e.g. on a small screen)
* Much better error handing for when resources fail to load or cannot be found to avoid one error triggering others (chained errors)
* User full name and staff reference are now displayed at the top-right of the screen
* About and Changelog added