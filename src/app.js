import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import buildStateWatcher from './watchers';
import parser from './parser';
import en from './languages/en';
import validator from './validator';

const corsServer = 'https://cors-anywhere.herokuapp.com/';
const updateTime = 5000;

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

const getFeed = (url, watchedState, state, rssLink) => {
  axios.get(url)
    .then((response) => {
      const { feedTitle, posts: parsedPosts } = parser(response.data);
      const feedId = _.uniqueId();

      const posts = parsedPosts.map((post) => ({ ...post, feedId }));

      state.posts.push(...posts);

      const feed = {
        link: rssLink,
      };
      feed.feedId = feedId;
      feed.name = feedTitle;

      watchedState.feeds.push(feed);
      watchedState.form.state = 'data ready';
      setTimeout(() => updateFeed(url, feedId, watchedState), updateTime);
    })
    .catch((error) => {
      watchedState.form.errorsMessages = error;
      watchedState.form.state = 'download error';
    });
};

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

    const loadedChannels = state.feeds.map((feed) => feed.link);

    const validationErrors = validator(loadedChannels, rssLink);

    if (validationErrors === null) {
      watchedState.form.state = 'download';
      getFeed(correctUrl, watchedState, state, rssLink);
    } else {
      const [error] = validationErrors.errors;

      watchedState.form.errorsMessages = error;
      watchedState.form.state = 'invalid';
    }
  });
};
