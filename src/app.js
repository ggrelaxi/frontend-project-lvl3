import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import { watchedPosts, watchedState } from './watchers';
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

  const checkUpdate = (url, id) => {
    axios.get(url)
      .then((response) => {
        const [, newPosts] = parser(response.data);
        const alreadyDownloadPosts = watchedState.posts.filter((post) => post.feedID === id);
        const postToCheck = newPosts.map((post) => {
          const newLoadingPost = post;
          newLoadingPost.feedID = id;
          return newLoadingPost;
        });
        const posts = _.differenceWith(postToCheck, alreadyDownloadPosts, _.isEqual);
        const newData = watchedPosts.posts.concat(posts);
        watchedPosts.posts = newData;
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

    const schema = () => yup.string().url().required().notOneOf(watchedState.form.loadedChannels);
    const corsServer = () => 'https://cors-anywhere.herokuapp.com/';
    const correctUrl = `${corsServer()}${rssLink}`;

    try {
      schema().validateSync(rssLink);
      watchedState.form.loadedChannels.push(rssLink);
      watchedState.form.state = 'validation success';
      watchedState.form.state = 'download';
      axios.get(correctUrl)
        .then((response) => {
          const [feedTitle, posts] = parser(response.data);
          const feedID = _.uniqueId();
          posts.forEach((post) => {
            const newPost = post;
            newPost.feedID = feedID;
            watchedState.posts.push(newPost);
          });
          const feed = {
            feedID,
            name: feedTitle.feedTitle,
          };
          watchedState.feeds.push(feed);
          watchedState.form.state = 'data ready';
          setTimeout(() => checkUpdate(correctUrl, feedID), 5000);
        })
        .catch((e) => {
          watchedState.form.errorsMessages = e;
          watchedState.form.state = 'download error';
        });
    } catch (validationError) {
      const [error] = validationError.errors;
      watchedState.form.errorsMessages = error;
      watchedState.form.state = 'invalid';
    }
  });
};
