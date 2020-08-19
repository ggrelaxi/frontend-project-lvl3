import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import watchedState from './watchers';

const app = () => {
  const form = document.getElementById('rssForm');

  const downloadRss = (url) => {
    const parser = new DOMParser();
    const correctUrl = `https://cors-anywhere.herokuapp.com/${url}`;

    axios.get(correctUrl)
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
        console.log(error);
        watchedState.form.errorsMessages = error;
        watchedState.form.state = 'download error';
      });
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const rssLink = formData.get('url');

    const schema = yup.string().url().required().notOneOf(watchedState.form.loadedChannels);
    schema.validate(rssLink)
      .then(() => {
        watchedState.form.loadedChannels.push(rssLink);
        watchedState.form.state = 'validation success';
      })
      .catch((validationError) => {
        const [error] = validationError.errors;
        watchedState.form.errorsMessages = error;
        watchedState.form.state = 'invalid';
        throw new Error();
      })
      .then(() => {
        watchedState.form.state = 'download';
        downloadRss(rssLink);
      })
      .catch((error) => {
        console.log(error)
        watchedState.form.state = 'download error';
        watchedState.form.errorsMessages = error;
        throw new Error();
      })
      .then(() => {
        watchedState.form.state = 'data ready';
      })
  });
};

export default app;
