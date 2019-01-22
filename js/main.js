//
// TODO: change student/mentor to layoutType
// TODO: add flexibility (query parameter?) for school year
//
const app = function () {
	const PAGE_TITLE = 'Welcome letter'
	const PAGE_VERSION = 'v0.1';
		
	const API_BASE = 'https://script.google.com/macros/s/AKfycbwuO-prQVmE_8HetNfg67dqK4Jie7eetp_8j4Bo5HcHGASf_5GN/exec';
	const API_KEY = 'MVwelcomemessageAPI';
	
	const NO_COURSE = 'NO_COURSE';
	const TEMPLATEVAR_CLASS = 'wl-has-template-item';
	const APCOURSE_CLASS = 'wl-apcourse';
	
	const USE_DEFAULT = 'USE_DEFAULT';
	
	const page = {};
	const settings = {
		"include": "./include/",
	};

	const layoutElementId = {
		"student": {
			"main": "contents",
			"contact": "msg_student_contact",
			"generalinfo": "msg_generalinfo",
			"welcome": "msg_welcome",
			"expectations1": "msg_exp1",
			"expectations2": "msg_exp2",
			"keypoints": "msg_student_keypoints"
		},
		"mentor": {
			"main": "contents",
			"contact": "msg_mentor_contact",
      "passwords": "msg_mentor_passwords",
			"generalinfo": "msg_mentor_generalinfo",
			"welcome": "msg_mentor_welcome",
			"resources": "msg_mentor_resources",
			"expectations": "msg_mentor_exp1",
			"response": "msg_mentor_response",
			"specialpop": "msg_mentor_specialpop",
			"keypoints": "msg_mentor_keypoints"
		}
	};
	
	const defaultIncludeFile = {
		"student": {
			"main": "msg_student_main.html",
			"contact": "msg_student_contact.html",
			"generalinfo": "msg_student_generalinfo.html",
			"welcome": "msg_student_welcome.html",
			"expectations1": "msg_student_exp1.html",
			"expectations2": "msg_student_exp2.html",
			"keypoints": "msg_student_keypoints.html",
			"templatemessage": "template_student.html"
		},
		"mentor": {
			"main": "msg_mentor_main.html",
			"contact": "msg_mentor_contact.html",
      "passwords": "msg_mentor_passwords.html",
			"generalinfo": "msg_mentor_generalinfo.html",
			"welcome": "msg_mentor_welcome.html",
			"resources": "msg_mentor_resources.html",
			"expectations": "msg_mentor_exp1.html",
			"response": "msg_mentor_response.html",
			"specialpop": "msg_mentor_specialpop.html",
			"keypoints": "msg_mentor_keypoints.html",
			"templatemessage": "template_mentor.html"
		}
	};
	
	const defaultKeypoints = {
		"student": {
			"lead": [
				"There are no due dates other than the end of the semester, however you should strive to follow the pacing guide."
			],
			"lead_ap": [
				"There are weekly due dates for assignments, with penalties for late assignments."
			],
			"trail": [
				"Details for policies can be found in the <span class=\"wl-bblink\">Course Info</span> section.  Please contact me anytime you have questions."
			],
			"trail_ap": [
				"Details for policies can be found in the <span class=\"wl-bblink\">Course Info</span> section "
        + "and in the <a href='https://michiganvirtual.org/about/support/knowledge-base/advanced-placement-course-policy/' target='_blank'>Advanced Placement Course Policy</a> document. "
        + "Please contact me anytime you have questions."
			]
		},
		"mentor": {
			"lead": [
				"There are no due dates other than the end of the semester, however students should strive to follow the pacing guide."
			],
			"lead_ap": [
				"There are weekly due dates for assignments, with penalties for late assignments."
			],
			"trail": [
				"Details for policies can be found in the <span class=\"wl-bblink\">Course Info</span> section.  Please contact me anytime you have questions."
			],
			"trail_ap": [
				"Details for policies can be found in the <span class=\"wl-bblink\">Course Info</span> section "
        + "and in the <a href='https://michiganvirtual.org/about/support/knowledge-base/advanced-placement-course-policy/' target='_blank'>Advanced Placement Course Policy</a> document. "
        + "Please contact me anytime you have questions."
			]
		}
	};
	
	const templateVariableReplacements = {
		"term": {
			"s1": "Semester 1 (20 Weeks)",
			"s2": "Semester 2 (20 Weeks)",
			"t1": "Trimester 1 (13 Weeks)",
			"t2": "Trimester 2 (14 Weeks)",
			"t3": "Trimester 3 (13 Weeks)",
			"summer": "Summer (10 Weeks)",
			"essentials": "Essentials",
			"open": "Open Entry"
		}
	};
	
	//---------------------------------------
	// get things going
	//----------------------------------------
	function init () {
		page.header = document.getElementById('header');
		page.header.toolname = document.getElementById('toolname');
		page.header.courses = document.getElementById('courses');
		page.header.controls = document.getElementById('controls');
		page.header.style.display = 'none'; 
		page.header.style.visibility = 'hidden';
		
		page.notice = document.getElementById('notice');
		page.notice.classList.add('wl-notice');
		
		page.standards = document.getElementById('contents');

		page.textforclipboard = document.getElementById('text_for_clipboard');
		page.textforclipboard.style.display = 'none';
		
		page.messagestage = document.getElementById('message_stage');
		page.messagestage.style.display = 'none';
		
		if (!_initializeSettings()) {
			_setNotice('Failed to generate welcome letter - invalid parameters');
		} else {
			if (settings.navmode) {
				_getCourseList(_initHeader);
			} else {
				_generateWelcomeLetter();
			}
		}
	}
	
	//-------------------------------------------------------------------------------------
	// query params:
	//    navmode: display course dropdown and student/mentor options (other params ignored if navmode)
	//    coursekey:  short name for course (required unless navmode)
	//    layout: "student" or "mentor"  (required unless navmode)
	//    term: s1, s2, t1, t2, t3, summer, essentials, open	  (required unless navmode)
	//-------------------------------------------------------------------------------------
	function _initializeSettings() {
		var result = false;

		var params = {};
		
		settings.navmode = false;
		settings.coursekey = NO_COURSE;
		settings.layouttype = '';
			
		var urlParams = new URLSearchParams(window.location.search);
		params.navmode = urlParams.has('navmode');
		params.coursekey = urlParams.has('coursekey') ? urlParams.get('coursekey') : null;
		params.layouttype = urlParams.has('layout') ? urlParams.get('layout') : null;
		params.term = urlParams.has('term') ? urlParams.get('term') : null;
		settings.navmode = params.navmode;

		if (params.navmode) {
			settings.layouttype = 'student';
			settings.term = 's1';
			result = true;
			
		} else if (params.coursekey != null && params.layouttype != null && params.term != null) {
			settings.coursekey = params.coursekey;
			settings.layouttype = params.layouttype;
			settings.term = params.term;
			result = true;
		} 
		
		return result;
	}
	
	//------------------------------------------------------------------------------
	// initialization of output page including optional controls section for navmode
	//------------------------------------------------------------------------------
	function _initHeader() {
		page.header.classList.add('wl-header');
				
		page.header.toolname.innerHTML = PAGE_TITLE;
		
		var elemCourseSelect = _createCourseSelect();
		var elemLayout = _createLayoutChoice();
		var elemTerm = _createTermChoice();
		var elemLinkControl = _createLinkControl();
			
		page.header.courses.appendChild(elemCourseSelect);
		page.header.controls.appendChild(elemLayout);
		page.header.controls.appendChild(elemTerm);
		page.header.controls.appendChild(elemLinkControl);
		
		page.header.style.display = 'block';
		page.header.style.visibility = 'visible';
	}
	
	function _createCourseSelect() {
		var elemCourseSelect = document.createElement('select');
		elemCourseSelect.id = 'selectCourse';
		elemCourseSelect.classList.add('wl-control');
		elemCourseSelect.addEventListener('change',  _courseSelectChanged, false);
		
		var elemNoCourseOption = document.createElement('option');
		elemNoCourseOption.value = NO_COURSE;
		elemNoCourseOption.text = '<select a course>';
		elemCourseSelect.appendChild(elemNoCourseOption);
		
		var courseList = _sortCourseList(settings.courseList);

		for (var i = 0; i <  courseList.length; i++) {
			var elemOption = document.createElement('option');
			elemOption.value = courseList[i].coursekey;
			elemOption.text = courseList[i].fullname;
			elemCourseSelect.appendChild(elemOption);
		}

		page.courseselect = elemCourseSelect;
		
		return elemCourseSelect;
	}
  
  function _sortCourseList(origList) {
    return origList.sort( function(a, b) {
      var aname = a.fullname.toLowerCase();
      var bname = b.fullname.toLowerCase();
      return aname.localeCompare(bname);
    });
  }
		
	function _createLayoutChoice() {
		var layoutChoices = ['student', 'mentor'];
		var elementName = 'layouttype';
		var handler = _layoutTypeChange;
		var className = 'wl-radio';
		
		var elemWrapper = document.createElement('span');
		elemWrapper.classList.add('container');
		
		for (var i = 0; i < layoutChoices.length; i++) {
			var choice = layoutChoices[i];
			
			var elemChoice = document.createElement('input');
			elemChoice.id = choice;
			elemChoice.type = 'radio';
			elemChoice.name = elementName;
			if (i == 0) elemChoice.checked = true;
			elemChoice.addEventListener('change', handler, false);
			
			var elemLabel = document.createElement('label');
			elemLabel.htmlFor = choice;
			elemLabel.innerHTML = choice;
			elemLabel.classList.add(className);
			
			elemWrapper.appendChild(elemChoice);
			elemWrapper.appendChild(elemLabel);
		}
		
		return elemWrapper;
	}
	
		
	function _createTermChoice() {
		var layoutChoices = ['s1', 's2', 't1', 't2', 't3', 'summer', 'essentials', 'open'];
		var elementName = 'term';
		var handler = _termChange;
		var className = 'wl-radio';
		
		var elemWrapper = document.createElement('span');
		elemWrapper.classList.add('container');
		
		for (var i = 0; i < layoutChoices.length; i++) {
			var choice = layoutChoices[i];
			
			var elemChoice = document.createElement('input');
			elemChoice.id = choice;
			elemChoice.type = 'radio';
			elemChoice.name = elementName;
			if (i == 0) elemChoice.checked = true;
			elemChoice.addEventListener('change', handler, false);
			
			var elemLabel = document.createElement('label');
			elemLabel.htmlFor = choice;
			elemLabel.innerHTML = choice;
			elemLabel.classList.add(className);
			
			elemWrapper.appendChild(elemChoice);
			elemWrapper.appendChild(elemLabel);
		}
		
		return elemWrapper;
	}
		
	function _createLinkControl() {
		var elemWrapper = document.createElement('span');
		elemWrapper.classList.add('container');
		
		elemWrapper.appendChild(_makeButton('btnLink', 'wl-control', 'link', 'copy link to clipboard', _handleLinkButton));
		elemWrapper.appendChild(_makeButton('btnMessage', 'wl-control', 'msg', 'copy welcome message to clipboard', _handleMessageButton));
		return elemWrapper;
	}
	
	function _makeButton(id, className, label, title, listener) {
		var btn = document.createElement('button');
		btn.id = id;
		btn.classList.add(className);
		btn.innerHTML = label;
		btn.title = title;
		btn.addEventListener('click', listener, false);
		return btn;
	}
	
	//---------------------------------------------------------
	// gather config information and call to start rendering
	//--------------------------------------------------------
	function _generateWelcomeLetter() {
		_getWelcomeLetterLayout(_renderWelcomeLetterMain);
	}

	function _clearWelcomeLetter() {
		var elemContents = document.getElementById('contents');
		while (elemContents.firstChild) {
			elemContents.removeChild(elemContents.firstChild);
		}
		page.messagestage.innerHTML = '';
	}	
	
	//---------------------------------------------------------------------------------
	// use settings.config to load HTML include files and replace template variables
	// NOTE: template variables currently can't be used in the "main" or "keypoints" sections
	//--------------------------------------------------------------------------------
	function _renderWelcomeLetterMain() {
		var fulllayout = settings.fulllayout;
		var fullname = fulllayout.fullname;
		var layouttype = fulllayout.layouttype;
		var layoutMain = fulllayout.layout.main;
		var layoutelementMain = layoutElementId[layouttype].main;
		var defaultincludeMain = defaultIncludeFile[layouttype].main;
		var messageinclude = defaultIncludeFile[layouttype].templatemessage;
		
		settings.keypoints = fulllayout.keypoints;
		
		var filename = layoutMain;
		if (filename == USE_DEFAULT) filename = defaultincludeMain;
		
		_includeHTML(layoutelementMain, settings.include + filename, _renderWelcomeLetterSubsections);
		_includeHTML(page.messagestage.id, settings.include + messageinclude, _replaceAllTemplateVariables);
	}
	
	function _renderWelcomeLetterSubsections() {
		var fulllayout = settings.fulllayout;
		var fullname = fulllayout.fullname;
		var layouttype = fulllayout.layouttype;
		var layout = fulllayout.layout
		var layoutelement = layoutElementId[layouttype];
		var defaultinclude = defaultIncludeFile[layouttype];

		for (var key in layout) {
			if (key != 'main') {
				var elementId = layoutelement[key];
				var filename = layout[key];
				var defaultfilename = defaultinclude[key];
				if (filename == USE_DEFAULT) filename = defaultfilename;
				if (key == 'keypoints') {
					_includeHTML(elementId, settings.include + filename, _renderKeypoints);
				} else {
					_includeHTML(elementId, settings.include + filename, _replaceAllTemplateVariables);
				}
			}
		}
	}
	
	function _renderKeypoints() {
		var elemList = document.getElementById('listKeypoints');
		var apCourse = elemList.classList.contains(APCOURSE_CLASS);

		var leadKeypoints = defaultKeypoints[settings.layouttype].lead;
		if (apCourse) leadKeypoints = defaultKeypoints[settings.layouttype].lead_ap;

		var trailKeypoints = defaultKeypoints[settings.layouttype].trail;
		if (apCourse) trailKeypoints = defaultKeypoints[settings.layouttype].trail_ap;
		
		var courseKeypointKeys = ['exams', 'passwords', 'proctoring', 'assessment_retake', 'assignment_resubmit'];
		var courseKeypoints = settings.keypoints;

		for (var i = 0; i < leadKeypoints.length; i++) {
			elemList.appendChild(_createKeypointListItem(leadKeypoints[i]));
		}
		
		for (var i = 0; i < courseKeypointKeys.length; i++) {
			var keypoint = courseKeypoints[courseKeypointKeys[i]];
			if (keypoint != '') {
				elemList.appendChild(_createKeypointListItem(keypoint));
			}
		}
		
		for (var i = 0; i < trailKeypoints.length; i++) {
			elemList.appendChild(_createKeypointListItem(trailKeypoints[i]));
		}
	}
	
	function _createKeypointListItem(txt) {
		var elemOption = document.createElement('li');
		elemOption.innerHTML = txt;
		return elemOption;
	}	
	
	function _includeHTML(elemId, url, callback) {
		//console.log('_includeHTML: elemId=' + elemId + ' url=' + url); //+ ' cb=' + callback);
    //console.log('  elem: ' + document.getElementById(elemId).id);
		$("#" + elemId).load(url, function(response, status, xhr) {
			if (status == "success") {
				callback(elemId);
			} else {
				var msg = 'failed to load ' + elemId + ' from ' + url;
				console.log(msg);
				_setNotice(msg);
			}
		});	
	}
	
	function _replaceAllTemplateVariables(elemId) {
		var templateElements = document.getElementById(elemId).getElementsByClassName(TEMPLATEVAR_CLASS);
		for (var i = 0; i < templateElements.length; i++) {
			var ihtml = templateElements.item(i).innerHTML;
			templateElements.item(i).innerHTML = _replaceTemplateVariables(ihtml);
		}
        
    _addPasswordLink();
	}

	function _replaceTemplateVariables(str) {
		var matches = str.match(/\[\[.*\]\]/);
		for (var i = 0; i < matches.length; i++) {
			var replacement = _replacementSingleTemplateVariable(matches[i]);
			str = str.replace(matches[i], replacement);
		}
		
		return str;
	}
	
	function _replacementSingleTemplateVariable(str) {
		if (str == '[[coursefullname]]') return settings.fulllayout.fullname;
		if (str == '[[calendarsection]]') return templateVariableReplacements.term[settings.term];
		if (str == '[[linktolettersite]]') return _createLinkCode();		
		var msg = 'unmatched template variable: ' + str;
		_setNotice(msg);
		//console.log(msg);
		
		return str;
	}

	//---------------------------------------
	// utility functions
	//----------------------------------------
	function _setNotice (label) {
		page.notice.innerHTML = label;

		if (label == '') {
			page.notice.style.display = 'none'; 
			page.notice.style.visibility = 'hidden';
		} else {
			page.notice.style.display = 'block';
			page.notice.style.visibility = 'visible';
		}
	}
	
	//-----------------------------------------------
	// event handlers
	//-----------------------------------------------	
	function _courseSelectChanged(evt) {
		settings.coursekey = evt.target.value;

		if (page.courseselect.value == NO_COURSE) return;
		_clearWelcomeLetter();
		_generateWelcomeLetter();
	}
	
	function _layoutTypeChange(evt) {
		settings.layouttype = evt.target.id

		if (page.courseselect.value == NO_COURSE) return;
		_clearWelcomeLetter();
		_generateWelcomeLetter();
	}
	
	function _termChange(evt) {
		settings.term = evt.target.id

		if (page.courseselect.value == NO_COURSE) return;
		_clearWelcomeLetter();
		_generateWelcomeLetter();
	}
	
	function _handleLinkButton(evt) {
		if (page.courseselect.value == NO_COURSE) return;
		
		_copyLinkCodeToClipboard();
	}
	
	function _handleMessageButton(evt) {
		if (page.courseselect.value == NO_COURSE) return;
		
		_copyMessageCodeToClipboard();
	}
  
  function _addPasswordLink() {
    var element =  document.getElementById('passwords');
    if (typeof(element) != 'undefined' && element != null)
    {
      element.removeEventListener('click', _openPasswordPage);
      element.addEventListener('click', _openPasswordPage, false);
      
      /*
      console.log(typeof element.onclick);
      if(typeof element.onclick == null) {
        console.log('adding event listener');
        element.addEventListener('click', function() {
           _openPasswordPage();
        }, false);
      }
      */
    }
  }
  
  function _openPasswordPage() {
    var termMapper = {
			"s1": "semester1",
			"s2": "semester2",
			"t1": "trimester1",
			"t2": "trimester2",
			"t3": "trimester3",
			"summer": "summer",
			"essentials": "essentials",
			"open": "open"
    }

    var url = 'https://ktsanter.github.io/course-passwords/course-passwords.html';
    var instructor = 'ksanter';
    var schoolyear = '2018-2019';
    var term = termMapper[settings.term];
    var coursekey = settings.coursekey;
    var queryParams = '?instructor=' + instructor + '&schoolyear=' + schoolyear + '&term=' + term + '&coursekey=' + coursekey;
    console.log('open password page');
    console.log(url + queryParams);
    var win = window.open(url + queryParams, '_blank');
    win.focus();
  }
	
	//--------------------------------------------------------------
	// build URL for use with Google sheet web API
	//--------------------------------------------------------------
		function _buildApiUrl (datasetname, coursekey, layouttype) {
		let url = API_BASE;
		url += '?key=' + API_KEY;
		url += datasetname && datasetname !== null ? '&dataset=' + datasetname : '';
		url += coursekey && coursekey !== null ? '&coursekey=' + coursekey : '';
		url += layouttype && layouttype !== null ? '&layouttype=' + layouttype : '';
		//console.log('buildApiUrl: url=' + url);
		
		return url;
	}
	
	//--------------------------------------------------------------
	// use Google Sheet web API to get course list
	//--------------------------------------------------------------
	function _getCourseList (callback) {
		_setNotice('loading course list...');

		fetch(_buildApiUrl('courselist'))
			.then((response) => response.json())
			.then((json) => {
				//console.log('json.status=' + json.status);
				if (json.status !== 'success') {
					_setNotice(json.message);
				}
				//console.log('json.data: ' + JSON.stringify(json.data));
				settings.courseList = json.data.courselist;
				_setNotice('');
				callback();
			})
			.catch((error) => {
				_setNotice('Unexpected error loading course list');
				console.log(error);
			})
	}
	
	//--------------------------------------------------------------
	// use Google Sheet web API to get layout for course
	//--------------------------------------------------------------
	function _getWelcomeLetterLayout (callback) {
		_setNotice('loading layout for course...');
		fetch(_buildApiUrl('layout', settings.coursekey, settings.layouttype))
			.then((response) => response.json())
			.then((json) => {
				//console.log('json.status=' + json.status);
				if (json.status !== 'success') {
					_setNotice(json.message);
				}
				//console.log('json.data: ' + JSON.stringify(json.data));
				settings.fulllayout = json.data;
				_setNotice('');
				callback();
			})
			.catch((error) => {
				_setNotice('Unexpected error loading layout');
				console.log(error);
			})
	}
	
    //------------------------------------------------------------------------------------------
    // create link code and copy to clipboard
    //------------------------------------------------------------------------------------------
	function _copyTextToClipboard(txt) {
		var clipboardElement = page.textforclipboard;
		clipboardElement.value = txt;
		clipboardElement.style.display = 'block';
		clipboardElement.select();
		document.execCommand("Copy");
		clipboardElement.selectionEnd = clipboardElement.selectionStart;
		page.textforclipboard.style.display = 'none';
	}	
	
	function _copyLinkCodeToClipboard() {
		_setNotice('');
				
		_copyTextToClipboard(_createLinkCode());
		
		_setNotice('Link to welcome letter for ' + settings.fulllayout.fullname + ', ' + settings.layouttype + ', ' + settings.term + ' copied to clipboard');
	}
	
	function _copyMessageCodeToClipboard() {
		_setNotice('');

		_copyTextToClipboard(_createMessageCode());

		_setNotice('Welcome message HTML for ' + settings.fulllayout.fullname + ', ' + settings.layouttype + ', ' + settings.term + ' copied to clipboard');
	}
	
	function _createLinkCode() {
		var baseURL = location.protocol + '//' + location.host + location.pathname;
		
		var linkCode = baseURL;
		linkCode += '?coursekey=' + settings.coursekey;
		linkCode += '&layout=' + settings.layouttype;
		linkCode += '&term=' + settings.term;

		return linkCode;
	}
	
	function _createMessageCode() {
		var messageCode = page.messagestage.innerHTML;
		
		return messageCode;
	}
	
	return {
		init: init
 	};
}();