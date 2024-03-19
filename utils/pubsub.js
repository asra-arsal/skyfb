const fs = require('fs');
const path = require('path');

const pub = {
    post: require('../automaton/post'),
    meta: require('../automaton/post.create'),
};

const auth = {
    publisher: {
        page: process.env.PAGE_NAME,
        user: process.env.PROFILE_NAME,
    },
    context: {
        page: process.env.PAGE_LINK,
        group: process.env.GROUP_LINK,
    },
    meta: {
        composer: process.env.META_COMPOSER_LINK,
    },
    useAgent: process.env.USE_USER_AGENT
};

module.exports = async (posts, db) => {
    let end_result = {
        success: true,
        publish_errors: [],
        delete_errors: [],
    };
    let postsToPublish = []
    if (posts.length > 0) {
        for (let i = 0; i < posts.length; i++) {
            let post = { ...posts[i] }
            post.message = post.message === null || post.message === 'null' ? null : post.message;
            post.link = post.link === null || post.link === 'null' ? null : post.link;
            post.media = post.media === null || post.media === 'null' ? null : JSON.parse(post.media);
            post.groups = post.groups === null || post.groups === 'null' ? null : JSON.parse(post.groups);

            if (post?.id && post?.id !== null && post?.id !== 0) {
                const query = `
                    UPDATE
                        Posts
                    SET
                        status = 'active'
                    WHERE
                        id = ?;
                `;
                const params = [post?.id];

                await db.run(query, params);
            }

            // Get the group names instead of IDs.
            if (post?.groups !== null && post?.groups?.length > 0) {
                let groups = [];
                for (let i = 0; i < post.groups.length; i++) {
                    const id = post.groups[i];
                    const group = await db.get('SELECT * FROM groups WHERE id = ?', [id]);
                    groups.push(group.name);
                }
                post.groups = groups;
            }
            if (post.context == "page" || post.bulk === true) {
                if (post.bulk === true) {
                    post.context = "page"
                    post.publisher = "page"
                }
                // const res = await pub.post(post, auth);
                postsToPublish.push({ ...post });
            }
            if ((post.context == "group") && (post?.groups?.length < 1 || !post?.groups)) {
                end_result.publish_errors.push({
                    success: false,
                    data: null,
                    error: {
                        code: 400,
                        type: 'Failed to post to the group.',
                        moment: 'Failed to post to the group. No group selected.',
                        error: "Failed to post to the group.",
                    },
                });
            }
            if (post?.groups?.length > 0) {
                const groups = post?.groups;
                let j = 0;
                for (let i = 0; i < groups?.length; i++) {
                    const name = groups[i];
                    const group = await db.get('SELECT * FROM groups WHERE name = ?', [name]);
                    post.contextDetails = {};
                    post.contextDetails.group = group.link;
                    post.contextDetails.groupName = group.name;
                    post.context = 'group';

                    if (!post.bulk) {
                        postsToPublish.push({ ...post })
                    } else {
                        post.publisher = 'user'
                        postsToPublish.push({ ...post })

                        post.publisher = 'page'
                        postsToPublish.push({ ...post })
                    }
                }
            }
        }
        for (let i = 0; i < posts.length; i++) {
            try {
                const query = `
                                DELETE
                                    FROM
                                        posts
                                    WHERE
                                        id = ?;
                            `;
                const params = [posts[i].id];

                await db.run(query, params);
            } catch (err) {
                if (err) {
                    end_result.delete_errors.push({
                        success: false,
                        data: null,
                        error: {
                            code: 500,
                            type: 'Internal server error.',
                            moment: 'Deleting post from the database.',
                            error: err.toString(),
                        },
                    });
                }
            }
        }
    }
    res = await pub.post(postsToPublish, auth);
    if (!res.success) {
        end_result.publish_errors.push({
            message: 'Failed to post to the group.',
            adaptar: 'Legacy',
            post: postsToPublish,
            res,
        });
    }

    if (end_result.delete_errors.length > 0 || end_result.publish_errors.length > 0) {
        const endest_result = {
            success: false,
            data: null,
            error: {
                code: 3003,
                type: 'PubSub-Unified-Error-Interface',
                moment: 'PubSub-Unified-Publication',
                error: 'Various errors were encountered while trying to publish posts to Pages/Groups and/or removing them from the Database.',
                description: { delete_erros: end_result.delete_errors, publish_errors: end_result.publish_errors },
                publish_errors: end_result.publish_errors,
            },
        };

        const errored_posts = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'errored_posts.json')));

        errored_posts.push(endest_result);

        fs.writeFileSync(path.join(__dirname, '..', 'data', 'errored_posts.json'), JSON.stringify(errored_posts));

        return endest_result;
    } else {
        return end_result;
    }
};
