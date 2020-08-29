import onChange from 'on-change';
import i18next from 'i18next';

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
  const urlInput = document.querySelector('[name="url"]');
  const statusBlock = document.getElementById('status');
  const submitButton = document.getElementById('add-rss');
  const channelsContainer = document.getElementById('channels');

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
      const lastAddedFeedNumber = state.feeds.length - 1;
      const { feedID, name: feedName } = state.feeds[lastAddedFeedNumber];
      const feedBlock = document.createElement('div');
      feedBlock.setAttribute('id', feedID);
      const feedTitle = document.createElement('h2');
      feedTitle.innerHTML = feedName;
      feedBlock.append(feedTitle);
      const linksForFeed = state.posts.filter((post) => post.feedID === feedID);
      linksForFeed.forEach((singleLink) => {
        const linkContainer = document.createElement('div');
        const link = document.createElement('a');
        link.setAttribute('href', `${singleLink.link}`);
        link.innerHTML = `${singleLink.postTitle}`;
        linkContainer.append(link);
        feedBlock.append(linkContainer);
      });

      channelsContainer.append(feedBlock);
    }
    // if (value === 'have update') {
    //   const newPost = state.posts[state.posts.length - 1];
    //   const actualChannelId = newPost.feedID;
    //   const actualChannelBlock = document.getElementById(actualChannelId);
    //   const linkContainer = document.createElement('div');
    //   const link = document.createElement('a');
    //   link.setAttribute('href', `${newPost.link}`);
    //   link.innerHTML = `${newPost.postTitle}`;
    //   linkContainer.append(link);
    //   actualChannelBlock.after(linkContainer);
    //   watchedState.form.state = '';
    // }
  }
});

const watchedPosts = onChange(state, (path) => {
  const statusBlock = document.getElementById('status');
  const submitButton = document.getElementById('add-rss');
  const channelsContainer = document.getElementById('channels');

  if (path === 'posts') {
    submitButton.disabled = false;
    statusBlock.innerHTML = i18next.t('rssStatus.success');
    statusBlock.classList.add('green');
    const lastAddedFeedID = state.feeds.length - 1;
    const lastFeed = state.feeds[lastAddedFeedID];
    const feedBlock = document.getElementById(lastFeed.feedID);
    feedBlock.innerHTML = '';
    const feedTitle = document.createElement('h2');
    feedTitle.innerHTML = lastFeed.name;
    feedBlock.append(feedTitle);
    const linkForFeed = state.posts.filter((post) => post.feedID === lastFeed.feedID);
    linkForFeed.forEach((singleLink) => {
      const linkContainer = document.createElement('div');
      const link = document.createElement('a');
      link.setAttribute('href', `${singleLink.link}`);
      link.innerHTML = `${singleLink.postTitle}`;
      linkContainer.append(link);
      feedBlock.append(linkContainer);
    });

    channelsContainer.append(feedBlock);
  }
});

export { watchedState, watchedPosts };
