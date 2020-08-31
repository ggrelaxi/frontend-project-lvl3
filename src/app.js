import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import { buildPostsWatcher, buildStateWatcher } from './watchers';
import parser from './parser';
import en from './languages/en';

export default () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en,
    },
  });

  const state = {
    form: {
      state: 'filling',
      loadedChannels: [],
      errorsMessages: null,
    },
    feeds: [],
    posts: [],
  };

  const stateWatcher = buildStateWatcher(state);
  const postsWatcher = buildPostsWatcher(state);

  const checkUpdate = (url, id) => {
    axios.get(url)
      .then((response) => {
        const [, newPosts] = parser(response.data);
        const alreadyDownloadPosts = stateWatcher.posts.filter((post) => post.feedID === id);
        const postToCheck = newPosts.map((post) => {
          const newLoadingPost = post;
          newLoadingPost.feedID = id;
          return newLoadingPost;
        });
        const posts = _.differenceWith(postToCheck, alreadyDownloadPosts, _.isEqual);
        const newData = postsWatcher.posts.concat(posts);
        postsWatcher.posts = newData;
      })
      .then(() => {
        const timer = () => checkUpdate(url, id);
        setTimeout(timer, 5000);
      });
  };

  const form = document.getElementById('rssForm');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const rssLink = formData.get('url');

    const schema = () => yup.string().url().required().notOneOf(stateWatcher.form.loadedChannels);
    const corsServer = () => 'https://cors-anywhere.herokuapp.com/';
    const correctUrl = `${corsServer()}${rssLink}`;

    try {
      schema().validateSync(rssLink);
      stateWatcher.form.loadedChannels.push(rssLink);
      stateWatcher.form.state = 'validation success';
      stateWatcher.form.state = 'download';
      axios.get(correctUrl)
        .then((response) => {
          const [feedTitle, posts] = parser(response.data);
          const feedID = _.uniqueId();
          posts.forEach((post) => {
            const newPost = post;
            newPost.feedID = feedID;
            stateWatcher.posts.push(newPost);
          });
          const feed = {
            feedID,
            name: feedTitle.feedTitle,
          };
          stateWatcher.feeds.push(feed);
          stateWatcher.form.state = 'data ready';
          setTimeout(() => checkUpdate(correctUrl, feedID), 5000);
        })
        .catch((e) => {
          stateWatcher.form.errorsMessages = e;
          stateWatcher.form.state = 'download error';
        });
    } catch (validationError) {
      const [error] = validationError.errors;
      stateWatcher.form.errorsMessages = error;
      stateWatcher.form.state = 'invalid';
    }
  });
};
