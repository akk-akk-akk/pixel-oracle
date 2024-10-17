// Define your class labels here in the order they were trained
const CLASS_NAMES = ['Signs Point to Yes', 'Concentrate and Ask Again', 'My Sources Say No...']; // Replace with your actual class names

// Load the model
async function loadModel() {
  const model = await tf.loadLayersModel('noise-divination-tm/model.json');
  return model;
}

// Classify an image
async function classifyImage(imageElement) {
  const model = await loadModel();
  
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = imageElement.width;
  canvas.height = imageElement.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageElement, 0, 0);

  // Create tensor from canvas
  const tensor = tf.browser.fromPixels(canvas);
  const resized = tf.image.resizeBilinear(tensor, [224, 224]);
  const normalized = resized.toFloat().div(255);
  const batched = normalized.expandDims(0);
  const predictions = await model.predict(batched);
  const scores = predictions.dataSync();
  const maxScore = Math.max(...scores);
  const maxScoreIndex = scores.indexOf(maxScore);
  const predictedClass = CLASS_NAMES[maxScoreIndex];
  return { class: predictedClass, confidence: maxScore };
}

// Handle image upload and classification
document.getElementById('classify-button').addEventListener('click', async () => {
  const imageInput = document.getElementById('image-input');
  const resultDiv = document.getElementById('result');
  
  if (imageInput.files.length === 0) {
    resultDiv.innerText = 'Please select an image first.';
    return;
  }

  const file = imageInput.files[0];
  const img = new Image();
  img.onload = async () => {
    try {
      const result = await classifyImage(img);
      resultDiv.innerText = `${result.class} (Confidence: ${(result.confidence * 100).toFixed(2)}%)`;
    } catch (error) {
      resultDiv.innerText = `Error: ${error.message}`;
      console.error(error);
    }
  };
  img.onerror = () => {
    resultDiv.innerText = 'Error loading the image.';
  };
  img.src = URL.createObjectURL(file);
});

document.getElementById('image-input').addEventListener('change', function(e) {
  var file = e.target.files[0];
  var imageContainer = document.getElementById('image-container');
  var uploadedImage = document.getElementById('uploaded-image');
  var inputGroup = document.querySelector('.input-group');

  if (file) {
      var reader = new FileReader();
      reader.onload = function(e) {
          uploadedImage.src = e.target.result;
          imageContainer.style.display = 'block';
          inputGroup.querySelector('input[type="file"]').style.display = 'none';
          inputGroup.querySelector('label').style.display = 'none';
      }
      reader.readAsDataURL(file);
  }
});

// document.getElementById('image-input').addEventListener('change', function(e) {
//   var fileName = e.target.files[0].name;
//   var label = document.querySelector('label[for="image-input"]');
//   label.textContent = fileName || 'Choose a file';
// });

document.getElementById('change-image').addEventListener('click', function() {
  resetImageUpload();
  this.style.display = 'none';
});

// Modify the file input change event to show the "Change Image" button
document.getElementById('image-input').addEventListener('change', function(e) {
  // ... (previous code)
  if (file) {
      // ... (previous code)
      document.getElementById('change-image').style.display = 'inline-block';
  }
});

document.getElementById('image-input').addEventListener('change', function(e) {
  var file = e.target.files[0];
  var imageContainer = document.getElementById('image-container');
  var uploadedImage = document.getElementById('uploaded-image');
  var inputGroup = document.querySelector('.input-group');
  var classifyButton = document.getElementById('classify-button');

  if (file) {
      var reader = new FileReader();
      reader.onload = function(e) {
          uploadedImage.src = e.target.result;
          imageContainer.style.display = 'block';
          inputGroup.querySelector('input[type="file"]').style.display = 'none';
          inputGroup.querySelector('label').style.display = 'none';
          
          // Show the classify button
          classifyButton.style.display = 'inline-block';
      }
      reader.readAsDataURL(file);
  }
});

document.getElementById('image-input').addEventListener('change', function(e) {
  var file = e.target.files[0];
  var imageContainer = document.getElementById('image-container');
  var uploadedImage = document.getElementById('uploaded-image');
  var inputGroup = document.querySelector('.input-group');
  var classifyButton = document.getElementById('classify-button');
  var changeImageButton = document.getElementById('change-image');
  var resultDiv = document.getElementById('result');

  if (file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      uploadedImage.src = e.target.result;
      imageContainer.style.display = 'block';
      inputGroup.querySelector('input[type="file"]').style.display = 'none';
      inputGroup.querySelector('label').style.display = 'none';
      
      // Show both buttons
      classifyButton.style.display = 'inline-block';
      changeImageButton.style.display = 'inline-block';
      resultDiv.style.display = 'none';
    }
    reader.readAsDataURL(file);
  } else {
    // If no file is selected, hide the buttons
    classifyButton.style.display = 'none';
    changeImageButton.style.display = 'none';
  }
});

function resetImageUpload() {
  var imageInput = document.getElementById('image-input');
  var imageContainer = document.getElementById('image-container');
  var inputGroup = document.querySelector('.input-group');
  var classifyButton = document.getElementById('classify-button');
  var changeImageButton = document.getElementById('change-image');
  var label = document.querySelector('label[for="image-input"]');
  var resultDiv = document.getElementById('result');

  imageInput.value = ''; // Clear the file input
  imageContainer.style.display = 'none';
  inputGroup.querySelector('input[type="file"]').style.display = 'inline-block';
  label.style.display = 'inline-block';
  label.textContent = 'Provide Source Material'; // Reset the label text
  classifyButton.style.display = 'none';
  changeImageButton.style.display = 'none';
  resultDiv.style.display = 'none';
}

document.getElementById('change-image').addEventListener('click', function() {
  resetImageUpload();
  this.style.display = 'none';
  document.getElementById('classify-button').style.display = 'none';
});

document.getElementById('classify-button').addEventListener('click', async () => {
    const imageInput = document.getElementById('image-input');
    const resultDiv = document.getElementById('result');
    const classifyButton = document.getElementById('classify-button');
    const resultContainer = document.getElementById('result-container');
    
    if (imageInput.files.length === 0) {
        resultDiv.innerText = 'Please select an image first.';
        return;
    }

    // Hide the button and show a loading message
    classifyButton.style.display = 'none';
    resultDiv.innerText = 'Consulting the Oracle...';
    resultDiv.style.display = 'block';

    const file = imageInput.files[0];
    const img = new Image();
    img.onload = async () => {
        try {
            const result = await classifyImage(img);
            resultDiv.innerText = `${result.class} (Confidence: ${(result.confidence * 100).toFixed(2)}%)`;
        } catch (error) {
            resultDiv.innerText = `Error: ${error.message}`;
            console.error(error);
        }
    };
    img.onerror = () => {
        resultDiv.innerText = 'Error loading the image.';
    };
    img.src = URL.createObjectURL(file);
});