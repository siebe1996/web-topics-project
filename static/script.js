/**
 * @author Van de Voorde Siebe
 * @Version 6-11-2021
 */
;(function () {
    "use strict";


    //const imageUpload = document.getElementById('imageUpload');
    const predictBtn = document.getElementById('predict-button');
    let selectImg = document.getElementById('selected-image');
    let imgSelector = document.getElementById('image-selector');

    Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    ]).then(loadModel);

    let faceMatcher;
    let image;
    let canvas;
    let container;
    let file;

    $("#image-selector").change(async function () {
        /*let reader = new FileReader();
        reader.onload = function () {
            let  dataURL = reader.result;
            $('#selected-image').attr("src", dataURL);
            //$("#prediction-list").empty();
        }
        file = imgSelector.files[0]
        //let file = $("#image-selector").prop('files')[0];
        reader.readAsDataURL(file);*/
        if (image) image.remove();
        if (canvas) canvas.remove();
        //let imageBeforeBuffer= $('#selected-image').get(0);
        image = await faceapi.bufferToImage(imgSelector.files[0]);
        container.append(image);
        canvas = faceapi.createCanvasFromMedia(image);
        container.append(canvas);
    });


    async function loadModel() {
        document.querySelector(".progress-bar").style.display = "block";
        container = document.createElement('div');
        container.style.position = 'relative';
        document.getElementById('image').append(container);
        const labeledFaceDescriptors = await loadLabeledImages();
        faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
        //document.body.append('Loaded')
        document.querySelector('.progress-bar').style.display = "none";
        //await start()
    }

    predictBtn.addEventListener('click', async () => {
        /*const container = document.createElement('div')
        container.style.position = 'relative'
        document.body.append(container)
        const labeledFaceDescriptors = await loadLabeledImages()
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
        let image
        let canvas
        document.body.append('Loaded')*/
        //imageUpload.addEventListener('change', async () => {
        /*
            if (image) image.remove()
            if (canvas) canvas.remove()
            image = await faceapi.bufferToImage(imageUpload.files[0])
            container.append(image)
            canvas = faceapi.createCanvasFromMedia(image)
            container.append(canvas)
            const displaySize = { width: image.width, height: image.height }
            faceapi.matchDimensions(canvas, displaySize)
            const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                drawBox.draw(canvas)
            })*/
        //})
        await start();
    });

    async function start() {
        /*if (image) image.remove()
        if (canvas) canvas.remove()
    //let imageBeforeBuffer= $('#selected-image').get(0);
    image = await faceapi.bufferToImage(imgSelector.files[0])
        container.append(image)
        canvas = faceapi.createCanvasFromMedia(image)
        container.append(canvas)*/
        const displaySize = {width: image.width, height: image.height};
        faceapi.matchDimensions(canvas, displaySize);
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));

        console.log(detections);
        $("#prediction-list").empty();

        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, {label: result.toString()});
            drawBox.draw(canvas);
            $("#prediction-list").append(`<li>${result._label}</li>`);


        });
    }

    function loadLabeledImages() {
        const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark'];
        return Promise.all(
            labels.map(async label => {
                const descriptions = [];
                for (let i = 1; i <= 2; i++) {
                    const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`);
                    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                    descriptions.push(detections.descriptor);
                }

                return new faceapi.LabeledFaceDescriptors(label, descriptions);
            })
        )
    }
})();