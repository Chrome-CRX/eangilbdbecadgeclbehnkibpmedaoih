//TODO: Add a clear button?

function resetHighlight() {
	$('#ignore option:selected').each(function () {
          $(this).removeAttr("selected");
	});
	$("#ignore option:first").attr('selected','selected');
}

function add() {
	var word = $('#add').val();
	word = word.toLowerCase();
	if (word.length <= 1) return;
	$('#add').val('');
	
	var list = new Array(); //Check if word already exists
	if (!localStorage.getItem("ignore")) list = [];
	else list = localStorage.getItem("ignore").split('&#3;');
	if (list.indexOf(word) != -1) return;
	
	$('#ignore').append($('<option>', { value : word }).text(word)); 
	save_options2();
	resetHighlight();
}

function remove() {
	 $('#ignore option:selected').each(function () {
          $(this).remove();
	});
	save_options2();
	resetHighlight();
}

$(document).ready( function() {
	restore_options();
	$('form input:radio').change(save_options1);
});

function save_options1() {
	$('form input[type=radio]:checked').each(function() {
		localStorage["mode"] = $(this).attr('id');
	});

  chrome.extension.getBackgroundPage().updateIcon(localStorage["mode"]);
  $('#status').html("<p/><p/><p/><p/>Options <b>Saved</b>.");
  setTimeout(function() {
    $('#status').html("");
  }, 1000);
 }
 
function save_options2() {
 var list = new Array();
  $('select option').each(function () {
          list.push($(this).val());
	});
  localStorage.setItem("ignore", list.join('&#3;'));
  
  // Update status to let user know options were saved.
  $('#status').html("<p/><p/><p/><p/>Options <b>Saved</b>.");
  setTimeout(function() {
    $('#status').html("");
  }, 1000);
}

function save_options3(mode) {
  localStorage.setItem("rightclick", mode);

  // Update status to let user know options were saved.
  $('#status').html("<p/><p/><p/><p/>Options <b>Saved</b>.");
  setTimeout(function() {
    $('#status').html("");
  }, 1000);
}

function restore_options() {
  var mode = localStorage["mode"];
  if (!mode) mode = 2;
  $('#' + mode).attr('checked', true);
  
  var clickMode = localStorage["rightclick"];
  if (!clickMode) clickMode = 0;
  $('#' + clickMode + "r").attr('checked', true);
  
  var list = new Array();
  if (!localStorage.getItem("ignore")) list = [];
  else list = localStorage.getItem("ignore").split('&#3;');
  for (var i = 0; i < list.length; i++) {
	var word = list[i];
	$('#ignore').append($('<option>', { value : word }).text(word)); 
  }
  resetHighlight();
}

function modRight(mode) {
	if (mode == 0) { //Keep
		chrome.extension.getBackgroundPage().initContext();
	} else { //Remove
		chrome.contextMenus.removeAll();
	}
	save_options3(mode);
}
