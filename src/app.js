import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import * as yup from 'yup';
import buildStateWatcher from './watchers';
import parser from './parser';
import en from './languages/en';

const corsServer = 'https://cors-anywhere.herokuapp.com/';
const updateTime = 5000;

const schema = yup.string().url().required();

const linkValidator = (channels, link) => {
  try {
    schema.notOneOf(channels).validateSync(link);
    return null;
  } catch (validationError) {
    return validationError;
  }
};

const updateFeed = (url, id, watchedState) => {
  axios.get(url)
    .then((response) => {
      const { posts: newPosts } = parser(response.data);
      const oldPosts = watchedState.posts.filter((post) => post.feedId === id);

      const parsedPosts = newPosts.map((post) => ({ ...post, feedId: id }));

      const differentPosts = _.differenceWith(parsedPosts, oldPosts, _.isEqual);

      watchedState.posts.push(...differentPosts);
    })
    .finally(() => {
      setTimeout(() => updateFeed(url, id, watchedState), updateTime);
    });
};

const loadFeed = (url, watchedState, state, rssLink) => {
  watchedState.feedLoader.state = 'download';
  axios.get(url)
    .then((response) => {
      const { title: feedTitle, posts: parsedPosts } = parser(response.data);
      const feedId = _.uniqueId();

      const posts = parsedPosts.map((post) => ({ ...post, feedId }));

      state.posts.push(...posts);

      const feed = {
        link: rssLink,
        feedId,
        name: feedTitle,
      };

      watchedState.feeds.push(feed);
      watchedState.feedLoader.state = 'loaded';
      setTimeout(() => updateFeed(url, feedId, watchedState), updateTime);
    })
    .catch(() => {
      watchedState.feedLoader.errorsMessages = 'downloadError';
      watchedState.feedLoader.state = 'error';
    });
};

export default () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en,
    },
  }).then(() => {
    const state = {
      form: {
        state: 'filling',
        errorsMessages: null,
      },
      feedLoader: {
        state: 'ready',
        errorsMessages: null,
      },
      feeds: [],
      posts: [],
    };

    const watchedState = buildStateWatcher(state);

    const form = document.getElementById('rssForm');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const rssLink = formData.get('url');

      const correctUrl = `${corsServer}${rssLink}`;

      const loadedLinks = state.feeds.map(({ link }) => link);

      const validationErrors = linkValidator(loadedLinks, rssLink);

      if (validationErrors === null) {
        watchedState.form.state = 'valid';
        loadFeed(correctUrl, watchedState, state, rssLink);
      } else {
        watchedState.form.errorsMessages = `validationError.${validationErrors.type}`;
        watchedState.form.state = 'invalid';
      }
    });
  });
};
