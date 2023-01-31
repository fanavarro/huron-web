/* WS URLs */
const WS_CALCULATE_METRICS = "http://semantics.inf.um.es:8080/huron-ws/calculateMetricsEmail"
const WS_GET_AVAILABLE_METRICS = "http://semantics.inf.um.es:8080/huron-ws/getAvailableMetrics"

/* Loading button functionalidty */

function onProgress (idButton) {
	var button = document.getElementById(idButton);
	button.disabled = true;
	var buttonText = document.getElementById(idButton+"Text");
	buttonText.innerText = "Calculating...";
}

function stopProgress (idButton) {
	var button = document.getElementById(idButton);
	button.disabled = false;
	var buttonText = document.getElementById(idButton+"Text");
	buttonText.innerText = "Run experiment";
}

/* Alerts functionality */

function showCollapseMessage (type /* success, danger, warning */, id, strongMessage, message) {
	var collapseObj = document.getElementById(id+"Collapse");
	collapseObj.setAttribute("class", "collapse.show");
	var typeObj = document.getElementById(id+"Type");
	typeObj.setAttribute("class", "alert alert-"+type);
	var strongObj = document.getElementById(id+"Strong");
	strongObj.innerText = " "+strongMessage;
	var messageObj = document.getElementById(id+"Message");
	messageObj.innerText = " "+message;	
	hiddeCollapseMessage(id, collapseObj, 5);
}

function hiddeCollapseMessage (id, collapsableObj, timerCount) {
	var badgeId = id+"BadgeCounter";
	document.getElementById(badgeId).innerText = timerCount;
	if ( timerCount == 0 ) { 
		collapsableObj.setAttribute("class", "collapse");     
	}
	else {
		setTimeout(function(){ hiddeCollapseMessage(id, collapsableObj, timerCount-1); }, 1000);
	}
}

function parseOntologyList (ontologyListStr) {
	var ontologyList = [];
	var entries = ontologyListStr.split('\n');
	for (var entry of entries) {
		var name = entry.split(' ')[0].trim();
		var iri = entry.split(' ')[1].trim();
		ontologyList.push({'name': name, 'iri': iri});
	}
	return ontologyList;
}

function parseSelectedMetrics (checkboxes) {
	var selectedMetrics = [];
	for (var checkbox of checkboxes) {
		if (checkbox.checked){
			selectedMetrics.push(checkbox.value);
		}
	}
	return selectedMetrics;
}

function parsePerformAnalysis (radioButtons) {
	var performAnalysis = false;
	for (var radioButton of radioButtons) {
		if (radioButton.checked) {
			performAnalysis = radioButton.value === 'true';
		}
	}
	return performAnalysis;
}


/* Prepare request, call rest service a get the results */
function calculate () {

	// Button set to progress status
	onProgress("buttonStep1");

	// Obtain the input parameters
	var userEmail = document.getElementById("user_email").value.trim();
	if (userEmail == "") {
		stopProgress("buttonStep1");
		showCollapseMessage("warning", "alertStep1", "Warning!", "The email field is mandatory.");
		return false;
	}
	
	var ontologyList = parseOntologyList(document.getElementById("ontology_list").value);
	if (!ontologyList) {
		stopProgress("buttonStep1");
		showCollapseMessage("warning", "alertStep1", "Warning!", "You must include the ontologies to analyse");
		return false;
	}
	
	var selectedMetrics = parseSelectedMetrics(document.getElementsByName("metric_selector"));
	if (!selectedMetrics) {
		stopProgress("buttonStep1");
		showCollapseMessage("warning", "alertStep1", "Warning!", "You must specify the metrics to be calculated.");
		return false;
	}
	
	var performAnalysis = parsePerformAnalysis(document.getElementsByName("perform_analysis"));
	
	// Create the input
	var input = {'email': userEmail, 'ontologies': ontologyList, 'metrics': selectedMetrics, 'performAnalysis': performAnalysis};

	$.ajax({
		url: WS_CALCULATE_METRICS,
		type: 'POST',
		data: JSON.stringify(input),
		contentType: 'application/json; charset=utf-8',
		context: document.body,
		cache:  false,
		dataType: 'json',                                   
		mimeType: 'application/json',     
		success: function(data) {
			console.log(data);
			stopProgress("buttonStep1");
			showCollapseMessage("success", "alertStep1", "Task successfully scheduled", data.message);
		},
		error: function (request, status, error) {
			stopProgress("buttonStep1");
			showCollapseMessage("danger", "alertStep1", "Error", "Unsuccessfull call to the web service.");
		}
	});


	return false;

}

function createMetricEntry (metric) {
	var name = metric.name;
	var shortDescription = metric.shortDescription;
	var longDescription = metric.longDescription;
	var entry = `<label title="${shortDescription}"><input type="checkbox" name="metric_selector" value="${name}" >${name}</label><br />`;
	return entry;
}

function removeChildren(component) {
	while (component.firstChild) {
		component.firstChild.remove()
	}
}

function reGenerateMetricSelector(fieldset, availableMetrics) {
	removeChildren(fieldset);
	//fieldset.insertAdjacentHTML('beforeend', "<legend>Select the metrics to calculate</legend>");
	for (var metric of availableMetrics) {
		var entry = createMetricEntry(metric);
		fieldset.insertAdjacentHTML('beforeend', entry);
	}
}

// Initialization
$.ajax({
	url: WS_GET_AVAILABLE_METRICS,
	type: 'GET',
	context: document.body,
	cache:  false,   
	success: function(data) {
		var metric_selector = document.getElementById("fieldset_metric_selector")
		reGenerateMetricSelector(metric_selector, data.metricDescriptionList);
	},
	error: function (request, status, error) {
		console.log(error);
    }
});
