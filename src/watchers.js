import onChange from 'on-change';
import i18next from 'i18next';
import en from './languages/en';

const urlInput = document.querySelector('[name="url"]');
const statusBlock = document.getElementById('status');
const submitButton = document.getElementById('add-rss');
const channelsContainer = document.getElementById('channels');

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

const watchedState = onChange(state, (path, value) => {
  if (path === 'form.state') {
    if (value === 'invalid') {
      urlInput.classList.add('invalid');
      statusBlock.classList.add('red');
      statusBlock.innerHTML = `${state.form.errorsMessages}`;
    }
    if (value === 'validation success') {
      urlInput.innerHTML = '';
      urlInput.classList.remove('invalid');
      statusBlock.classList.remove('red');
      statusBlock.innerHTML = '';
    }
    if (value === 'download') {
      submitButton.disabled = true;
      const spinner = `<div class="spinner-border text-info" role="status"></div><span class="load-message">${i18next.t('loading')}</span>`;
      statusBlock.innerHTML = spinner;
    }
    if (value === 'download error') {
      submitButton.disabled = false;
      statusBlock.classList.add('red');
      state.form.loadedChannels.pop();
      statusBlock.innerHTML = `${state.form.errorsMessages}`;
    }
    if (value === 'data ready') {
      submitButton.disabled = false;
      statusBlock.innerHTML = i18next.t('rssStatus.success');
      statusBlock.classList.add('green');
      const lastAddedFeedID = state.feeds.length - 1;
      const lastFeed = state.feeds[lastAddedFeedID];
      const feedBlock = document.createElement('div');
      const feedTitle = document.createElement('h2');
      feedTitle.innerHTML = lastFeed.title;
      feedBlock.append(feedTitle);
      const linkForFeed = state.posts.filter((post) => post.feedId === lastFeed.id);
      linkForFeed.forEach((singleLink) => {
        const linkContainer = document.createElement('div');
        const link = document.createElement('a');
        link.setAttribute('href', `${singleLink.link}`);
        link.innerHTML = `${singleLink.title}`;
        linkContainer.append(link);
        feedBlock.append(linkContainer);
      });

      channelsContainer.append(feedBlock);
    }
  }
});

export default watchedState;
