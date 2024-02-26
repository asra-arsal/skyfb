const handleDeleteDescription = (id, description, all = '') => {
    const idInput = document.getElementById('modal-delete-description-id');
    const nameInput = document.getElementById('modal-delete-description');
   
    idInput.value = id;
    nameInput.value = description;

    openModal(`modal-delete${all}`);
};
