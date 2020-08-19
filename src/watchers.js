import onChange from 'on-change';

const urlInput = document.querySelector('[name="url"]');
const statusBlock = document.getElementById('status');
const submitButton = document.getElementById('add-rss');

const state = {
  form: {
    state: 'filling',
    loadedChannels: [],
    errorsMessages: null,
  },
  feeds: [],
  posts: [],
};

const watchedState = onChange(state, (path, value) => {
  if (path === 'form.state') {
    if (value === 'invalid') {
      urlInput.classList.add('invalid');
      statusBlock.innerHTML = `${state.form.errorsMessages}`;
    }
    if (value === 'validation success') {
      urlInput.innerHTML = '';
      urlInput.classList.remove('invalid');
      statusBlock.innerHTML = '';
    }
    if (value === 'download') {
      submitButton.disabled = true;
      const spinner = '<div class="spinner-border text-info" role="status"></div>';
      statusBlock.innerHTML = spinner;
    }
    if (value === 'download error') {
      submitButton.disabled = false;
      state.form.loadedChannels.pop();
      statusBlock.innerHTML = `${state.form.errorsMessages}`;
    }
    if (value === 'data ready') {
      statusBlock.innerHTML = 'RSS has been loaded';
      statusBlock.classList.add('green');
      console.log(state.feeds[0])
      state.feeds.forEach((feed) => {
        console.log(feed)
      });
    }
  }
});

export default watchedState;
