const REST_ENDPOINT = "https://semantics.inf.um.es:8443/huron-ws";
/* WS URLs */
// const WS_GET_AVAILABLE_METRICS = "http://semantics.inf.um.es:8080/huron-ws/getAvailableMetrics";
const WS_GET_AVAILABLE_METRICS = REST_ENDPOINT + "/getAvailableMetrics"



function createMetricDiv (metric) {
	var name = metric.name;
	var shortDescription = metric.shortDescription;
	var longDescription = metric.longDescription;

	const title = document.createElement("h3");
	title.appendChild(document.createTextNode(name));

	const paragraph = document.createElement("div");
	//paragraph.classList.add('lead')
	paragraph.appendChild(document.createTextNode(longDescription));

	const metricDiv = document.createElement("div");
	metricDiv.appendChild(title);
	metricDiv.appendChild(paragraph);
	return metricDiv;
}

function removeChildren(component) {
	while (component.firstChild) {
		component.firstChild.remove();
	}
}

function reGenerateDocsMetricsDiv(div, availableMetrics) {
	removeChildren(div);
	for (var metric of availableMetrics) {
		var entryDiv = createMetricDiv(metric);
		div.appendChild(entryDiv);
	}
}

// Initialization
$.ajax({
	url: WS_GET_AVAILABLE_METRICS,
	type: 'GET',
	context: document.body,
	cache:  false,   
	success: function(data) {
		var docsMetricsDiv = document.getElementById("docs_metrics_div");
		reGenerateDocsMetricsDiv(docsMetricsDiv, data.metricDescriptionList);
	},
	error: function (request, status, error) {
		console.log(error);
    }
});
