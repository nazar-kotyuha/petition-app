let addTagsBtn = document.getElementById('addTagsBtn');
let tagsList = document.querySelector('.tagsList');
let tagDiv = document.querySelectorAll('.tagDiv')[0];

addTagsBtn.addEventListener('click', function(){
  let newTags = tagDiv.cloneNode(true);
  let input = newTags.getElementsByTagName('input')[0];
  input.value = '';
  tagsList.appendChild(newTags);
});

function copyToClipboard(petitionId) {
  const el = document.createElement('textarea');
  text = window.location.origin + '/petition/' + petitionId;
  navigator.clipboard.writeText(text)
  
  // Show the toast notification
  var toast = document.getElementById('toastNotification');
  toast.classList.add('show');
}

function previewImage(event) {
  var input = event.target;
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var imageElement = document.getElementById('currentImage');
      imageElement.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}
