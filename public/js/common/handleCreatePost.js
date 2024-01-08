const createPost = async (index, type, descriptions = "") => {
    const apiType = index === '0' ? 'create' : 'update';
    const apiEndpoint = type === 'publish' ? api.posts.publish : api.posts[apiType];

    let groups = [];
    const groupInputs = document.querySelectorAll(`input[name="groups"][data-form-id="${index}"]:checked`);

    for (let i = 0; i < groupInputs.length; i++) {
        groups.push(parseInt(groupInputs[i].value));
    }
    const getRandomElement = (array) => {
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    };
    let array = []
    if(descriptions){
        for( let description of JSON.parse(descriptions)) {
            array.push(description.description)
        };
    }
    let mediaLength = getInput('media', index).value ? JSON.parse(getInput('media', index).value).length : 0
    let randomDescription = mediaLength > 0 ? getRandomElement(array) : '';  
    const post = {
        id: getInput('id', index).value,
        message: `${getInput('message', index).value}\n\n${randomDescription == undefined ? "" : randomDescription}` ,
        link: getInput('link', index).value,
        link_description: getInput('link_description', index).value,
        media: getInput('media', index).value,
        images: getInput('images', index).value,

        groups,
        context: getInput('context', index).value,
        publisher: getInput('publisher', index).value,
        time: getInput('time', index).value,
        priority: getInput('priority', index).value,
        type,
    };
    if (type === 'publish') {
        showLoadingAnimation();
    }

    const resp = await fetch(apiEndpoint, {
        method: type === 'publish' ? 'POST' : apiType === 'update' ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(post),
    });
    const { success, error } = await resp.json();

    if (!success) {
        hideLoadingAnimation();
        return handleError('Error encountered when trying to create the Post.', error);
    }

    location.reload();
};

const getInput = (name, index) => {
    return document.querySelector(`[name="${name}"][data-form-id="${index}"]`);
};
