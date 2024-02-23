const createPost = async (index, type, isNew = true) => {
    const apiType = (isNew) ? 'create' : 'update';
    // const apiType =  'create';
    const apiEndpoint = type === 'publish' ? api.posts.publish : api.posts[apiType];

    let groups = [];
    const groupInputs = document.querySelectorAll(`input[name="groups"][data-form-id="${index}"]:checked`);

    for (let i = 0; i < groupInputs.length; i++) {
        groups.push(parseInt(groupInputs[i].value));
    }
    let array = []

    const post = {
        id: getInput('id', index).value,
        message: getInput('message', index).value ? getInput("message", index).value : getInput('description', index).value,
        link: getInput('link', index).value,
        media: getInput('media', index).value,
        images: getInput('images', index).value,
        bulk: getInput('bulk', index).checked,
        groups,
        context: getInput('context', index).value,
        publisher: getInput('publisher', index).value,
        time: getInput('time', index).value,
        priority: getInput('priority', index).value,
        comment: getInput('comment', index).value,
        type,
    };
    // if (type === 'publish') {
        showLoadingAnimation();
    // }

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
    if(noOfPosts == index + 1){
        location.reload();
    }
};

const getInput = (name, index) => {
    return document.querySelector(`[name="${name}"][data-form-id="${index}"]`);
};
