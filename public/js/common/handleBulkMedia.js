(() => {
    let base64Files_ = [];

    
    // A FUNCTION TO CONVERT A FILE TO ITS BASE64 EQUIVALENT.
    const fileToBase64_ = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };
     // A FUNCTION TO UPDATE THE GALLERY'S VISIBILITY.
     const updateGalleryVisibility_ = (id, files) => {
        const gallery = document.querySelector(`.form-media-gallery[data-form-id="${id}"]`);
        const secondaryGallery = document.querySelector(`.form-media-gallery.secondary[data-form-id="${id}"]`);
        const imagesInput = document.querySelector(`input[name="images"][data-form-id="${id}"]`);
        gallery.classList.add('hidden');
        if (imagesInput.value !== 'null') {
            secondaryGallery.classList.remove('hidden');
        }
        if (files.length !== 0) {
            gallery.classList.remove('hidden');
            secondaryGallery.classList.add('hidden');
        }
    };

    // A FUNCTION TO UPDATE THE MEDIA INPUT'S VALUE.
    const updateMediaInput_ = (id, files) => {
        document.querySelector(`input[name="media"][data-form-id="${id}"]`).value = JSON.stringify(files);
        document.querySelector(`input[name="files"][data-form-id="${id}"]`).value = '';
    };  

    let firstime = true

    // A FUNCTION TO PROCESS FILES AS NEEDED.
    const processFiles_ = async (files) => {
        const filesArray = Array.from(files);
        generateNewPostHtml(firstime ? filesArray.length - 1 : filesArray.length )
        firstime = false
        for (let i = 0; i < filesArray.length; i++) {
            base64Files_ = []
            let id = noOfPosts - filesArray.length + i
            const base64File = await fileToBase64_(filesArray[i]);
            if (!base64Files_?.includes(base64File)) {
                base64Files_.push(base64File);

                const img = document.createElement('img');
                img.src = base64File;
                img.alt = `Image #${i + 1}`;
                img.setAttribute('data-form-id', id);

                img.addEventListener('click', () => {
                    img.parentNode.removeChild(img);

                    const index = base64Files_.indexOf(base64File);

                    if (index > -1) {
                        base64Files_.splice(index, 1);
                    }

                    updateMediaInput_(id, base64Files_);
                    updateGalleryVisibility_(id, base64Files_);
                });

                document.querySelector(`.form-media-gallery[data-form-id="${id}"]`).appendChild(img);
                updateMediaInput_(id, base64Files_);
                updateGalleryVisibility_(id, base64Files_);
            }
        }
    };
    const dropZone = document.querySelector('.form-button.form-button-bulk');

    const fileInput = document.querySelector('[name="bulkfiles"]');
    // A FUNCTION TO WATCH FOR CHANGES IN FILE INPUTS.
    fileInput.addEventListener('change', (evt) => {
        processFiles_(evt.target.files);
    });
    dropZone.addEventListener('click', () => {
        document.querySelector(`input[name="bulkfiles"]`).click();
    });
})();
