import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import watchedState from './watchers';

const app = () => {
  const form = document.getElementById('rssForm');

  const downloadRss = (url) => {
    const parser = new DOMParser();
    const correctUrl = `https://cors-anywhere.herokuapp.com/${url}`;

    const promise = axios.get(correctUrl)
      .then((response) => {
        const data = parser.parseFromString(response.data, 'text/xml');
        const title = data.querySelector('channel title').textContent;
        const feedID = _.uniqueId();

        watchedState.feeds.push({
          id: feedID,
          title,
        });

        const items = data.querySelectorAll('channel item');

        [...items].forEach((singleElement) => {
          const singleElementTitle = singleElement.querySelector('title').textContent;
          const singleElementLink = singleElement.querySelector('link').textContent;
          watchedState.posts.push({
            id: _.uniqueId(),
            feedId: feedID,
            title: singleElementTitle,
            link: singleElementLink,
          });
        });
      })
      .catch((error) => {
        watchedState.form.errorsMessages = error;
        watchedState.form.state = 'download error';
      });
    return promise;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const rssLink = formData.get('url');

    const schema = yup.string().url().required().notOneOf(watchedState.form.loadedChannels);

    try {
      schema.validateSync(rssLink);
      watchedState.form.loadedChannels.push(rssLink);
      watchedState.form.state = 'validation success';
      watchedState.form.state = 'download';
      downloadRss(rssLink)
        .then(() => {
          watchedState.form.state = 'data ready';
        });
    } catch (validationError) {
      const [error] = validationError.errors;
      watchedState.form.errorsMessages = error;
      watchedState.form.state = 'invalid';
    }
  });
};

export default app;
