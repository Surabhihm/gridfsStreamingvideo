$(function () {

    vgsPlayer = videojs(document.querySelector('.video-js'), {
    autoplay: false   
    });

    getTrackList();   
});

function getTrackList(){
     $.ajax({
        url: "/tracklist", success: function (trackList) {
            console.log(trackList)
            if (trackList.length > 0) {
                $('#novideo').hide();
                $('#showvideo').show();
                var trackListElm =  $('#videolist');
                var trackListHtml = '';
                for (var trackIndex = 0; trackIndex < trackList.length; trackIndex++) {
                    var currentTrack = trackList[trackIndex];
                    trackListHtml += `
                    <div class="list-group-item list-group-item-success">
                        <div class="row">
                            <div class="col-md-10">
                            <button class="btn btn-success btn-block" onclick="changeTrack('${currentTrack._id}' );"> ${currentTrack.filename} </button>
                            </div>
                            <div class="col-md-2">
                            <span > <button class="btn btn-danger btn-sm" onclick="deleteTrack( '${currentTrack._id}' )"> Delete </button> </span>
                            </div>
                        </div>  
                    </div>`;
                }
                trackListElm.html(trackListHtml);
                changeTrack(trackList[0]._id);

            } else {
                $('#novideo').show();
                $('#showvideo').hide();
            }
        }
    });
}

function changeTrack(trackID){      

        vgsPlayer.src({    
            "type": "video/mp4" ,
            "src": 'http://localhost:3005/tracks/' + trackID
                
        });
        console.log(trackID);
    }

function deleteAll() {
    $.ajax({
        url: "/deletetracklist", success: function (result) {
            $('#novideo').show();
            $('#showvideo').hide();
        }
    });
}

function deleteTrack(trackID) {
    $.ajax({
        url: "/delete/"+trackID, success: function (result) {
                getTrackList();
        }
    });
}