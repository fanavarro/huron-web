function getCopyrigth() {
	return '\u00A9' + ' ' + new Date().getFullYear() + ' - ' + 'Universidad de Murcia';
}

copyright_placeholder = document.getElementById("copyrigth_text");
if (copyright_placeholder) {
	copyright_placeholder.appendChild(document.createTextNode(getCopyrigth()));
}
