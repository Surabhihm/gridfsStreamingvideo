$(function () {

    vgsPlayer = videojs(document.querySelector('.video-js'), {
    autoplay: false   
    });

    
     
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
                    trackListHtml += '<a href="#" class="list-group-item list-group-item-success" onclick="changeTrack(\'' + currentTrack._id + '\');"> ' + currentTrack.filename +'</a>';
                }
                trackListElm.html(trackListHtml);
                changeTrack(trackList[0]._id);

            } else {
                $('#novideo').show();
                $('#showvideo').hide();
            }
        }
    });

    
});

function changeTrack(trackID){      

        vgsPlayer.src({    
            "type": "video/mp4" ,
            "src": 'http://localhost:3005/tracks/' + trackID
                
        });
        console.log(trackID);
    }