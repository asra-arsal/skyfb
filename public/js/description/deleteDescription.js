const deleteDescription = async () => {
    const apiEndpoint = api.description.delete;

    const idInput = document.getElementById('modal-delete-description-id');

    const group = { id: idInput.value };

    const resp = await fetch(apiEndpoint, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(group),
    });
    const { success, error } = await resp.json();

    if (!success) return handleError('There was an error when deleting the description from the database.', error);

    window.location.href = '/description';
};
