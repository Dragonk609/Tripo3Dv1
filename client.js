document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Set the maximum value for draftCount
        const draftLimit = document.getElementById('draftLimit');
        draftLimit.textContent = `${200}/${200}`;
    } catch (error) {
        console.error(error);
    }
});

document.getElementById('option').addEventListener('change', function() {
    const selectedOption = this.value;
    const textUpload = document.getElementById('textUpload');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');

    if (selectedOption === 'none') { // Check if the selected option is "None"
        textUpload.style.display = 'none';
        imageUpload.style.display = 'none';
        imagePreview.style.display = 'none';
    } else if (selectedOption === 'text') {
        textUpload.style.display = 'block';
        imageUpload.style.display = 'none';
        imagePreview.style.display = 'none';
    } else if (selectedOption === 'image') {
        textUpload.style.display = 'none';
        imageUpload.style.display = 'block';
        // imagePreview.style.display = 'block'; // Show the image preview when the user selects the "Image to 3D Model" option
    }
});

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = this.files[0];
    const imagePreview = document.getElementById('imagePreview');

    if (!file) {
        imagePreview.style.display = 'none';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
});

document.getElementById('uploadForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const selectedOption = document.getElementById('option').value;
    let formData;

    if (selectedOption === 'text') {
        const textInputField = document.getElementById('textInputField');
        const text = textInputField.value;

        if (!text) {
            alert('Please enter some text.');
            return;
        }

        formData = new FormData();
        formData.append('text', text);
    } else if (selectedOption === 'image') {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];

        if (!file) {
            alert('Please select an image file.');
            return;
        }

        formData = new FormData();
        formData.append('file', file);

        // Display the uploaded image
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    // Show loading indicator
    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    try {
        const response = await fetch(`/generate-model/${selectedOption}`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to generate 3D model.');
        }

        const data = await response.json();
        console.log(data);

        // Hide loading indicator
        loading.style.display = 'none';

        // Show 3D model
        const model = document.getElementById('model');
        model.innerHTML = data.model;
        model.style.display = 'block';
    } catch (error) {
        console.error(error);

        // Display error message
        loading.innerHTML = error.message;
    }
});