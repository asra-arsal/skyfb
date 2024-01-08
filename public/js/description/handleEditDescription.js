const handleEditDescription = (id, description) => {
    const idInput = document.getElementById('modal-update-description-id');
    const nameInput = document.getElementById('modal-update-description');

    idInput.value = id;
    nameInput.value = description;

    openModal('modal-update');
};
