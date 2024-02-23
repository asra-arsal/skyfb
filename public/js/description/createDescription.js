const createDescription = async (route) => {
    const apiEndpoint = route === 'create' ? api.description.create : api.description.update;

    const idInput = document.getElementById('modal-update-description-id');
    const nameInput = document.getElementById(`modal-${route}-description`);

    const group = {
        id: idInput.value,
        description: nameInput.value,
    };

    const resp = await fetch(apiEndpoint, {
        method: route === 'create' ? 'POST' : 'PUT',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(group),
    });
    const { success, error } = await resp.json();

    if (!success) return handleError('There was an error when publishing the description to the database.', error);

    window.location.href = '/description';
};


const importDescriptions = async (descriptions) => {
    const apiEndpoint = api.description.import;
    let data = { descriptions: descriptions }
    const resp = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(data),
    });
    const { success, error } = await resp.json();

    if (!success) return handleError('There was an error when publishing the description to the database.', error);

    window.location.href = '/description';
};
