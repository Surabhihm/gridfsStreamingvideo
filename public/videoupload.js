$(document).ready(function () {
    uploadObj = $("#fileuploader").uploadFile({
        url: "http://localhost:3005/tracks/",
        fileName: "track",
        dragDrop: true,
        autoSubmit: false,
        // formData: { name: 'smallworld' },
        uploadStr: "Select file",
        dynamicFormData: function () {

            var data = { "name": $('#filename').val() };
            return data;
        }
    });
});

function startUpload() {
    if($('#filename').val()) {
        uploadObj.startUpload();
        $('#errormsg').hide();
        $('#filename').val('')
    } else {
        $('#errormsg').show();
        console.log('file name needed');
    }
    
}