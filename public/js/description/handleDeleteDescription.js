const handleDeleteDescription = (id, description) => {
    const idInput = document.getElementById('modal-delete-description-id');
    const nameInput = document.getElementById('modal-delete-description');
   
    idInput.value = id;
    nameInput.value = description;

    openModal('modal-delete');
};
