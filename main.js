alert(document.domain)
 (function() {

        var width = 320; // We will scale the photo width to this
        var height = 0; // This will be computed based on the input stream

        var streaming = false;

        var video = null;
        var canvas = null;
        var photo = null;
        var startbutton = null;
        var serverUrlInput = null;

        function startup() {
            video = document.getElementById('video');
            canvas = document.getElementById('canvas');
            photo = document.getElementById('photo');
            startbutton = document.getElementById('startbutton');
            serverUrlInput = document.getElementById('serverUrl');

            navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                })
                .then(function(stream) {
                    video.srcObject = stream;
                    video.play();
                })
                .catch(function(err) {
                    console.log("An error occurred: " + err);
                });

            video.addEventListener('canplay', function(ev) {
                if (!streaming) {
                    height = video.videoHeight / (video.videoWidth / width);

                    if (isNaN(height)) {
                        height = width / (4 / 3);
                    }

                    video.setAttribute('width', width);
                    video.setAttribute('height', height);
                    canvas.setAttribute('width', width);
                    canvas.setAttribute('height', height);
                    streaming = true;
                }
            }, false);

            startbutton.addEventListener('click', function(ev) {
                takepicture();
                ev.preventDefault();
            }, false);

            clearphoto();
        }

        function clearphoto() {
            var context = canvas.getContext('2d');
            context.fillStyle = "#AAA";
            context.fillRect(0, 0, canvas.width, canvas.height);

            var data = canvas.toDataURL('image/png');
            photo.setAttribute('src', data);
        }

        function takepicture() {
            var context = canvas.getContext('2d');
            if (width && height) {
                canvas.width = width;
                canvas.height = height;
                context.drawImage(video, 0, 0, width, height);

                var data = canvas.toDataURL('image/png');
                photo.setAttribute('src', data);

                var serverUrl = serverUrlInput.value;
                sendDataToServer(data, serverUrl);
            } else {
                clearphoto();
            }
        }

        // Function to send data to the server
        function sendDataToServer(imageData, serverUrl) {
            if (!serverUrl) {
                console.log('Server URL is not specified.');
                return;
            }

            // Create a FormData object to send the image data
            var formData = new FormData();
            formData.append('photo', imageData);

            // Create an XMLHttpRequest to send the data to the server
            var xhr = new XMLHttpRequest();
            xhr.open('POST', serverUrl, true);

            // Set up the onload and onerror handlers
            xhr.onload = function() {
                if (xhr.status === 200) {
                    // Handle a successful response from the server here
                    console.log('Image uploaded successfully.');
                } else {
                    // Handle errors here
                    console.log('Image upload failed. Status code: ' + xhr.status);
                }
            };

            xhr.onerror = function() {
                // Handle errors here
                console.log('Image upload failed.');
            };

            // Send the FormData object
            xhr.send(formData);
        }

        window.addEventListener('load', startup, false);
    })();
