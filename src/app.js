import * as yup from 'yup';
import axios from 'axios';
import watchedState from './watchers';

const app = () => {
  const form = document.getElementById('rssForm');

  const downloadRss = (url) => {
    const parser = new DOMParser();
    const correctUrl = `https://cors-anywhere.herokuapp.com/${url}`;

    axios.get(correctUrl)
      .then((response) => {
        const data = parser.parseFromString(response.data, 'text/xml');
        console.log(data.channel.title);
        watchedState.form.data = data;
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
        const data = downloadRss(rssLink);
        let rssData;
        data.then((response) => {
          rssData = response;
        });
        console.log(rssData);
        return rssData;
      })
      .catch((error) => {
        console.log(error)
        watchedState.form.state = 'download error';
        watchedState.form.errorsMessages = error;
        throw new Error();
      })
      .then((data) => {
        watchedState.form.state = 'data ready';
        console.log(data, 'вот тут должны быть данные');
      })
  });
};

export default app;
