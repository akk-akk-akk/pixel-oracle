// Define your class labels here in the order they were trained
const CLASS_NAMES = ['Signs Point to Yes', 'Concentrate and Ask Again', 'My Sources Say No...']; 
// Replace with your actual class names

// Load the model
async function loadModel() {
  try {
    const model = await tf.loadLayersModel('noise-divination-tm/model.json');
    console.log("Model loaded successfully");
    return model;
  } catch (error) {
    console.error("Error loading model:", error);
    throw error;
  }
}

// Classify an image
async function classifyImage(imageElement) {
  const model = await loadModel();
  console.log("Model loaded");
  
  // Create a canvas for image processing
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  
  // Draw and resize the image
  ctx.drawImage(imageElement, 0, 0, 1000, 1000);
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, 1000, 1000);
  const data = imageData.data;
  
  // Convert to black and white threshold
  const threshold = 128;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const color = avg > threshold ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = color;
  }
  
  // Put the modified image data back on the canvas
  ctx.putImageData(imageData, 0, 0);
  
  // Convert to tensor and normalize
  const tensor = tf.browser.fromPixels(canvas, 1); // 1 channel for grayscale
  const normalized = tensor.toFloat().div(255);
  const batched = normalized.expandDims(0);
  
  // Make prediction
  const predictions = await model.predict(batched);
  const scores = predictions.dataSync();
  console.log("Scores:", scores);
  
  // Find the index with the highest score
  let maxScore = 0;
  let maxScoreIndex = 0;
  for (let i = 0; i < scores.length; i++) {
    if (scores[i] > maxScore) {
      maxScore = scores[i];
      maxScoreIndex = i;
    }
  }
  
  const predictedClass = CLASS_NAMES[maxScoreIndex];
  console.log("Predicted class:", predictedClass, "Confidence:", maxScore);
  
  // Clean up tensors
  tensor.dispose();
  normalized.dispose();
  batched.dispose();
  predictions.dispose();
  
  return { class: predictedClass, confidence: maxScore };
}


// Handle image upload and classification
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
      } finally {
          classifyButton.style.display = 'inline-block'; // Show the button again
      }
  };
  img.onerror = () => {
      resultDiv.innerText = 'Error loading the image.';
      classifyButton.style.display = 'inline-block'; // Show the button again
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