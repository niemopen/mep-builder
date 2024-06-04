





<a name="_hlk81575878"></a> MEP Builder

User Guide

**Version 3.3**



**2024**

<a name="printed_pages_ug_documentchanger_5761"></a>Document Change Record

|**Version Number**|**Date**|**Description**|
| :-: | :-: | :-: |
|1\.0|31 October 2021|Original|
|1\.0|18 November 29, 2021|Update - Added Installation Instructions|
|1\.0|29 November 2021|Update - Modified Installation Instructions|
|1\.0|10 December 2021|Update - Added system memory requirements|
|2\.0|12 April 2022|Update -   Added Translate MEP U/I Workflow|
|2\.0|27 July 2022|Update - Added Upload and Import UML documents, custom spreadsheets, and distribution statements|
|2\.0|27 July 2022|Update - Added Search and mapping of Common NIEMOpen Components|
|2\.0|27 July 2022|Update - Added upload and import UML documents, custom spreadsheets and distribution statements. |
|2\.0|15 August 2022|Update – Added uninstall instructions |
|2\.1|14 April 2023|Update – Added Custom Model Extension creation, Migration, Translate to JSON-LD, Release Lock|
|2\.1|14 April 2023|Update – Added additional MEP artifact functionality: ReadMe, Change Log, Conformance Assertion, Artifact Checklist, |
|2\.1|14 April 2023|Update – Modified installation requirements|
|3\.0|10 July 2023|Update – Added Published Package Section |
|3\.0|10 July 2023|Update – Added homepage functionality (Copy, translate, additional search features, export, delete)|
|3\.0|10 July 2023|Update – Added CME functionality (NDR conformance, import code lists, edit elements in viewports, delete elements in viewports)|
|3\.0|11 July 2023|Update- Added Translate to CMF, JSON Schema, and OWL|
|3\.0|8 August 2023|Update- Corrected installation guide numbering|
|3\.0|8 August 2023|Update- Corrected references to NIEMOpen vs MEP Builder, renamed file|
|3\.1|14 December 2023|Remove the use of the Environment Variable in the docker files.|
|3\.1|14 December 2023|Update- Modified My Home Tab functionality (Copy, Viewing/Opening a MEP, Published packages, migration changes, search results label)|
|3\.1|14 December 2023|Update- Modified CME functionality (URI and Definition fields, Download Import Report feature, Definition validation) |
|3\.1|14 December 2023|Update- Modified Translate and Subset Schema generation to include new warning messages, Modified Artifact Checklist to now show interactive options |
|3\.1|14 December 2023|Update- Added Validate section, Added Business Rules section|
|3\.2|1 March 2024|Updated Creation Guide steps|
|3\.2|1 March 2024|Updated Custom Model Extension steps|
|3\.2|1 March 2024|Updated Validate section to include new artifacts for validation |
|3\.3|29 April 2024|Update- Metadata section of MEP Builder, Advanced Search- Owner field, Build and Validate screen options, CME Builder- Extensions added to Artifact Tree|



III	

Table of Contents

[1	NIEMOPEN MEP BUILDER OVERVIEW	1](#_toc165289023)

[2	ENVIRONMENT OVERVIEW	2](#_toc165289024)

[3	TOP MENU BAR	3](#_toc165289025)

[4	GETTING STARTED	7](#_toc165289026)

[5	TRAINING TAB	8](#_toc165289027)

[6	LOGIN	9](#_toc165289028)

[7	MY HOME TAB	11](#_toc165289029)

[8	MEP BUILDER TAB	16](#_toc165289030)

[9	MEP BUILDER TOOL UNINSTALL INSTRUCTIONS.	51](#_toc165289031)

[10	MEP BUILDER TOOL INSTALLATION INSTRUCTIONS	55](#_toc165289032)







86

1. # <a name="aboutrcrp_htm"></a><a name="_toc128646887"></a><a name="_toc165289023"></a><a name="rh_pd_toc_bk"></a>**NIEMOPEN MEP BUILDER OVERVIEW**
The NIEMOpen MEP Builder is a tool designed to assist a user when constructing Message Exchange Packages (MEP)s, formerly known as Information Exchange Package Documentation (IEPD)s. This tool streamlines the process used to produce these packages to use with NIEMOpen. 

1. # <a name="_toc128646888"></a><a name="_toc165289024"></a>**ENVIRONMENT OVERVIEW**
The NIEMOpen MEP Builder can be deployed to a server or downloaded as a stand-alone application.  Once the application has been deployed to your server or downloaded and installed on your computer, the following software requirements apply:

- Windows10 operating system 
- 64-bit processor with Second Level Address Translation (SLAT)
- 4GB system RAM
- BIOS-level hardware virtualization support must be enabled in the BIOS settings. (This setting may be controlled and restricted by your enterprise team if your computer is a part of an enterprise domain)
- Microsoft Edge, Google Chrome, or Firefox web browser
- Connection to the internet
- Username and Password (server instance)



Note:  If you are an admin for your organization and desire to install a NIEMOpen Tool instance to your server, please consult the NIEMOpen Tool Admin Guide for server installation instructions.



<a name="section3"></a> 

















1. # <a name="_toc128646889"></a><a name="_toc165289025"></a>**TOP MENU BAR**
The top menu bar contains Current Release, Contact and User Profile. (Figure 3.1). Current Release will provide the current release number (Figure 3.2)  Clicking “Contact” will invoke a pop-up to display advising you to contact  [info@niemopen.org](mailto:information@niem.gov) with any questions and/or comments regarding the NIEMOpen MEP Builder as illustrated in (Figure 3.3) The Sign in menu item will display the username while logged in.  Also, clicking your username will invoke a dialog where you can choose to log out of the application or access your user profile modal. See Figure 3.4.

*Figure 3.1**




*Figure 3.2**


*Figure 3.3**


*Figure 3.4**


Accessing your user Profile via controls depicted on Figure 3.4.  Accessing your profile is where you may update your account information and your password. To update your account information, click in the field you desire to change.  Enter your changes and click “Save Changes”. Figure 3.5 and “confirm” Figure 3.6.  Once you confirm, you will receive a successful notification banner.


*Figure 3.5**



*Figure 3.6**


To update your password, click the “Update Password” link on your profile page and the update password dialog will render. Figure 3.7. You must have your existing password available as it is a required field.  Once your existing password is entered, you can then enter your new password and confirm it by typing it again.  Click “Save Changes” and confirm by clicking the “Confirm” button. See Figure 3.8.  After confirmation, a notification banner will render if you are successful.  If you have entered an incorrect existing password or if your new passwords do not match or do not meet the password criteria, you will receive a failure notification.


**Password requirements**:

Minimum length of eight characters

At least one special non-alphanumeric character

At least one upper case letter

At least one lower case letter

At least one number (0-9)




*Figure 3.7**


*Figure 3.8**
1. # <a name="_toc128646890"></a><a name="_toc165289026"></a>**GETTING STARTED**

The **Getting Started** page provides a link to example Packages.  Clicking the link in Figure 4.1 will take you to a download site depicted in Figure 4.2 to download examples.


*Figure 4.1**


*Figure 4.2**
1. # <a name="_toc128646891"></a><a name="_toc165289027"></a>**TRAINING TAB**
Navigating to the **Training Tab** will take you to an interactive graphic (Figure 5.1) where you can follow training tracks on <https://niem.github.io/training/> Figure 5.2) or view this User Guide. If you are already logged in or using the stand-alone version, you can also click the bottom link on the graphic to begin creating your Message Exchange Package (MEP).  If you haven’t logged in yet, clicking “Begin Building a MEP link will take you to the Login screen.




*Figure 5.1**


*Figure 5.2**
1. # <a name="_toc128646892"></a><a name="_toc165289028"></a>**LOGIN**
While the system is deployed in a stand-alone environment, Login credentials are not required.  In this instance, you will be presented with the My **Home Tab** screen (see Figure 6.4) upon accessing the URL. Accessing via a public server, the user will be presented with a login screen (see Figure 6.3). If you don’t have an account, you must request one via the “Create an Account” link. See Figure 6.1 and 6.2

Enter your information in the required fields and click “Register”.  A local Admin will contact you if your account has been approved and provide login credentials.  If your account was not approved, an Admin will contact you to discuss reasons for denying the account request. 



*Figure 6.1**


*Figure 6.2**


Once your account request is approved, you can enter with your approved credentials, then click “Sign in” to gain access to the system. (Figure 6.3)  Once you have logged in, you will be taken to the home page (See Figure 6.4)


*Figure 6.3**


*Figure 6.4**

1. # <a name="_toc128646893"></a><a name="_toc165289029"></a>**MY HOME TAB**
This page is the landing page when you sign in using a server instance. For the stand-alone instance, after you navigate to local host URL you will land on this page as well.  The functionality of the **My Home** tab is described below and highlighted in Figure 7.1:

*Figure 7.1**

1. The **Create New MEP** button takes you to the **MEP** **Builder** page to begin building a MEP. See section labeled A in the figure.

1. “**Search Repository**” button provides the functionality to search the repository by MEP Name, Property or Type. The search feature will show results including augmentations, parent types, and associations corresponding to the inputted search. See section labeled B in the figure.
1. Advanced Search provides for a more refined and multifaceted search.  This search also incorporates searches for Communities Of Interest, Exchange Partners, published MEPs and releases. See section labeled C in the figure.

1. ` `A list of saved unpublished MEP Packages that you can access via the View “folder” icon (). The Open/Unpublished section contains summary metadata from the saved package. The Domain, the MEP package name, Summary, Format and Release Number are displayed for each unpublished package saved. Unpublished packages can be deleted by using the Delete “Trashcan” Icon (). See section labeled D in the figure.


1. The **Published** section contains the Published packages available to the user. Published packages are published, so packages published by other users will appear in the Published section. These packages owned by another user can only be updated (Migrated, Translated, Deleted by the owner of the package). Published package functionality described below:
   1. Published Packages are hidden by default. To view available published packages, the **Include Published MEPS** selection needs to be enabled in the **Advanced Search** bar. (Figure 7.2) 


   1. Once enabled, published packages are visible and can be searched upon. In a Published Package card an ellipsis is in the top right corner, clicking on the ellipsis allows the user to perform actions.  

*Figure 7.4**

1. **Copy** functionality is available for Open/Unpublished packages as well as Published packages. A good way to view/make changes to another user’s package is by the Copy functionality. A copied package displays in the Open/Unpublished section (until the artifacts are complete and the new owner publishes it). Once user clicks Copy, a modal displays displaying the default name and giving the user the option to rename the new copy. (Figure 7.4, Figure 7.5)

*Figure 7.5**

1. The **Delete** functionality allows a user to permanently delete packages. Users are only able to delete packages in which they are the owner. Upon clicking delete, a message appears giving the user a warning that they are about to delete a package. (Figure 7.6)

*Figure 7.6**

1. The **Export** functionality allows the user to export the package to their computer. 
1. **Migrate Release** functionality is described in **Section f** below. 
1. The **Translate** feature is available to translate the format of published packages. The formats available are:
   1. CMF <a name="_hlk139961889"></a>*(packages created in NIEMOPEN 4.0 or higher)*
   1. JSON LD
   1. XML
   1. JSON Schema *(packages created in NIEMOPEN 4.0 or higher)*
   1. OWL *(packages created in NIEMOPEN 4.0 or higher)*

Once the format has been selected (multiple formats can be selected at a time), the new package formats will be added to the package artifacts and are listed on the published package card. (Figure 7.7)

1. The **Migrate Release** section provides the functionality to migrate Unpublished packages to a different release. See section labeled F in the figure.
   1. Begin by clicking **Migrate** you can select the desired release. (Note: The selection will not allow a user to migrate backwards) (Figure 7.8)
   1. A summary will appear after confirming **Migrate** in which details of the migration will display. (Figure 7.9)
   1. Original MEP and migrated MEP will both appear on the Open/Unpublished table of My Home


*Figure 7.8**


*Figure 7.9**

1. # <a name="_toc128646894"></a><a name="_toc165289030"></a>**MEP BUILDER TAB**
1. **MEP** **Builder** Page Navigation: (Figure 8.1)
   1) **Metadata** area - MEP Metadata fields, Save, Save and Close and Hints toggle.  **TIP** -** Prior to uploading any files to include in your MEP package, you must first enter a MEP Name in the “MEP Name” field
   1) **Left Navigation** area - Lifecycle Phases, Message Exchange Package artifacts and Message Exchange Package Build Components.
   1) **Workspace** - Interactive MEP Lifecyle Graphic, MEP Mapping Spreadsheet Import and modification.

*Figure 8.1**

1. Metadata fields: Starting from the top of the page, the metadata fields allow you to enter data specific to the MEP package.  This section is expandable and is collapsed in the default state (Figure 8.2). Figure 8.3 shows the section in the expanded state.  Available fields in the metadata section are listed below.  
1) MEP Name - The name of the MEP package. (Required)
1) Release - This field only contains valid release numbers and defaults to the latest version (Required)
   1. Moving forward in the workflow (or clicking ‘Save’ or ‘Save and Close’), will display a pop-up verifying the selection of the release (Figure 8.4), confirming the selection will then ‘lock’ the release field (Figure 8.5).
1) Version (Required)
1) Status
1) Status No.
   1. Only available if the Status field is completed. (Required, (when status field is completed)) 
1) Point of Contact - User enters desired POC here.
1) Email - Contact email if desired.
1) Description - A summary describing the MEP.
1) Organization Name - (Required)
1) Organization Type - Describes type of organization listed above.
1) Communities of Interest tag
1) Exchange Partners tag


*Figure 8.2**


*Figure 8.3**



*Figure 8.4**


*Figure 8.5**

1. ## **LIFECYCLE PHASES.**  

1) **Scenario Planning** - To begin constructing the MEP package, begin with “Scenario Planning” by clicking on the MEP Graphic in the workspace or clicking the left navigation area.  If you have started the scenario planning workflow and have not entered a MEP name in the metadata field, the upload document functionality is by default disabled (Figure 8.6)

*Figure 8.6**

1) Once a MEP name has been entered, you can upload a document by clicking the “Upload Document” button.  See Figure 8.7.

*Figure 8.7**

1) Once the “Upload Document” button has been pressed, the upload document dialogue will display see (Figure 8.8).  Here you can either drag and drop a file or browse for a file within you computer directory structure. 

*Figure 8.8**

1) Once the file has been selected, the system provides notification via a checkmark that the file is in the queue. Next, select the Artifact Type for example “Mapping Spreadsheet” as depicted in figures (8.9 and 8.10) .  Artifact tags to chose from include:
- Business Rules
- Catalog File
- Change Log
- Conformance Assertion
- Distribution Statement
- Mapping Spreadsheet
- NIEMOPEN Ext Schema
- NIEM Schema Subset
- Other
- ReadMe
- SampleFile
- Scenario Planning Diagram
1) Also, expand the Message Exchange Package Artifacts to see your file in the tree structure.  See Figure 8.11


*Figure 8.9**

*Figure 8.10**


*Figure 8.11**

1) **Analyze Requirements** - In this phase, the tool provides the ability to:
1) Download a Mapping Template. Figure 8.12.


*Figure 8.12**


1) Upload Documents - See upload document details in the previous section.
1) Import a Mapping Spreadsheet – The systems can import both standard mapping spreadsheets and custom mapping spreadsheets. 
1) A mapping spreadsheet can be imported into the mapping grid and modified within the application via the “Import Mapping Spreadsheet button”.  
   1. Standard Mapping Spreadsheet - Select “NIEM Mapping Spreadsheet, then select the desired document.  Next, click the **load** button and the file will populate the grid on the workspace. See Figure 8.13 below.

*Figure 8.13**

1. Custom Mapping Spreadsheet - Select “Custom Mapping Spreadsheet”, then select the desired document.  Next, click the **load** button and the file will populate the grid on the workspace. The workflow for incorporating  a custom mapping spreadsheet has two paths.  With a header row or without a header row.
   1. Header Row.  You must select if the spreadsheet has a header.  

*Figure 8.14**

1. Enter the row the header row resides.  


*Figure 8.15**

1. Click Next
1. Map spreadsheet columns to the standard mapping document columns by using the pop up dialog in figure. 




*Figure 8.16**


1. Click “Map” and you will see the data render in the maping grid.
1. ` `Without Header Row.  This time you will pick “No header row”
   1. Click Next and map your columns to the NIEM Mapping Spreadsheet column names using the mapping interface provided. Figure 8.17


*Figure 8.17**

1. Once you have completed your mapping, click “Map” and you will be taken to the mapping grid. See Figure 8.18. 


*Figure 8.18**


*Figure 8.19**


*Figure 8.20**



Now that the grid has populated, you can export the data sheet in .csv or .pdf format by 

clicking the Download Icon.  



*Figure 8.21**

1) ` `**Map & Model** -  Here you can  edit the mapping sheet within the workspace and Map results for the “Property” and “Type” tabs to your mapping spreadsheet.  You can also map from :

1) Click the plus sign   to add a row. 



*Figure 8.22**

1) Click the pencil   to edit a row.  The green checkmark confirms and the red “x” cancels.  See Figure 8.23


*Figure 8.23**

1) Click the trash can   to delete a row. The green checkmark confirms and the red “x” cancels.  See Figure 8.24

*Figure 8.24**


1) Map Results – Click the  search and append results to your mapping spreadsheet as follows:  
   1. Click the “Map Button” which will result in a searchable dialog.  See Figure 8.25
   1. Review the results and select the element to map to your mapping spreadsheet by clicking the radio button.
   1. Click the “Map button” to append your selection to the maping spreadsheet.




*Figure 8.25**



*Figure 8.26**

\*View the results of your mapping in the Mapping spreadsheet. See Figure 8.27


*Figure 8.27**

1) To Map “Type” and set Cardinality complete the following steps:

1. On the “Type” tab of your mapping spreadsheet, click the Map button beside the row you wish to search results.
1. Click select from the default results or search for another string.
1. When you find the desired results expand Name results and select the elements you wish to add by clicking the check box(s) in the “add” column.
1. Set the Cardinality at 0.1,1.1, 0.unbounded, 1.unbounded. See Figure 8.28
1. Click the Map button to append these results to the mapping spreadsheet. See Figure 8.29-8.31





*Figure 8.28**

*Figure 8.29**

*Figure 8.30**

*Figure 8.31**


1) **Build & Validate** - This Phase will allow you to: 

   1. **Select a Nillable Default Value**
   1. **Include documentation**
   1. **Build Custom Model Extensions**

If needed, create Custom Model Extensions ….

1. To begin, click the Build Custom Model Extension button.

 

1. Choose what type of extension you would like to add to your package.  "**Data Element**" or "**Container**" (Figure 8.33)

1. **Data Element Workflow**
   1. Choose Type of Data Element - Choose from the following: 
- Boolean
- Codes
- Date
- Decimal
- Integer
- Text

1. Enter a Data element **Name** (Figure 8.33)

1. Choose a Specific Type (Figure 8.33)

1. **Define** the Data Element (Figure 8.33)

1. Click the **Create Element** button** to create the element

1. A "View my elements" area that contains your created element (Figure 8.34)
- A toggle exists to display and hide the created data elements from view





*Figure 8.33**


*Figure 8.34**

1. **Container Workflow**
   1. Choose Type of Container - Choose from the following:
- New Container
- Based on Existing Container
- Root Element

1. Enter a Container **Name**

1. **Define** the Container

1. To choose elements you would like to add to the container, select a namespace to choose from.

*Figure 8.35**

1. Next, select the Container Element(s) you’d like to add.

1. Click the “**Add**” button. This button is disabled until a namespace and at least one element has been selected.

*Figure 8.36**

1. A "View my Container elements" area contains each added Container Element
- A toggle exists to display and hide the created data elements from view


1. Click the **Create Element** Button 

*Figure 8.37**

1. A "View my Container Elements" area that contains your created element
- A toggle exists to display and hide the created data elements from view

    1. ` `A Create Element control exists to create the element
    1. ` `If you are ready to create, push the “Create Element” Button
    1. If needed, Data Elements can be **Edited** via the pencil icon in the viewport. After making changes, select **Save Changes** and the Element will close. If changes do not need to be saved, you may select **Cancel Edits**. 


















1. Additionally, Elements can be **Deleted** by selecting the trash can icon in the viewport. An **Undo** option is available for 5 seconds and then the Data Element is permanently deleted. 




1. The Build Custom Model Extensions Modal includes the fields URI and Definition. (Figure 8.39)
   1. A Uniform Resource Identifier (URI) identifies a resource.
      1. May be an absolute URI (e.g., http://example.org/incident182#person12)
      1. May be a relative URI (e.g.,#person12)
   1. A Definition is for the entire extension. 
1. Click **Build** to build the extension and **Confirm** (Figure 8.39)




1. You will see a notification message once you've click build confirming build success and the extension will show up in the artifact tree in the extension folder (extension.xsd). (Figure 8.40) 

1. The Custom Model Extension Builder has incorporated the **NIEMOpen Naming and Design Rules** to aid in enforcing **conformance**. Links to the NDR site, tool tips, and error messages appear throughout the CME Builder to remind the user of the conformance requirements. These rules vary depending on the NIEMOpen release.



1. **How to Build a CodeType Element**
   1. The CodeType Data Element has a few differences. 
   1. Once the initial information is compelted, the workflow moves to the **Add Codes** section. The user can either add codes manually in this section, or (following the standardized Code List template, import their own code list for the CME)



1. **Generate a Subset Schema**
- Click the “**Generate Subset Schema**” button to generate the wantlist and subset schema. See Figure 8.41
- A green notification will notify you that the Subset Schema has been generated and you can see the schema and wantlist  populate the MEP Artifacts area of the left Nav.  See figure 8.42

*Figure 8.41*



1. **Translate Format** 

   At this point you may also want to Translate your files to another format.  

1. You may do so by clicking the Translate Format button and checking the desired format followed by the Translate button  
   1. The format options of CMF, XML, JSON Schema, and OWL utilize the API 2.0 to perform the translations. Selecting these options will result in a new folder named Transforms to be created in the Artifact Tree. See Figure 8.44
   1. **Download a Subset Schema.**
1. After generating the Subset Schema, the package can be downloaded and available to open.  The standard windows download dialogue will render at the top right of your screen.  See figure 8.45
1. After downloading the Subset Schema, you can open the download folder in the Windows File Explorer. You will see the schema files, including the “Wantlist” if applicable.  See Figure 8.46

*Figure 8.45*


*Figure 8.46*

1. **Validate MEP/IEPD**
1. The validation process is avaible after generating a Subset Schema.
1. The validation process validates multiple package artifacts for conformance via an API connection. Artifacts can either Pass or Fail validation. Results will display for each individual artifact and the reports are downloadable. Conformance standards differ for each NIEMOpen Release, so results may vary upon when migrating a package. Any changes made to the package will clear validation results as well as copying/migrating a package. 

To begin:

1. **Select Validate Artifacts Button**







1. **Validation Results Display**

















1) **Assemble & Document** – Here you can prepare and package all related artifacts and files for the MEP.



1) Required Artifact Checklist (Figure 8.47) is an automated checklist that shows the status of required artifacts and updates the status as they are created. (Note: the Checklist also appears in the Publish & Implement Phase) 
   1. A green checkmark indicates which artifacts are complete and uploaded to the current package.(Figure 8.47)
   1. Items highlight with a warning symbol means highlighted required artifacts are missing. 
   1. The System not only checks which artifacts are completed and still outstanding, it also prevents you from going any further in the MEP publishing workflow until the applicable required items are complete. 
   1. Each section of the checklist is interactive and clicking into the title takes the user to appropraite area of the MEP Builder to complete the artifact.
      1. NIEM Subset Schema- Navigates user to the Build & Validate screen to Generate Subset Schema
      1. IEPD Catalog- Automated generation by system
      1. Sample Message- Navigates user to the Analyze Requirements screen to upload the Sample Message
      1. ReadMe- Navigates user to an editable ReadMe tab of the Assemble & Document screen
      1. ChangeLog- Navigates user to an editable ChangeLog tab of the Assemble & Document screen
   1. Once all the required documents are accounted for by the system, the “Publish Button” will be enabled. 

*Figure 8.43**



1) The Readme tab (See Figure 8.48) is a free form area and the system displays what type of information is expected in a Readme file as listed below: 
   1. Purpose of the IEPD
   1. Scope of its deployment, usage, and information content
   1. Business value and rationale for developing it
   1. Type of information it is intended to exchange, in business terms
   1. Identification (or types) of senders and receivers
   1. Typical interactions between senders, receivers, and systems
   1. References to other documentation within the IEPD

*Figure 8.48*

1. Links to external documents that may be needed to understand and implement
   1. There is an “upload” link within text of the readme tab which allows the user to upload a file. (Figure 8.49)
      1. Once a file has been uploaded in the supported format, a “Creation Success message shall display. 

*Figure 8.49*

1. Editing of the file can be performed by using the edit pencil and save control is available as well.
1. Once saved, the file shall appear in the Artifact Tree under the “Documentation” folder as “readme.txt” and a green checkmark shall appear beside the “ReadMe” in the Required Artifact Checklist.  

*Figure 8.50* 

1. Note: ReadMe can also be completed in the Publish & Implement Phase

1) Change Log, like ReadMe, is a freeform text area. 

*Figure 8.51*

1. The default file upload format will be (.doc, .pdf.rtf,.txt)  If uploaded in this format the “Change Log”  text area will accommodate and render the text contained in these files via the upload link that appears within text of this tab.
1. If a user uploads a file in the supported formats, a “Change Log Creation success message shall render letting you know that the Change Log artifact was successfully created.
   1. If you don’t upload your file in the supported format, a warning will render notifying you To view or edit within the tool, please export this file, save as a text file (.doc, .pdf,.rtf,.txt) and upload again. 
1. There is a create button which will allow you to create the Change Log file within the tool. 
   1. Note: If have already uploaded a supported file, there will be a save button where the create button would be.
1. You may edit the file by pressing the edit “Pencil”s.
1. The Artifact Checklist will update showing Change Log as ‘Uploaded’

*Figure 8.52*

1) The Busines Rules tab allows the user to create Business Rules files inside of the MEP Builder Tool. 

   1. To begin select the Add Rule button. The user now has the option to either upload a Business Rule file (any file type accepted except for .exe, .zip, or .tar). 
   1. The user must add a unique name for the File Name and add relevant Busines Rules into the text box. Then Select Create button and the file is added to the Artifact Tree and the Package itself. 
   1. Packages that are uploaded must be in the format .txt in order for the contents to display in the text box. 


1) **Publish & Implement** – In this phase you can update ReadMe and Change Log (first seen in Assemble & Document Phase) and you can complete the required Conformance Assertion section. Additionaly in this section you can implement the MEP into production and publish the MEP for search, discovery, and reuse. 



*Figure 8.54*

1) Conformance Assertion is required to provide verification that the package has been validated and conforms to all of the NDR rules
- Naming format:  You may name the files what you wish as long as filename contains the words “Conformance Assertion”.  However, it is required to reflect that in the catalog for the IEPD. 
- The Conformance Assertion form contains the following fields:
  1. URI
  1. Author
  1. Author’s Email
  1. Certification Date
  1. Details
  1. A check box where you may confirm the assertion.
- The Assert button is disabled until this assertion conformation is performed.

*Figure 8.55*

- Once active, you may click the **Assert** Button (Figure 8.56) and the “Conformance Assertion” will be checked off in the Required Artifact Checklist. (Figure 8.57)

*Figure 8.56*

- Now the publish button is active and you can publish the MEP. (Figure 8.57)



*Figure 8.57*
1. # <a name="_toc128646895"></a><a name="_toc165289031"></a>**MEP BUILDER TOOL UNINSTALL INSTRUCTIONS.**
1. If you have an existing version installed on your machine, follow these instructions to remove (uninstall) the old version prior to installing a new version.  
1. Open File Explorer and navigate to the C:\NIEM directory


1. Inside the NIEM folder, depending on which installation process you followed, you will see either the Build\_Installer folder or the Offline\_Installer folder.

1. Open the installer folder you see.


1. Type ‘powershell’ in the directory path field and either type ‘Enter’ on your keyboard or click the arrow to go to powershell.



1. A PowerShell window should appear. Verify that the directory listed is the path to your appropriate installer folder.


1. Type or copy/paste the appropriate command for your installer:
   1. \*\*NOTE\*\* There are two ‘-’ marks (hypen/dash) before the word ‘volumes’

|**Installer Type**|**Command to Run**|
| - | - |
|Build\_Installer|docker-compose -f fresh\_build.yaml down --volumes|
|Offline\_Installer|docker-compose -f offline.yaml down --volumes|


1. Click the Enter key on the keyboard to run the above command
1. It will take a few minutes for the containers to be removed. It will be completed when you see several ‘done’ statuses and the directory path as shown at the bottom of the image below.

1. Close the Powershell window by clicking the ‘X’ in the upper right corner.

1. In the File Explorer, navigate to C:\ and delete the NIEM folder by right clicking the NIEM folder and selecting Delete.

1. The uninstall process is complete.

1. # <a name="_toc128646896"></a><a name="_toc165289032"></a>**MEP BUILDER TOOL INSTALLATION INSTRUCTIONS**


1. **Prerequisites**
- Administrator privileges
- Access to a command-line
- Account for the Github (optional)
- Account for Docker Hub 
- Install Docker
  - [**https://docs.docker.com/desktop/windows/install/**](https://docs.docker.com/desktop/windows/install/)

\*\*Note\*\* 

At the time this was written all defaults were selected during install which utilized WSL2. 

1. **Create Project Directory**

This is an optional section to create the directory where the project files will be stored. Follow these steps to create the project directory:

1. Open the File Explorer and navigate to the C:\ drive
1. Right-click in the white space and select New > Folder


1. Name this folder ‘NIEM’




1. **Download & Install NIEMOpen MEP Builder**

The following section provides three installation instruction options. Choose to follow only one of the following options which best suit your environment and needs: 

1. **Offline Installer (Recommended)** –** Recommended for most users and/or for air gapped / non-internet connected devices.
1. **Online Installer** - For computers with access to GitHub and an internet connection.
1. **Build Installer** - For developers who want to rebuild the application.

1. **Option 1: Offline Installer**

To begin the offline install process, you must first have the Offline\_Installer.zip file downloaded to your computer.

1. Navigate to the zip file in the file explorer. Right-click on the zip file and select ‘Extract All…’



1. Click ‘Browse’ and browse and select the folder location you wish to extract the project files. If the earlier steps were followed in the ‘Create Project Directory’ section, select the C:\NIEM directory.

1. Click ‘Extract’





1. If the extracted files do not automatically pop-up upon completed extraction, navigate to the directory to where they were extracted.

1. Open the ‘Offline\_installer’ folder

1. Type ‘powershell’ in the directory path field and either type ‘Enter’ on your keyboard or click the arrow to go to powershell.

1. A PowerShell window should appear. Verify that the directory listed is the path to your Online\_Installer folder.

1. Type or copy/paste the following command: docker image load --input niem-api.tar

\*\*NOTE\*\* There are two ‘-’ marks before the word ‘input’


1. Click the Enter key on the keyboard to run the above command

\*\*NOTE\*\* It will take a few minutes for the image to be loaded. It will be completed when you see the ‘loaded image’ name and the directory path as shown at the bottom of the image below

1. Repeat steps 8-9 for the following commands:
1. docker image load --input niem-db.tar
1. docker image load --input niem-webui.tar
   - Type or copy/paste the following command:
1. docker-compose -f offline.yaml up -d
   - Click the Enter key on the keyboard to run the above command

It will take a few minutes for the image to be loaded. It will be completed when you see three ‘done’ statuses and the directory path as shown at the bottom of the image below


- You can now run the application by going to your browser and typing the URL ‘localhost:3000’

\*\*NOTE\*\* Upon initial startup, the webpage may continue to load for a few more moments before it is actually ready. 


1. **Option 2: Online Installer**
1. Navigate to the NIEM GitHub page and click on the **Releases** link 



1. Select the release you would like to deploy



1. View that the release will have several assets. 



1. Click on ‘Online\_Installer.zip’ to download it to your machine

1. View the zip file by either clicking ‘Show in Folder’ on the browser download pop-up (see image above) or navigating to your system’s default download folder

1. Right-click on the zip file and select ‘Extract All…’


1. Click ‘Browse’ and browse and select the folder location you wish to extract the project files. If the earlier steps were followed in the ‘Create Project Directory’ section, select the C:\NIEM directory.

1. Click ‘Extract’

1. If the extracted files do not automatically pop-up upon completed extraction, navigate to the directory to where they were extracted.

1. ` `Open the ‘Online\_Installer’ folder

1. Type ‘powershell’ in the directory path field and either type ‘Enter’ on your keyboard or click the arrow to go to powershell.

1. ` `A PowerShell window should appear. Verify that the directory listed is the path to your Online\_Installer folder.

1. ` `Type or copy/paste the following command: docker-compose up -d
   1. \*\*NOTE\*\* Depending on the permissions of the container repo you may be required to login with “docker login” and a personal access token will need to be created in Github. 

1. Click the Enter key on the keyboard to run the above command
1. It will take a few minutes for the images to be pulled. They will be completed when you see three ‘done’ statuses and the directory path as shown at the bottom of the image below

1. ` `You can now run the application by going to your browser and typing the  URL ‘localhost:3000’

1. **Option 3: Build Installer**
1. Navigate to the NIEM GitHub page and click on the **Releases** link 



1. Select the release you would like to deploy



1. View that the release will have several assets. 



1. Click on ‘Build\_Installer.zip’ to download it to your machine



1. View the zip file by either clicking ‘Show in Folder’ on the browser download pop-up (see image above) or navigating to your system’s default download folder

1. Right-click on the zip file and select ‘Extract All…’



1. Click ‘Browse’ and browse and select the folder location you wish to extract the project files. If the earlier steps were followed in the ‘Create Project Directory’ section, select the C:\NIEM directory.

1. Click ‘Extract’



1. If the extracted files do not automatically pop-up upon completed extraction, navigate to the directory to where they were extracted.


1. Open the ‘Build\_Installer’ folder



1. Type ‘powershell’ in the directory path field and either type ‘Enter’ on your keyboard or click the arrow to go to powershell.


1. A PowerShell window should appear. Verify that the directory listed is the path to your Build\_Installer folder.



1. Type or copy/paste the following command: 
   1. docker-compose -f fresh\_build.yaml up -d


1. Click the Enter key on the keyboard to run the above command

1. The container images will build and deploy. This process initially takes about 20-30 min.  Once the deployment is complete, you will see three ‘done’ statuses and the directory path as shown at the bottom of the image below



1. You can now run the application by going to your browser and typing the URL ‘localhost:3000’
   1. \*\*NOTE\*\* Upon initial startup, the webpage may continue to load for a few more moments before it is actually ready. 

















Click the source code asset corresponding to the operating system you are deploying NIEM on. (Zip for Windows; tar.gz for Linux)



Navigate to the downloaded archive. **Right click** and select **“Extract All”**



Extract the folder to a location on your C Drive. Then Select **Extract**



Final step… docker-compose up -d offline.yaml















1. Ensure Docker is running by opening Docker Desktop. Notice the Green Bar at the bottom left. 




1. In Windows Explorer Navigate to the directory where you extracted the NIEM archive. 




1. In the address bar type “powershell” and hit **Enter** to open a Powershell in the NIEM\_DIR.






1. In the newly opened Powershell **Type** “docker-compose up -d fresh\_build.yaml” and hit **Enter.** 





1. ` `The container images will build and deploy. This process initially takes about 20-30 min.  Once the deployment is complete you will be able to see them running in the Docker Desktop UI.





1. Open a browser and navigate to localhost:3000. 



1. The NIEMOpen MEP BuilderOpen Application is now up and running 













