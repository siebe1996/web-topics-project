/**
 * @author Van de Voorde Siebe
 * @Version 6-11-2021
 */
;(function () {
    "use strict";


    const predictBtn = document.getElementById('predict-button');
    let imgSelector = document.getElementById('image-selector');
    let predictList = document.getElementById("prediction-list");

    Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    ]).then(loadModel);

    let faceMatcher;
    let image;
    let canvas;
    let container;
    let dict;

    imgSelector.addEventListener('change',async function () {
        if (image) image.remove();
        if (canvas) canvas.remove();
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
        document.querySelector('.progress-bar').style.display = "none";
    }

    predictBtn.addEventListener('click', async () => {
        await start();
    });

    async function start() {
        const displaySize = {width: image.width, height: image.height};
        faceapi.matchDimensions(canvas, displaySize);
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));

        console.log(detections);
        console.log(results);
        while(predictList.firstChild) {
            predictList.removeChild(predictList.firstChild);
        }

        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, {label: result.toString()});
            drawBox.draw(canvas);
            let temp = dict[result._label];
            if (temp === undefined){
                temp = 29;
            }
            let li = document.createElement('li');
            li.appendChild(document.createTextNode(`${result._label}, ideale temperatuur: ${temp}`));
            predictList.appendChild(li);

        });
    }

    function loadLabeledImages() {
        const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark', 'Siebe'];
        createDictPerson(labels);
        return Promise.all(
            labels.map(async label => {
                const descriptions = [];
                for (let i = 1; i <= 2; i++) {
                    const img = await faceapi.fetchImage(`labeled_images/${label}/${i}.jpg` );
                    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                    descriptions.push(detections.descriptor);
                }

                return new faceapi.LabeledFaceDescriptors(label, descriptions);
            })
        )
    }

    function createDictPerson(names){
        dict= {};
        for(let i = 0; i < names.length; i++){
            dict[names[i]] = 27;
        }
        console.log(dict);
    }
})();